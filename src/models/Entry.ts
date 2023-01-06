import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../utils/firestore';

export interface EntryKeys {
  accountId: string;
  seasonId: string;
}

export interface Entry extends EntryKeys {
  timeIn: number;
  timeOut: number;

  total?: number;
}

const getEntriesRef = () => collection(db!!, 'entries');
const getUsersRef = () => collection(db!!, 'users');
const getSeasonsRef = () => collection(db!!, 'seasons');

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
  const q = query(getEntriesRef(), ...constraints);
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
  const q = query(getEntriesRef(), ...constraints, where('timeOut', '==', 0));
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
export async function getAllEntries(
  seasonId: string | null = null,
  activeOnly = false,
) {
  const constraints = [];

  if (seasonId) {
    constraints.push(where('seasonId', '==', seasonId));
  }

  if (activeOnly) {
    constraints.push(where('timeOut', '==', 0));
  }

  const q = query(getEntriesRef(), ...constraints);
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

  await addDoc(getEntriesRef(), entry);

  return entry;
}

/**
 * Sign out of the current entry.
 *
 * @param accountId the account id of the user
 * @param seasonId the current season
 * @param forfeitTime whether to forfeit the logged time (i.e. do not tally the time with the user's total)
 */
export async function signOut(
  accountId: string,
  seasonId: string,
  forfeitTime = false,
) {
  const timeOut = Date.now();

  const q = query(
    getEntriesRef(),
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

  if (forfeitTime) {
    // Do not tally the time with the user's total
    await updateDoc(entryDoc, { timeOut: -1, total: 0 });
  } else {
    await runTransaction(db!!, async (transaction) => {
      const userDoc = doc(getUsersRef(), accountId);
      const seasonDoc = doc(getSeasonsRef(), seasonId);

      const season = await transaction.get(seasonDoc);

      transaction.update(entryDoc, { timeOut, total });
      transaction.update(userDoc, {
        [`seasons.${seasonId}`]: increment(total),
      });

      if (season.exists()) {
        transaction.update(seasonDoc, { total: increment(total) });
      } else {
        transaction.set(seasonDoc, { total });
      }
    });
  }

  return { ...entry, timeOut, total } as Entry;
}
