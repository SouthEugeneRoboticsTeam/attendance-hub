import { useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import Login from '../components/Login';
import CheckHoursModal from '../components/modals/CheckHoursModal';
import ConfigModal from '../components/modals/ConfigModal';
import CreateAccountModal from '../components/modals/CreateAccountModal';
import SignInModal from '../components/modals/SignInModal';
import SignOutModal from '../components/modals/SignOutModal';

import * as AccountModel from '../models/Account';
import * as EntryModel from '../models/Entry';

import useConfig from '../utils/useConfig';

function App() {
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [checkHoursModalOpen, setCheckHoursModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const modals = [
    signInModalOpen,
    signOutModalOpen,
    createAccountModalOpen,
    checkHoursModalOpen,
    configModalOpen,
  ];
  const modalOpen = useMemo(() => modals.some(Boolean), modals);

  const [account, setAccount] = useState<AccountModel.Account>(null);
  const [entry, setEntry] = useState<EntryModel.Entry>(null);

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
        account.seasons[seasonId] += entry.total;
      } else {
        account.seasons[seasonId] = entry.total;
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
      let entry: EntryModel.Entry = null;

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

      {/* <main className="flex mx-auto px-4 sm:px-6 lg:px-8 pt-10 h-screen"> */}
      <Login
        seasonId={seasonId}
        disabled={modalOpen}
        signIn={signIn}
        signOut={signOut}
        createAccount={startCreateAccount}
        checkHours={checkHours}
      />
      {/* </main> */}
    </>
  );
}

export default App;
