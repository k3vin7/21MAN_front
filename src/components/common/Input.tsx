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
          <label className="text-sm font-medium text-slate-700" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2',
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

Input.displayName = 'Input';
