import { X } from 'lucide-react';
import { useToastStore, type ToastTone } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

const toneClasses: Record<ToastTone, string> = {
  default: 'border-slate-200 bg-white text-slate-900',
  success: 'border-accent-200 bg-accent-50 text-accent-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
};

export const Toast = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn('rounded-lg border p-4 shadow-soft backdrop-blur', toneClasses[toast.tone])}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm leading-5 opacity-80">{toast.description}</p> : null}
            </div>
            <Button
              aria-label="토스트 닫기"
              className="-mr-2 -mt-2"
              onClick={() => dismiss(toast.id)}
              size="icon"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
