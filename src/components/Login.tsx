import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useDebounce from '../utils/useDebounce';

import * as AccountModel from '../models/Account';
import * as EntryModel from '../models/Entry';

enum ActionType {
  SignIn,
  SignOut,
  CreateAccount,
}

const ActionButtonTextMap = {
  [ActionType.SignIn]: 'Sign In',
  [ActionType.SignOut]: 'Sign Out',
  [ActionType.CreateAccount]: 'Create Account',
};

type LoginProps = {
  seasonId: string;

  getAccount: (accountId: string) => Promise<any>;
  getCurrentEntry: (accountId: string) => Promise<any>;

  signIn: (account: AccountModel.Account) => Promise<void>;
  signOut: (account: AccountModel.Account) => Promise<void>;
  createAccount: (accountId: string) => Promise<void>;
  checkHours: (account: AccountModel.Account) => Promise<void>;
};

const getEntryAndAccount = async (accountId: string, seasonId: string) => {
  return Promise.all([
    EntryModel.getCurrentEntry({ accountId, seasonId }),
    AccountModel.getAccount(accountId),
  ]);
};

function Login(props: LoginProps) {
  const [inputAccount, setInputAccount] = useState<AccountModel.Account>(null);
  const [inputEntry, setInputEntry] = useState<EntryModel.Entry>(null);

  const [accountId, setAccountId] = useState<string>(null);
  const [buttonAction, setButtonAction] = useState(ActionType.CreateAccount);

  // Only update this value every 250ms to prevent excessive database queries
  const debouncedAccountId = useDebounce(accountId, 250);

  const actionButton = useRef(null);

  const handleSignIn = useCallback(
    async (account: AccountModel.Account) => {
      await props.signIn(account);

      setButtonAction(ActionType.CreateAccount);
      setAccountId(null);
    },
    [accountId],
  );

  const handleSignOut = useCallback(
    async (account: AccountModel.Account) => {
      await props.signOut(account);

      setButtonAction(ActionType.CreateAccount);
      setAccountId(null);
    },
    [accountId],
  );

  const handleCreateAccount = useCallback(async () => {
    await props.createAccount(accountId);

    setButtonAction(ActionType.CreateAccount);
    setAccountId(null);
  }, [accountId]);

  useEffect(() => {
    if (!accountId) {
      setButtonAction(ActionType.CreateAccount);
      setInputEntry(null);
      setInputAccount(null);
      return;
    }

    const updateButtons = async () => {
      const [entry, account] = await getEntryAndAccount(
        accountId,
        props.seasonId,
      );

      setInputEntry(entry);
      setInputAccount(account);

      if (entry) {
        setButtonAction(ActionType.SignOut);
      } else if (account) {
        setButtonAction(ActionType.SignIn);
      } else {
        setButtonAction(ActionType.CreateAccount);
      }
    };

    updateButtons();
  }, [debouncedAccountId]);

  const actionButtonText = useMemo(
    () => ActionButtonTextMap[buttonAction],
    [buttonAction],
  );
  const handleActionButtonClick = useCallback(async () => {
    let entry = inputEntry;
    let account = inputAccount;

    // If we're out of sync with the database (due to debounce), update the entry and account
    if (accountId !== account?.id) {
      [entry, account] = await getEntryAndAccount(accountId, props.seasonId);
    }

    if (entry) {
      handleSignOut(account);
    } else if (account) {
      handleSignIn(account);
    } else {
      handleCreateAccount();
    }
  }, [buttonAction, accountId, inputAccount, inputEntry]);

  const handleCheckHoursClick = useCallback(async () => {
    let account = inputAccount;

    // If we're out of sync with the database (due to debounce), update the account
    if (accountId !== account?.id) {
      account = await AccountModel.getAccount(accountId);
    }

    await props.checkHours(account);

    setAccountId(null);
  }, [accountId, inputAccount, props.checkHours]);

  const handleKeyDown = useCallback(
    async (event: any) => {
      if (event.key === 'Enter') {
        handleActionButtonClick();
      }
    },
    [handleActionButtonClick],
  );

  return (
    <>
      <div className="m-auto w-1/5">
        <label
          htmlFor="account"
          className="block text-sm font-medium text-gray-700"
        >
          Account ID
        </label>

        <div className="mt-1">
          <input
            type="text"
            name="account"
            id="account"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={accountId ?? ''}
            onChange={(e) =>
              setAccountId(e.target.value.replace(/[^0-9]/g, ''))
            }
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="mt-1 w-full flex flex-row items-center justify-around">
          <button
            type="submit"
            className="w-[165px] justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleActionButtonClick}
            ref={actionButton}
            disabled={!accountId}
          >
            {actionButtonText}
          </button>

          <button
            type="submit"
            className="w-[165px] justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleCheckHoursClick}
            disabled={!accountId}
          >
            Check Hours
          </button>
        </div>
      </div>
    </>
  );
}

export default Login;
