import exceljs from 'exceljs';

import { Account } from '../models/Account';
import { Entry } from '../models/Entry';

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
    timeOut: new Date(entry.timeOut).toLocaleString(),
    total: (entry.timeOut - entry.timeIn) / (3600 * 1000),
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
