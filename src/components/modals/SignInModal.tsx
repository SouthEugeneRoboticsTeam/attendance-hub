import { useEffect, useRef } from 'react';

import { Account } from '../../models/Account';

type SignInModalProps = {
  open: boolean;
  account: Account | null;
  seasonId: string;
  onClose?: () => any;
};

export default function SignInModal(props: SignInModalProps) {
  const { open, account, seasonId, onClose = () => {} } = props;

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);

      const timeout = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className={`modal ${open && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Welcome, {account?.name}!</h3>

        <div className="mt-2">
          <p className="text-sm">You have successfully signed in.</p>
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
