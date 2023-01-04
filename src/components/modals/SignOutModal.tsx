import { useEffect, useRef } from 'react';

import { Account } from '../../models/Account';
import { Entry } from '../../models/Entry';
import { millisToHours } from '../../utils/format';

type SignOutModalProps = {
  open: boolean;
  account: Account;
  entry: Entry;
  seasonId: string;
  onClose?: () => any;
};

export default function SignOutModal(props: SignOutModalProps) {
  const { open, account, entry, seasonId, onClose = () => {} } = props;

  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => closeButtonRef.current.focus(), 50);

      const timeout = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className={`modal ${open && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Goodbye, {account?.name}!</h3>

        <div className="mt-2">
          <p className="text-sm">
            You have successfully signed out, and{' '}
            <b>{millisToHours(entry?.total)} hours</b> have been logged. Your
            new total for <b>{seasonId}</b> is{' '}
            <b>{millisToHours(account?.seasons?.[seasonId])} hours</b>.
          </p>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose} ref={closeButtonRef}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
