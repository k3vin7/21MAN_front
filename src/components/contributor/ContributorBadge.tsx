import type { User } from '@/features/user/user.types';
import { cn } from '@/lib/cn';

type ContributorBadgeProps = {
  user: User;
  meta?: string;
  className?: string;
};

export const ContributorBadge = ({ user, meta, className }: ContributorBadgeProps) => {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <img
        alt={`${user.displayName} avatar`}
        className="size-9 shrink-0 rounded-lg border border-slate-200 bg-slate-100"
        src={user.avatar}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">@{user.username}</p>
        {meta ? <p className="truncate text-xs text-slate-500">{meta}</p> : null}
      </div>
    </div>
  );
};
