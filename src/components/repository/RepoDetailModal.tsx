import { BookOpen, ChevronRight, ExternalLink, GitPullRequest, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/common/Modal';
import { useAuthStore } from '@/features/auth/auth.store';
import type { Repository } from '@/features/repository/repository.types';
import type { User } from '@/features/user/user.types';

type RepoDetailModalProps = {
  repository: Repository | null;
  author?: User;
  isOpen: boolean;
  onClose: () => void;
};

export const RepoDetailModal = ({ repository, author: _author, isOpen, onClose }: RepoDetailModalProps) => {
  const currentUser = useAuthStore((state) => state.user);

  if (!repository) {
    return null;
  }

  const currentUserId = currentUser ? String(currentUser.id) : '';
  const isOwner = Boolean(
    currentUser &&
      (repository.authorId === currentUserId ||
        repository.authorId === currentUser.username),
  );

  return (
    <Modal
      description={repository.description}
      footer={
        <div className="space-y-2">
          <Link
            className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            to={`/r/${repository.id}`}
          >
            <span className="flex items-center gap-3">
              <BookOpen className="size-4 text-slate-400" />
              이 작품 더 알아보기
            </span>
            <ChevronRight className="size-4 text-slate-400" />
          </Link>
          {isOwner && (
            <Link
              className="flex w-full items-center justify-between rounded-2xl bg-slate-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-700"
              to={`/r/${repository.id}/dashboard`}
            >
              <span className="flex items-center gap-3">
                <Inbox className="size-4" />
                이 작품에 기여하고 싶어하는 사람들
              </span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">원작자</span>
                <ChevronRight className="size-4" />
              </span>
            </Link>
          )}
          <Link
            className="flex w-full items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-black"
            to={`/r/${repository.id}/pr/new`}
          >
            <span className="flex items-center gap-3">
              <GitPullRequest className="size-4" />
              나도 참여할게요
            </span>
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">공동창작자</span>
              <ChevronRight className="size-4" />
            </span>
          </Link>
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-5">
        <img
          alt=""
          className="h-52 w-full rounded-2xl object-cover"
          loading="lazy"
          src={repository.thumbnail}
        />

        {(repository.readme.worldOverview || repository.readme.intro) && (
          <section className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-xs font-semibold text-slate-400">세계관 소개</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {repository.readme.worldOverview || repository.readme.intro}
            </p>
          </section>
        )}

        {repository.readme.coreRules.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-400">핵심 규칙</h3>
            <ul className="mt-2 space-y-1">
              {repository.readme.coreRules.slice(0, 3).map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-400" />
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        )}

        {repository.readme.contributionGuidelines && (
          <section className="rounded-2xl border border-accent-100 bg-accent-50 p-4">
            <h3 className="text-xs font-semibold text-accent-700">기여 가이드</h3>
            <p className="mt-2 text-sm leading-relaxed text-accent-900">
              {repository.readme.contributionGuidelines}
            </p>
          </section>
        )}

        {repository.externalLinks.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-400">외부 링크</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {repository.externalLinks.map((link) => (
                <a
                  key={link.url}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
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
        )}
      </div>
    </Modal>
  );
};
