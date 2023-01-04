import { Fragment, useEffect, useRef } from 'react';

import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';

import { Account } from '../../models/Account';

type SignInModalProps = {
  open: boolean;
  account: Account;
  seasonId: string;
  onClose?: () => any;
};

export default function SignInModal(props: SignInModalProps) {
  const { open, account, seasonId, onClose = () => {} } = props;

  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => closeButtonRef.current.focus(), 50);

      const timeout = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className={`modal ${open && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Welcome, {account?.name}!</h3>

        <div className="mt-2">
          <p className="text-sm">
            You have successfully signed in.
          </p>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose} ref={closeButtonRef}>Close</button>
        </div>
      </div>
    </div>
  );
}
