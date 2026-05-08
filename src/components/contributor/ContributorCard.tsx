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
    <article className="rounded-lg border border-white/10 bg-slate-900/70 p-5 transition hover:border-accent-300/30 hover:bg-slate-900">
      <div className="flex items-start gap-4">
        <img
          alt={`${user.displayName} avatar`}
          className="size-14 rounded-lg border border-white/10 bg-slate-800"
          src={user.avatar}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-white">{user.displayName}</h3>
          <p className="truncate text-sm text-slate-400">@{user.username}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {featured ? <Badge tone="teal">{featured.mainField}</Badge> : null}
        <Badge tone="amber">
          <Award className="mr-1 size-3" />
          Major {formatNumber(user.stats.majorMerges)}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{user.bio}</p>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
        <GitMerge className="size-4 text-accent-300" />
        총 기여 {formatNumber(user.stats.contributionsTotal)}개
      </div>
    </article>
  );
};

