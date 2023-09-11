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

const getUsersRef = () => db && collection(db!!, 'users');

/**
 * Get an account from the database.
 *
 * @param accountId the id of the account
 * @returns the account
 */
export async function getAccount(accountId: string) {
  if (!accountId) return null;

  const usersRef = getUsersRef();
  if (!usersRef) return null;

  const userRef = doc(usersRef, accountId);
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

  const usersRef = getUsersRef();
  if (!usersRef) return null;

  await setDoc(doc(usersRef, accountId), account);

  return account;
}

/**
 * Get all accounts from the database.
 *
 * @param seasonId the season id (optional)
 * @returns the accounts
 */
export async function getAllAccounts(seasonId?: string) {
  const usersRef = getUsersRef();
  if (!usersRef) return [];

  const q = seasonId
    ? query(usersRef, where(new FieldPath('seasons', seasonId), '>', 0))
    : usersRef;
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((i) => i.data() as Account);
}
