import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { writeTextFile, BaseDirectory, createDir } from '@tauri-apps/api/fs';

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

  useEffect(() => setSeasonIdValue(seasonId), [seasonId]);

  const handleSave = useCallback(async () => {
    const config = { seasonId: seasonIdValue };

    await createDir('.', { dir: BaseDirectory.AppConfig, recursive: true });
    await writeTextFile('config.json', JSON.stringify(config), {
      dir: BaseDirectory.AppConfig,
    });

    setConfigValue(config);

    onClose();
  }, [seasonIdValue]);

  return (
    <div className={`modal ${open && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">SERT Attendance Configuration</h3>

        <div className="mt-2 flex flex-col">
          <div className="flex flex-row gap-5">
            <MdWarning className="h-12 w-12 text-yellow-500" />
            <p className="text-sm text-gray-500">
              Be careful when changing these settings. Modifying
              values here may reset attendance data for the current
              season.
            </p>
            <MdWarning className="h-12 w-12 text-yellow-500" />
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table w-full">
              <tbody>
                <tr>
                  <td className="text-right">Season</td>
                  <td>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="input input-bordered input-primary w-full"
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

        <div className="modal-action">
          <button
            type="button"
            className="btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
