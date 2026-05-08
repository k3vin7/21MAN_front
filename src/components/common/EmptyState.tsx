import { ReactNode } from 'react';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/cn';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div className={cn('rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center', className)}>
      {icon !== null && (
        <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {icon ?? <SearchX className="size-5" />}
        </div>
      )}
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
};
