import type { Repository } from '@/features/repository/repository.types';
import type { User } from '@/features/user/user.types';
import { WORK_SCALE_LABELS } from '@/lib/constants';

type RepoCardProps = {
  repository: Repository;
  author?: User;
  onClick: (repository: Repository) => void;
};

export const RepoCard = ({ repository, author, onClick }: RepoCardProps) => {
  return (
    <button
      className="group relative min-h-[320px] w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300"
      onClick={() => onClick(repository)}
      type="button"
    >
      <img
        alt=""
        className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
        src={repository.thumbnail}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {repository.genre}
        </span>
      </div>

      {repository.badges.includes('NEW') && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-900">
          신규
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-xs text-white/60">@{author?.username ?? 'unknown'}</p>
        <h3 className="mt-1 text-lg font-bold text-white line-clamp-1">{repository.title}</h3>
        {repository.description && (
          <p className="mt-1 text-sm text-white/70 line-clamp-2">{repository.description}</p>
        )}
        <p className="mt-2 text-xs text-white/50">{WORK_SCALE_LABELS[repository.workScale]}</p>
      </div>
    </button>
  );
};
