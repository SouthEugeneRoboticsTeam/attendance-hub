import * as exceljs from 'exceljs';
import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';

import { Account, getAllAccounts } from '../models/Account';
import { Entry, getAllEntries } from '../models/Entry';

function getTimeOut(entry: Entry) {
  if (entry.timeOut > 0) {
    return new Date(entry.timeOut).toLocaleString();
  } else if (entry.timeOut === -1) {
    return 'did not sign out';
  } else if (entry.timeOut === 0) {
    return 'signed in';
  }
}

function getTotal(entry: Entry) {
  if (entry.timeOut > 0) {
    return (entry.timeOut - entry.timeIn) / (3600 * 1000);
  } else {
    return null;
  }
}

async function exportToXlsx(accounts: Account[], entries: Entry[]) {
  const workbook = new exceljs.Workbook();
  workbook.calcProperties.fullCalcOnLoad = true;

  const seasons = Array.from(new Set(entries.map((e) => e.seasonId))).sort(
    (a, b) => (a > b ? -1 : 1),
  );

  // Create accounts worksheet
  const accountsWorksheet = workbook.addWorksheet('All Accounts');

  accountsWorksheet.columns = [
    { header: 'Account ID', key: 'accountId', width: 30 },
    { header: 'Name', key: 'name', width: 30 },
    { header: '# Seasons', key: 'seasonCount', width: 30 },
  ];

  const accountRows = accounts.map((account) => ({
    accountId: account.id,
    name: account.name,
    seasonCount: Object.keys(account?.seasons ?? {}).length,
  }));

  accountsWorksheet.addRows(accountRows);

  // Create entries worksheet
  const entriesWorksheet = workbook.addWorksheet('All Entries');

  entriesWorksheet.columns = [
    { header: 'Account ID', key: 'accountId', width: 30 },
    { header: 'Season', key: 'seasonId', width: 30 },
    { header: 'Time In', key: 'timeIn', width: 30 },
    { header: 'Time Out', key: 'timeOut', width: 30 },
    { header: 'Total', key: 'total', width: 30 },
  ];

  const entryRows = entries.map((entry) => ({
    accountId: entry.accountId,
    seasonId: entry.seasonId,
    timeIn: new Date(entry.timeIn).toLocaleString(),
    timeOut: getTimeOut(entry),
    total: getTotal(entry),
  }));

  entriesWorksheet.addRows(entryRows);

  // Create season-specific worksheets
  for (const seasonId of seasons) {
    const seasonWorksheet = workbook.addWorksheet(`${seasonId} Accounts`);

    seasonWorksheet.columns = [
      { header: 'Account ID', key: 'accountId', width: 30 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Total', key: 'total', width: 30 },
    ];

    const seasonRows = accounts
      .filter((i) => i.seasons[seasonId])
      .map((account) => ({
        accountId: account.id,
        name: account.name,
        total: account.seasons[seasonId] / (3600 * 1000),
      }));

    seasonWorksheet.addRows(seasonRows);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}

export async function exportData() {
  const accounts = await getAllAccounts();
  const entries = await getAllEntries();

  if (!entries) {
    return;
  }

  const buffer = await exportToXlsx(accounts, entries);

  const savePath = await save({
    title: 'sert-attendance.xlsx',
    defaultPath: 'sert-attendance.xlsx',
  });

  if (!savePath) {
    return;
  }

  await writeBinaryFile(savePath, buffer);
}
