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
            Welcome! You will use the ID number you just entered to sign in at
            the start of every day, and sign out at the end of every day. Let's
            finish making your account.
          </p>

          {/* <label
            htmlFor="name"
            className="block mt-2 text-sm text-left font-medium text-gray-700"
          >
            Preferred Name
          </label> */}
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

  // return (
  //   <Transition.Root show={open} as={Fragment}>
  //     <Dialog
  //       as="div"
  //       className="relative z-10"
  //       initialFocus={nameInputRef}
  //       onClose={onClose}
  //     >
  //       <Transition.Child
  //         as={Fragment}
  //         enter="ease-out duration-300"
  //         enterFrom="opacity-0"
  //         enterTo="opacity-100"
  //         leave="ease-in duration-200"
  //         leaveFrom="opacity-100"
  //         leaveTo="opacity-0"
  //       >
  //         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
  //       </Transition.Child>

  //       <div className="fixed inset-0 z-10 overflow-y-auto">
  //         <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
  //           <Transition.Child
  //             as={Fragment}
  //             enter="ease-out duration-300"
  //             enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  //             enterTo="opacity-100 translate-y-0 sm:scale-100"
  //             leave="ease-in duration-200"
  //             leaveFrom="opacity-100 translate-y-0 sm:scale-100"
  //             leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  //           >
  //             <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-violet-50 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
  //               <div>
  //                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-200">
  //                   <MdPerson
  //                     className="h-6 w-6 text-violet-600"
  //                     aria-hidden="true"
  //                   />
  //                 </div>
  //                 <div className="mt-3 text-center sm:mt-5">
  //                   <Dialog.Title
  //                     as="h3"
  //                     className="text-lg font-medium leading-6 text-gray-900"
  //                   >
  //                     Create Account ({account?.id})
  //                   </Dialog.Title>
  //                   <div className="mt-2">
  // <p className="text-sm text-gray-500">
  //   Welcome! You will use the ID number you just entered to
  //   sign in at the start of every day, and sign out at the
  //   end of every day. Let's finish making your account.
  // </p>

  // <label
  //   htmlFor="name"
  //   className="block mt-2 text-sm text-left font-medium text-gray-700"
  // >
  //   Preferred Name
  // </label>

  // <div className="mt-1">
  //   <input
  //     type="text"
  //     name="name"
  //     id="name"
  //     className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
  //     value={name ?? ''}
  //     onChange={(e) => setName(e.target.value)}
  //     onKeyDown={handleKeyDown}
  //     ref={nameInputRef}
  //   />
  // </div>
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
  //                 <button
  //                   type="button"
  //                   className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
  //                   onClick={handleSubmit}
  //                 >
  //                   Submit
  //                 </button>
  //                 <button
  //                   type="button"
  //                   className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
  //                   onClick={onClose}
  //                 >
  //                   Cancel
  //                 </button>
  //               </div>
  //             </Dialog.Panel>
  //           </Transition.Child>
  //         </div>
  //       </div>
  //     </Dialog>
  //   </Transition.Root>
  // );
}
