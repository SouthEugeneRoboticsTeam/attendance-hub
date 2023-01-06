import {
  collection,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../utils/firestore';

export interface AccountSeasons {
  [season: string]: number;
}

export interface Account {
  id: string;
  name: string;

  seasons: AccountSeasons;
}

const getUsersRef = () => collection(db!!, 'users');

/**
 * Get an account from the database.
 *
 * @param accountId the id of the account
 * @returns the account
 */
export async function getAccount(accountId: string) {
  if (!accountId) return null;

  const userRef = doc(getUsersRef(), accountId);
  const account = await getDoc(userRef);

  if (!account.exists()) {
    return null;
  }

  return account.data() as Account;
}

/**
 * Create a new account in the database.
 *
 * @param accountId the id of the account
 * @param name the name of the account
 * @returns the account that was created
 */
export async function createAccount(accountId: string, name: string) {
  const account = {
    id: accountId,
    name,

    seasons: {},
  } as Account;

  await setDoc(doc(getUsersRef(), accountId), account);

  return account;
}

/**
 * Get all accounts from the database.
 *
 * @param seasonId the season id (optional)
 * @returns the accounts
 */
export async function getAllAccounts(seasonId?: string) {
  const q = seasonId
    ? query(getUsersRef(), where(new FieldPath('seasons', seasonId), '>', 0))
    : getUsersRef();
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((i) => i.data() as Account);
}
