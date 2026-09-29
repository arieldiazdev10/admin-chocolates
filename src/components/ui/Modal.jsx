import { useEffect, useId } from "react";
import { X } from "lucide-react";

const sizes = {
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
};

export const Modal = ({
  title,
  description,
  onClose,
  children,
  size = "lg",
  dismissible = true,
}) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && dismissible) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, dismissible]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cacao-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${sizes[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-stone-900">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-stone-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
