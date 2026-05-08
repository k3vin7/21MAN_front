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
          <label className="text-sm font-medium text-slate-700" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'min-h-32 w-full resize-y rounded-lg border bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2',
            error
              ? 'border-rose-400/60 focus:border-rose-500 focus:ring-rose-400/15'
              : 'border-slate-200 focus:border-accent-500 focus:ring-accent-500/15',
            className,
          )}
          {...props}
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!error && helperText ? <p className="text-sm text-slate-500">{helperText}</p> : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
