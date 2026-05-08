import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <section
        aria-modal="true"
        className={cn(
          'relative max-h-[86vh] w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-soft',
          sizeClasses[size],
        )}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p> : null}
          </div>
          <Button aria-label="닫기" onClick={onClose} size="icon" variant="ghost">
            <X className="size-4" />
          </Button>
        </header>

        <div className="max-h-[calc(86vh-9rem)] overflow-y-auto p-5">{children}</div>

        {footer ? <footer className="border-t border-white/10 p-5">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
};

