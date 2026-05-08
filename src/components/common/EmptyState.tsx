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
    <div className={cn('rounded-lg border border-dashed border-white/10 p-8 text-center', className)}>
      <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-white/5 text-slate-300">
        {icon ?? <SearchX className="size-5" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
};

