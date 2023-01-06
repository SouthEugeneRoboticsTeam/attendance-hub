type NoConnectionModalProps = {
  open: boolean;
};

export default function NoConnectionModal(props: NoConnectionModalProps) {
  const { open } = props;

  return (
    <div className={`modal ${open && 'modal-open'}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">No internet connection!</h3>

        <div className="mt-2">
          <p className="text-sm">
            Please reconnect to the internet before continuing.
          </p>
        </div>
      </div>
    </div>
  );
}
