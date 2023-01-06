import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Login from '../components/Login';
import CheckHoursModal from '../components/modals/CheckHoursModal';
import ConfigModal from '../components/modals/ConfigModal';
import CreateAccountModal from '../components/modals/CreateAccountModal';
import NoConnectionModal from '../components/modals/NoConnectionModal';
import SignInModal from '../components/modals/SignInModal';
import SignOutModal from '../components/modals/SignOutModal';

import * as AccountModel from '../models/Account';
import * as EntryModel from '../models/Entry';
import { db } from '../utils/firestore';

import useConfig from '../utils/useConfig';
import useConnection from '../utils/useConnection';

function App() {
  const [showDbWarning, setShowDbWarning] = useState(false);
  const isConnected = useConnection();

  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [checkHoursModalOpen, setCheckHoursModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const modals = [
    !isConnected,
    signInModalOpen,
    signOutModalOpen,
    createAccountModalOpen,
    checkHoursModalOpen,
    configModalOpen,
  ];
  const modalOpen = useMemo(() => modals.some(Boolean), modals);

  const [account, setAccount] = useState<AccountModel.Account | null>(null);
  const [entry, setEntry] = useState<EntryModel.Entry | null>(null);

  useHotkeys('ctrl+shift+c', () => setConfigModalOpen(true), {
    enableOnFormTags: true,
  });

  const config = useConfig();
  const seasonId = useMemo(() => config?.seasonId ?? 'default', [config]);

  const signIn = useCallback(
    async (account: AccountModel.Account) => {
      const entry = await EntryModel.signIn(account.id, seasonId);

      if (account) {
        setAccount(account);
        setEntry(entry);
        setSignInModalOpen(true);
      }
    },
    [seasonId],
  );

  const signOut = useCallback(
    async (account: AccountModel.Account) => {
      const entry = await EntryModel.signOut(account.id, seasonId);

      // signOut() updates account time, so account is now stale -- update manually here (rather than querying database again)
      if (account.seasons[seasonId]) {
        account.seasons[seasonId] += entry.total ?? 0;
      } else {
        account.seasons[seasonId] = entry.total ?? 0;
      }

      if (account) {
        setAccount(account);
        setEntry(entry);
        setSignOutModalOpen(true);
      }
    },
    [seasonId],
  );

  const createAccount = useCallback(
    async (accountId: string, name: string) => {
      let account = await AccountModel.getAccount(accountId);
      let entry: EntryModel.Entry | null = null;

      if (!account) {
        account = await AccountModel.createAccount(accountId, name);
      }

      entry = await EntryModel.signIn(accountId, seasonId);

      setAccount(account);
      setEntry(entry);
      setSignInModalOpen(true);
    },
    [seasonId],
  );

  const checkHours = useCallback((account: AccountModel.Account) => {
    setAccount(account);
    setCheckHoursModalOpen(true);
  }, []);

  const startCreateAccount = useCallback((accountId: string) => {
    setAccount({ id: accountId } as any);
    setCreateAccountModalOpen(true);
  }, []);

  useEffect(() => {
    if (!db) {
      setShowDbWarning(true);
    }
  }, [db]);

  if (showDbWarning) {
    return (
      <h1>
        Please configure <code>firebase.json</code> and restart the app.
      </h1>
    );
  }

  return (
    <>
      <SignInModal
        open={signInModalOpen}
        account={account}
        seasonId={seasonId}
        onClose={() => setSignInModalOpen(false)}
      />
      <SignOutModal
        open={signOutModalOpen}
        account={account}
        entry={entry}
        seasonId={seasonId}
        onClose={() => setSignOutModalOpen(false)}
      />
      <CreateAccountModal
        open={createAccountModalOpen}
        account={account}
        createAccount={createAccount}
        onClose={() => setCreateAccountModalOpen(false)}
      />
      <CheckHoursModal
        open={checkHoursModalOpen}
        account={account}
        seasonId={seasonId}
        onClose={() => setCheckHoursModalOpen(false)}
      />
      <ConfigModal
        open={configModalOpen}
        seasonId={seasonId}
        onClose={() => setConfigModalOpen(false)}
      />
      <NoConnectionModal open={!isConnected} />

      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex flex-col  min-h-full justify-center max-w-xl lg:max-w-4xl">
          <div className="flex flex-col lg:flex-row-reverse gap-8">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold">SERT 2521</h1>
              <p className="py-6">
                Welcome to the South Eugene Robotics Team. Please sign in using
                this form when you arrive, and sign out at the end of the day
                before you leave!
              </p>
            </div>

            <Login
              seasonId={seasonId}
              disabled={modalOpen}
              signIn={signIn}
              signOut={signOut}
              createAccount={startCreateAccount}
              checkHours={checkHours}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
