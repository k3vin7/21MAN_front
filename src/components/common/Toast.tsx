import { X } from 'lucide-react';
import { useToastStore, type ToastTone } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

const toneClasses: Record<ToastTone, string> = {
  default: 'border-white/10 bg-slate-900 text-slate-100',
  success: 'border-accent-400/30 bg-accent-950 text-accent-50',
  warning: 'border-amber-400/30 bg-amber-950 text-amber-50',
  error: 'border-rose-400/30 bg-rose-950 text-rose-50',
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

