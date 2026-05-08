import { Award, GitMerge } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import type { FeaturedContributor, User } from '@/features/user/user.types';
import { formatNumber } from '@/lib/format';

type ContributorCardProps = {
  user: User;
  featured?: FeaturedContributor;
};

export const ContributorCard = ({ user, featured }: ContributorCardProps) => {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:bg-slate-50">
      <div className="flex items-start gap-4">
        <img
          alt={`${user.displayName} avatar`}
          className="size-14 rounded-lg border border-slate-200 bg-slate-100"
          src={user.avatar}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-950">{user.displayName}</h3>
          <p className="truncate text-sm text-slate-500">@{user.username}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {featured ? <Badge tone="teal">{featured.mainField}</Badge> : null}
        <Badge tone="amber">
          <Award className="mr-1 size-3" />
          주요 반영 {formatNumber(user.stats.majorMerges)}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{user.bio}</p>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
        <GitMerge className="size-4 text-accent-600" />
        참여 이력 {formatNumber(user.stats.contributionsTotal)}개
      </div>
    </article>
  );
};
