import { useCallback, useEffect, useState } from 'react';

import { BaseDirectory, createDir, writeTextFile } from '@tauri-apps/api/fs';
import { MdWarning } from 'react-icons/md';
import { themeChange } from 'theme-change';

import { setConfigValue } from '../../utils/useConfig';
import { themes } from '../../constants/themes';

type ConfigModalProps = {
  open: boolean;
  seasonId: string;
  onClose?: () => any;
};

export default function ConfigModal(props: ConfigModalProps) {
  const { open, seasonId, onClose = () => {} } = props;

  const [seasonIdValue, setSeasonIdValue] = useState<string>(seasonId);

  useEffect(() => setSeasonIdValue(seasonId), [seasonId]);
  useEffect(() => themeChange(false), []);

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
            <MdWarning className="h-12 w-12 text-warning" />
            <p className="text-sm text-error">
              Be careful when changing these settings. Modifying values here may
              reset attendance data for the current season.
            </p>
            <MdWarning className="h-12 w-12 text-warning" />
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
                      className="input input-bordered w-full"
                      value={seasonIdValue ?? ''}
                      onChange={(e) => setSeasonIdValue(e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="text-right">Style</td>
                  <td>
                    <select
                      className="select select-bordered w-full max-w-xs"
                      data-choose-theme
                    >
                      {themes.map((i) => (
                        <option value={i} key={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
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
