import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';

import { Dialog, Transition } from '@headlessui/react';
import { MdSettings, MdWarning } from 'react-icons/md';
import { setConfigValue } from '../../utils/useConfig';

type ConfigModalProps = {
  open: boolean;
  seasonId: string;
  onClose?: () => any;
};

export default function ConfigModal(props: ConfigModalProps) {
  const { open, seasonId, onClose = () => {} } = props;

  const [seasonIdValue, setSeasonIdValue] = useState<string>(seasonId);

  const closeButtonRef = useRef(null);

  useEffect(() => setSeasonIdValue(seasonId), [seasonId]);

  const handleSave = useCallback(async () => {
    const config = { seasonId: seasonIdValue };

    await writeTextFile('config.json', JSON.stringify(config), {
      dir: BaseDirectory.AppConfig,
    });

    setConfigValue(config);

    onClose();
  }, [seasonIdValue]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={closeButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-purple-50 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                    <MdSettings
                      className="h-6 w-6 text-gray-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      SERT Attendance Configuration
                    </Dialog.Title>
                    <div className="mt-2 flex flex-col ">
                      <div className="flex flex-row gap-5">
                        <MdWarning className="h-12 w-12 text-yellow-500" />
                        <p className="text-sm text-gray-500">
                          Be careful when changing these settings. Modifying
                          values here may reset attendance data for the current
                          season.
                        </p>
                        <MdWarning className="h-12 w-12 text-yellow-500" />
                      </div>

                      <div className="mt-2 -mb-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                              <tbody className="divide-y divide-gray-200 bg-white">
                                <tr>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                                    Season
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <input
                                      type="text"
                                      name="name"
                                      id="name"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                      value={seasonIdValue ?? ''}
                                      onChange={(e) =>
                                        setSeasonIdValue(e.target.value)
                                      }
                                    />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
function useParams(): { id: any } {
  throw new Error('Function not implemented.');
}
