import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, helperText, error, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <div className="space-y-2">
        {label ? (
          <label className="text-sm font-medium text-slate-200" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'min-h-32 w-full resize-y rounded-lg border bg-slate-950/60 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:ring-2',
            error
              ? 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/20'
              : 'border-white/10 focus:border-accent-400/70 focus:ring-accent-400/20',
            className,
          )}
          {...props}
        />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {!error && helperText ? <p className="text-sm text-slate-500">{helperText}</p> : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

