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
  disabled: boolean;

  signIn: (account: AccountModel.Account) => Promise<void>;
  signOut: (account: AccountModel.Account) => Promise<void>;
  createAccount: (accountId: string) => void;
  checkHours: (account: AccountModel.Account) => void;
};

const getEntryAndAccount = async (accountId: string, seasonId: string) => {
  return Promise.all([
    EntryModel.getActiveEntry({ accountId, seasonId }),
    AccountModel.getAccount(accountId),
  ]);
};

function Login(props: LoginProps) {
  const [inputAccount, setInputAccount] = useState<AccountModel.Account>(null);
  const [inputEntry, setInputEntry] = useState<EntryModel.Entry>(null);
  const [working, setWorking] = useState(false);

  const [accountId, setAccountId] = useState<string>(null);
  const [buttonAction, setButtonAction] = useState(ActionType.CreateAccount);

  // Only update this value every 250ms to prevent excessive database queries
  const debouncedAccountId = useDebounce(accountId, 250);

  const inputRef = useRef(null);
  const actionButtonRef = useRef(null);

  useEffect(() => {
    if (!props.disabled) {
      inputRef.current.focus();
    }
  }, [props.disabled]);

  const handleSignIn = useCallback(
    (account: AccountModel.Account) => {
      setWorking(true);
      props.signIn(account).then(() => {
        setWorking(false);
        setButtonAction(ActionType.CreateAccount);
        setAccountId(null);
      });
    },
    [working, props.signIn],
  );

  const handleSignOut = useCallback(
    (account: AccountModel.Account) => {
      setWorking(true);
      props.signOut(account).then(() => {
        setWorking(false);
        setButtonAction(ActionType.CreateAccount);
        setAccountId(null);
      });
    },
    [working, props.signOut],
  );

  const handleCreateAccount = useCallback((accountId: string) => {
    props.createAccount(accountId);

    setButtonAction(ActionType.CreateAccount);
    setAccountId(null);
  }, [props.createAccount]);

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
  }, [debouncedAccountId, props.seasonId]);

  const actionButtonText = useMemo(
    () => ActionButtonTextMap[buttonAction],
    [buttonAction],
  );
  const handleActionButtonClick = useCallback(async () => {
    if (!accountId) return;

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
      handleCreateAccount(accountId);
    }
  }, [buttonAction, accountId, inputAccount, inputEntry, props.seasonId]);

  const handleCheckHoursClick = useCallback(async () => {
    let account = inputAccount;

    // If we're out of sync with the database (due to debounce), update the account
    if (accountId !== account?.id) {
      account = await AccountModel.getAccount(accountId);
    }

    props.checkHours(account);

    setAccountId(null);
  }, [accountId, inputAccount, props.checkHours]);

  const handleKeyDown = useCallback(
    async (event: any) => {
      if (event.key === 'Enter') {
        // handleActionButtonClick();
        actionButtonRef.current.click()
      }
    },
    [],
  );

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content gap-8 flex-col max-w-xl lg:flex-row-reverse lg:max-w-4xl">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">SERT 2521</h1>
            <p className="py-6">Welcome to the South Eugene Robotics Team. Please sign in using this form when you arrive, and sign out at the end of the day before you leave!</p>
          </div>
          <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
            <div className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Account ID</span>
                </label>
                <input
                  type="text"
                  placeholder="account id"
                  className="input input-bordered"
                  disabled={props.disabled || working}
                  value={accountId ?? ''}
                  onChange={(e) =>
                    setAccountId(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  onBlur={(e) => e.target.focus()}
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                />
              </div>
              <div className="form-control mt-4 grid grid-cols-2 items-center justify-center gap-4">
                <button
                  className="btn btn-primary flex-grow"
                  onClick={handleActionButtonClick}
                  ref={actionButtonRef}
                  disabled={!accountId || working || props.disabled}
                >
                  {actionButtonText}
                </button>

                <button
                  className="btn btn-secondary flex-grow"
                  onClick={handleCheckHoursClick}
                  disabled={!accountId || working || props.disabled}
                >
                  Check Hours
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
