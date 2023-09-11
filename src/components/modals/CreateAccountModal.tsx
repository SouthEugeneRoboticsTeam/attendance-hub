import { useCallback, useEffect, useRef, useState } from 'react';

type CheckHoursModalProps = {
  open: boolean;
  account: { id: string } | null;
  createAccount: (accountId: string, name: string) => any;
  onClose?: () => any;
};

export default function CreateAccountModal(props: CheckHoursModalProps) {
  const { open, account, createAccount, onClose = () => {} } = props;

  const [name, setName] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(null);

    if (open) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!account || !name) return;

    await createAccount(account.id, name);
    onClose();

    setName(null);
  }, [account, name]);

  const handleKeyDown = useCallback(
    async (event: any) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className={`modal ${open && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create Account ({account?.id})</h3>

        <div className="mt-2 flex flex-col">
          <p className="text-sm mb-4">
            Welcome! You will use the ID number you just entered ({account?.id})
            to sign in at the start of every day, and sign out at the end of
            every day. Let's finish making your account.
          </p>

          <label className="label">
            <span className="label-text">Preferred Name</span>
          </label>

          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              className="input input-bordered input-primary w-full"
              value={name ?? ''}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={nameInputRef}
            />
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
