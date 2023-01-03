import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import * as AccountModel from "../models/Account";
import * as EntryModel from "../models/Entry";

enum ActionType {
  SignIn,
  SignOut,
  CreateAccount,
}

const ActionButtonTextMap = {
  [ActionType.SignIn]: "Sign In",
  [ActionType.SignOut]: "Sign Out",
  [ActionType.CreateAccount]: "Create Account",
}

type LoginProps = {
  seasonId: string

  getAccount: (accountId: string) => Promise<any>
  getCurrentEntry: (accountId: string) => Promise<any>

  signIn: (accountId: string) => Promise<void>
  signOut: (accountId: string) => Promise<void>
  createAccount: (accountId: string) => Promise<void>
  checkHours: (accountId: string) => Promise<void>
}

function Login(props: LoginProps) {
  const [accountId, setAccountId] = useState("")
  const [buttonAction, setButtonAction] = useState(ActionType.CreateAccount);

  const actionButton = useRef(null)

  const handleSignIn = useCallback(async () => {
    await props.signIn(accountId);

    setButtonAction(ActionType.CreateAccount);
    setAccountId("");
  }, [accountId]);

  const handleSignOut = useCallback(async () => {
    console.log('calling signout')
    await props.signOut(accountId);

    setButtonAction(ActionType.CreateAccount);
    setAccountId("");
  }, [accountId]);

  const handleCreateAccount = useCallback(async () => {
    await props.createAccount(accountId);

    setButtonAction(ActionType.CreateAccount);
    setAccountId("");
  }, [accountId]);

  const handleCheckHours = useCallback(async () => {
    await props.checkHours(accountId);
  }, [accountId]);

  const handleKeyDown = useCallback(async (event: any) => {
    if (event.key === 'Enter') {
      actionButton.current.click();
    }
  }, [accountId, actionButton])

  useEffect(() => {
    if (!accountId) {
      setButtonAction(ActionType.CreateAccount);
      return;
    }

    // const entry = await EntryModel.getCurrentEntry({ accountId, seasonId: props.seasonId })

    const updateButtons = async () => {
      const [entry, account] = await Promise.all([
        EntryModel.getCurrentEntry({ accountId, seasonId: props.seasonId }),
        AccountModel.getAccount(accountId),
      ]);

      if (entry) {
        setButtonAction(ActionType.SignOut);
      } else if (account) {
        setButtonAction(ActionType.SignIn);
      } else {
        setButtonAction(ActionType.CreateAccount);
      }
    }

    updateButtons();
  }, [accountId])

  const ActionButtonCallbackMap = {
    [ActionType.SignIn]: handleSignIn,
    [ActionType.SignOut]: handleSignOut,
    [ActionType.CreateAccount]: handleCreateAccount,
  };

  const actionButtonText = useMemo(() => ActionButtonTextMap[buttonAction], [buttonAction]);
  const handleActionButtonClick = useCallback(ActionButtonCallbackMap[buttonAction], [buttonAction, accountId]);

  return (
    <>
      <div className="m-auto w-1/5">
        <label htmlFor="account" className="block text-sm font-medium text-gray-700">
          Account ID
        </label>

        <div className="mt-1">
          <input
            type="text"
            name="account"
            id="account"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"

            value={accountId}
            onChange={(e) => setAccountId(e.target.value.replace(/[^0-9]/g, ""))}

            onKeyUp={handleKeyDown}
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
            onClick={handleCheckHours}
            disabled={!accountId}
          >
            Check Hours
          </button>
        </div>
      </div>
    </>
  )
}

export default Login
