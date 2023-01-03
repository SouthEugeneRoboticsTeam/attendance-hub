import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';
import { db } from '../utils/firestore';

export class EntryKeys {
  accountId: string;
  seasonId: string;
}

export class Entry extends EntryKeys {
  timeIn: number;
  timeOut: number;

  total?: number;
}

const entriesRef = collection(db, 'entries');
const usersRef = collection(db, 'users');
const seasonsRef = collection(db, 'seasons');

/**
 * Get entries from the database.
 *
 * @param conditions the conditions on which to query for entries (accountId, season)
 * @returns the entries that match the conditions
 */
export async function getEntries(conditions: Partial<EntryKeys>) {
  const constraints = Object.entries(conditions).map(([key, value]) =>
    where(key, '==', value),
  );
  const q = query(entriesRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => doc.data()) as Entry[];
}

/**
 * Get the current entry from the database.
 *
 * @param conditions the conditions on which to query for entries (accountId, season)
 * @returns the current entry that matches the conditions
 */
export async function getActiveEntry(conditions: Partial<EntryKeys>) {
  const constraints = Object.entries(conditions).map(([key, value]) =>
    where(key, '==', value),
  );
  const q = query(entriesRef, ...constraints, where('timeOut', '==', 0));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs[0]?.data() as Entry;
}

/**
 * Get all entries from the database.
 *
 * @param seasonId the season id
 * @param activeOnly whether to only get active entries
 * @returns the entries that match the conditions
 */
export async function getAllEntries(seasonId: string, activeOnly = false) {
  const constraints = [where('seasonId', '==', seasonId)];
  if (activeOnly) {
    constraints.push(where('timeOut', '==', 0));
  }

  const q = query(entriesRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((i) => i.data() as Entry);
}

/**
 * Create a new sign in entry in the database.
 *
 * @param accountId the account id of the user
 * @param seasonId the current season
 * @returns the entry that was created
 */
export async function signIn(accountId: string, seasonId: string) {
  const timeIn = Date.now();
  const entry = {
    accountId,
    seasonId,

    timeIn,
    timeOut: 0,
  } as Entry;

  await addDoc(entriesRef, entry);

  return entry;
}

/**
 * Sign out of the current entry.
 *
 * @param accountId the account id of the user
 * @param seasonId the current season
 */
export async function signOut(accountId: string, seasonId: string) {
  const timeOut = Date.now();

  const q = query(
    entriesRef,
    where('accountId', '==', accountId),
    where('seasonId', '==', seasonId),
    where('timeOut', '==', 0),
  );
  const querySnapshot = await getDocs(q);

  const entryDoc = querySnapshot.docs[0]?.ref;
  const entry = querySnapshot.docs[0]?.data();

  if (!entry) {
    throw new Error('No entry found');
  }

  const total = timeOut - entry.timeIn;

  await runTransaction(db, async (transaction) => {
    const userDoc = doc(usersRef, accountId);
    const seasonDoc = doc(seasonsRef, seasonId);

    const season = await transaction.get(seasonDoc);

    transaction.update(entryDoc, { timeOut, total });
    transaction.update(userDoc, { [`seasons.${seasonId}`]: increment(total) });

    if (season.exists()) {
      transaction.update(seasonDoc, { total: increment(total) });
    } else {
      transaction.set(seasonDoc, { total });
    }
  });

  return { ...entry, timeOut, total } as Entry;
}
