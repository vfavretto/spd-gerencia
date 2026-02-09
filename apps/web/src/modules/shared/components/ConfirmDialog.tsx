import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning";
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  variant = "danger"
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const confirmColors =
    variant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-500"
      : "bg-amber-600 text-white hover:bg-amber-500";

  const iconColors =
    variant === "danger"
      ? "bg-rose-50 text-rose-600"
      : "bg-amber-50 text-amber-600";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconColors}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              {cancelLabel}
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition ${confirmColors}`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
