import { create } from 'zustand';

export type ToastTone = 'default' | 'success' | 'warning' | 'error';

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
};

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastState = {
  toasts: ToastItem[];
  toast: (input: ToastInput) => string;
  dismiss: (toastId: string) => void;
  clear: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  toast: (input) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toastItem: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? 'default',
      duration: input.duration ?? 4200,
    };

    set((state) => ({
      toasts: [toastItem, ...state.toasts].slice(0, 4),
    }));

    if (toastItem.duration > 0) {
      window.setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, toastItem.duration);
    }

    return id;
  },

  dismiss: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }));
  },

  clear: () => {
    set({ toasts: [] });
  },
}));

export const useToast = () => {
  const toasts = useToastStore((state) => state.toasts);
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const clear = useToastStore((state) => state.clear);

  return {
    toasts,
    toast,
    dismiss,
    clear,
  };
};
