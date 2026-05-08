import { ArrowRight, ExternalLink, GitPullRequest, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { RepoStatsBar } from '@/components/repository/RepoStatsBar';
import { RecruitingAreaCard } from '@/components/repository/RecruitingAreaCard';
import { useAuthStore } from '@/features/auth/auth.store';
import type { Repository } from '@/features/repository/repository.types';
import type { User } from '@/features/user/user.types';
import { REPOSITORY_BADGE_LABELS } from '@/lib/constants';

type RepoDetailModalProps = {
  repository: Repository | null;
  author?: User;
  isOpen: boolean;
  onClose: () => void;
};

export const RepoDetailModal = ({ repository, author, isOpen, onClose }: RepoDetailModalProps) => {
  const currentUser = useAuthStore((state) => state.user);

  if (!repository) {
    return null;
  }

  const currentUserId = currentUser ? String(currentUser.id) : '';
  const isOwner = Boolean(
    currentUser &&
      (repository.authorId === currentUserId ||
        repository.authorId === currentUser.username ||
        author?.id === currentUserId ||
        author?.username === currentUser.username),
  );

  return (
    <Modal
      description={repository.description}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="ghost">
            닫기
          </Button>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            to={`/r/${repository.id}`}
          >
            세계관 소개 보기
            <ArrowRight className="size-4" />
          </Link>
          {isOwner ? (
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-4 text-sm font-semibold text-accent-900 transition hover:border-accent-300 hover:bg-accent-100"
              to={`/r/${repository.id}/dashboard`}
            >
              <Inbox className="size-4" />
              받은 제안 보기
            </Link>
          ) : null}
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            to={`/r/${repository.id}/pr/new`}
          >
            <GitPullRequest className="size-4" />
            창작 제안하기
          </Link>
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={repository.title}
    >
      <div className="space-y-6">
        <img
          alt=""
          className="h-56 w-full rounded-lg object-cover"
          loading="lazy"
          src={repository.thumbnail}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">{repository.genre}</Badge>
          {repository.badges.map((badge) => (
            <Badge key={badge} tone={badge === 'NEW' ? 'amber' : 'teal'}>
              {REPOSITORY_BADGE_LABELS[badge]}
            </Badge>
          ))}
          {author ? <Badge tone="default">@{author.username}</Badge> : null}
        </div>

        <RepoStatsBar repository={repository} />

        <section>
          <h3 className="text-base font-semibold text-slate-950">지금 받고 싶은 창작 제안</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {repository.readme.recruitingAreas.map((area) => (
              <RecruitingAreaCard key={area.id} area={area} />
            ))}
          </div>
        </section>

        {repository.externalLinks.length ? (
          <section>
            <h3 className="text-base font-semibold text-slate-950">외부 링크</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {repository.externalLinks.map((link) => (
                <a
                  key={link.url}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-accent-300 hover:text-slate-950"
                  href={link.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.type}
                  <ExternalLink className="size-3.5" />
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Modal>
  );
};
