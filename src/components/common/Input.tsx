import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, helperText, error, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-2">
        {label ? (
          <label className="text-sm font-medium text-slate-200" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:ring-2',
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

Input.displayName = 'Input';

