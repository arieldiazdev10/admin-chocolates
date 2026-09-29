import { LoaderCircle, TriangleAlert } from "lucide-react";
import { Modal } from "./Modal";

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Confirmar",
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Modal title={title} onClose={onCancel} size="md" dismissible={!loading}>
    <div className="flex items-start gap-4 px-6 py-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <TriangleAlert size={22} />
      </span>
      <p className="pt-1 text-sm leading-relaxed text-stone-600">{message}</p>
    </div>
    <div className="flex justify-end gap-3 border-t border-stone-100 bg-stone-50 px-6 py-4 sm:rounded-b-2xl">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="btn-secondary"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="btn-danger"
      >
        {loading && <LoaderCircle size={16} className="animate-spin" />}
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
