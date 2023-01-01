import { useCallback, useMemo, useRef, useState } from "react";

import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import CheckHoursModal from "../components/CheckHoursModal";
import CreateAccountModal from "../components/CreateAccountModal";
import SignInModal from "../components/SignInModal";
import SignOutModal from "../components/SignOutModal";
import { db } from "../utils/firestore";

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

function App() {
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [checkHoursModalOpen, setCheckHoursModalOpen] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [buttonAction, setButtonAction] = useState(ActionType.CreateAccount);

  const actionButton = useRef(null)

  const handleSignIn = useCallback(async () => {
    // TODO: firebase signin
    const usersRef = collection(db, "users");
    await updateDoc(doc(usersRef, accountId), { signedIn: true });

    setSignInModalOpen(true);
    setButtonAction(ActionType.CreateAccount);
    setAccountId("");
  }, [accountId]);

  const handleSignOut = useCallback(async () => {
    // TODO: firebase signout
    const usersRef = collection(db, "users");
    await updateDoc(doc(usersRef, accountId), { signedIn: false });

    setSignOutModalOpen(true);
    setButtonAction(ActionType.CreateAccount);
    setAccountId("");
  }, [accountId]);

  const handleCreateAccount = useCallback(async () => {
    const usersRef = collection(db, "users");
    console.log(usersRef, accountId);

    await setDoc(doc(usersRef, accountId), { name: "Andrew Dassonville", signedIn: true });

    setSignInModalOpen(true);
    setButtonAction(ActionType.CreateAccount);
    setAccountId("");
  }, [accountId]);

  const handleCheckHours = useCallback(async () => {
    // TODO: firebase get hours

    setCheckHoursModalOpen(true);
  }, []);

  const handleKeyDown = useCallback(async (event: any) => {
    if (event.key === 'Enter') {
      actionButton.current.click();
      return;
    }

    const id = event.target.value;

    if (!id) {
      setButtonAction(ActionType.CreateAccount);
      return;
    }

    // TODO: lookup account id and change button action based on current state
    // this should be debounced to only run once every 500ms
    const usersRef = collection(db, "users");
    const docSnap = await getDoc(doc(usersRef, id));

    if (docSnap.exists()) {
      const { signedIn } = docSnap.data();

      setButtonAction(signedIn ? ActionType.SignOut : ActionType.SignIn);
    } else {
      setButtonAction(ActionType.CreateAccount);
    }
  }, [actionButton])


  const ActionButtonCallbackMap = {
    [ActionType.SignIn]: handleSignIn,
    [ActionType.SignOut]: handleSignOut,
    [ActionType.CreateAccount]: handleCreateAccount,
  };

  const actionButtonText = useMemo(() => ActionButtonTextMap[buttonAction], [buttonAction]);
  const handleActionButtonClick = useCallback(ActionButtonCallbackMap[buttonAction], [buttonAction, accountId]);

  return (
    <>
      <SignInModal open={signInModalOpen} name="Andrew Dassonville" onClose={() => setSignInModalOpen(false)} />
      <SignOutModal open={signOutModalOpen} name="Andrew Dassonville" onClose={() => setSignOutModalOpen(false)} />
      <CreateAccountModal open={createAccountModalOpen} onClose={() => setCreateAccountModalOpen(false)} />
      <CheckHoursModal open={checkHoursModalOpen} name="Andrew Dassonville" hours={1.25} onClose={() => setCheckHoursModalOpen(false)} />

      <main className="flex mx-auto px-4 sm:px-6 lg:px-8 pt-10 h-screen">
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
      </main>
    </>
  );
}

export default App;
