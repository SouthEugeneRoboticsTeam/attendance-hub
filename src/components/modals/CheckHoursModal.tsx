import { useEffect, useRef } from 'react';

import { Account } from '../../models/Account';
import { millisToHours } from '../../utils/format';

type CheckHoursModalProps = {
  open: boolean;
  account: Account | null;
  seasonId: string;
  onClose?: () => any;
};

export default function CheckHoursModal(props: CheckHoursModalProps) {
  const { open, account, seasonId, onClose = () => {} } = props;

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [open]);

  const inactiveSeasons = Object.entries(account?.seasons ?? {})
    .filter(([season]) => season !== seasonId)
    .sort(([a], [b]) => (a > b ? -1 : 1));

  return (
    <div className={`modal ${open && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{account?.name}'s Time Statistics</h3>

        <div className="overflow-x-auto mt-4">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Season</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{seasonId}</td>
                <td>{millisToHours(account?.seasons?.[seasonId] ?? 0)}</td>
              </tr>
              {inactiveSeasons.map(([season, time]) => (
                <tr key={season}>
                  <td>{season}</td>
                  <td>{millisToHours(time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
