import { CalendarDays, Users } from 'lucide-react';
import type { Repository } from '@/features/repository/repository.types';
import { formatDate } from '@/lib/date';
import { formatNumber } from '@/lib/format';

type RepoStatsBarProps = {
  repository: Repository;
};

export const RepoStatsBar = ({ repository }: RepoStatsBarProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-slate-500">
      <span className="flex items-center gap-1.5">
        <Users className="size-4" />
        <span className="font-semibold text-slate-900">{formatNumber(repository.stats.contributorCount)}</span>
        명 참여
      </span>
      <span className="text-slate-200">·</span>
      <span className="flex items-center gap-1.5">
        <CalendarDays className="size-4" />
        최근 활동
        <span className="font-semibold text-slate-900">{formatDate(repository.stats.lastActivity)}</span>
      </span>
    </div>
  );
};
