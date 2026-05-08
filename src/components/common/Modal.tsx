import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="모달 닫기"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <section
        aria-modal="true"
        className={cn(
          'relative max-h-[86vh] w-full overflow-hidden rounded-2xl bg-white shadow-xl',
          sizeClasses[size],
        )}
        role="dialog"
      >
        <button
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-4" />
        </button>

        {(title || description) && (
          <header className="px-7 pt-6 pb-4 pr-12">
            {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
            {description && <p className={`text-sm leading-relaxed text-slate-500 ${title ? 'mt-1.5' : ''}`}>{description}</p>}
          </header>
        )}

        <div className={cn('overflow-y-auto px-7', (title || description) ? 'max-h-[calc(86vh-10rem)] pb-2' : 'max-h-[calc(86vh-5rem)] pt-8 pb-2')}>{children}</div>

        {footer ? <footer className="px-7 py-5">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
};
