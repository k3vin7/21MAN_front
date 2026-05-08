import { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { TimestampGuard } from '@/components/pull-request/TimestampGuard';
import type { PullRequestDraftInput } from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';
import type { RecruitingAreaType, Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MOCK_CURRENT_USER_ID, RECRUITING_AREA_LABELS } from '@/lib/constants';

type DraftState = {
  title: string;
  content: string;
  contributionTypes: RecruitingAreaType[];
  firstTypingAt: string | null;
  lastSavedAt: string | null;
};

const createEmptyDraft = (): DraftState => ({
  title: '',
  content: '',
  contributionTypes: [],
  firstTypingAt: null,
  lastSavedAt: null,
});

export const NewPullRequestPage = () => {
  const { repoId = '' } = useParams();
  const navigate = useNavigate();
  const storageKey = `worldbuild:pr-draft:${repoId}`;
  const [storedDraft, setStoredDraft] = useLocalStorage<DraftState>(storageKey, createEmptyDraft());
  const [draft, setDraft] = useState<DraftState>(storedDraft);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('초안 복원됨');
  const debouncedDraft = useDebounce(draft, 5000);

  useEffect(() => {
    let mounted = true;
    const fetchContext = async () => {
      setIsLoading(true);
      const nextRepository = await repositoryService.getRepositoryById(repoId);
      const nextAuthor = nextRepository ? await userService.getUserById(nextRepository.authorId) : null;
      if (!mounted) return;
      setRepository(nextRepository);
      setAuthor(nextAuthor);
      setIsLoading(false);
    };
    fetchContext();
    return () => { mounted = false; };
  }, [repoId]);

  useEffect(() => { setDraft(storedDraft); }, [storageKey]);

  useEffect(() => {
    if (!draft.content && !draft.title && !draft.contributionTypes.length) return;
    setStoredDraft({ ...debouncedDraft, lastSavedAt: new Date().toISOString() });
    setSaveStatus('방금 저장했어요');
  }, [debouncedDraft, setStoredDraft]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!draft.content && !draft.title && !draft.contributionTypes.length) return;
      setStoredDraft({ ...draft, lastSavedAt: new Date().toISOString() });
      setSaveStatus('방금 저장했어요');
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [draft, setStoredDraft]);

  if (isLoading) return <Skeleton className="mx-auto h-[720px] max-w-2xl" />;

  if (!repository) {
    return (
      <EmptyState
        action={
          <Link className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" to="/search">
            작품 찾으러 가기
          </Link>
        }
        title="작품을 찾지 못했어요"
        description="다른 작품에 먼저 참여해보세요."
      />
    );
  }

  const recruitingAreas = repository.readme.recruitingAreas.filter(
    (area) => area.status === 'ACTIVELY_RECRUITING',
  );

  const updateDraft = (next: Partial<DraftState>) => {
    setSaveStatus('저장 중...');
    setDraft((current) => ({
      ...current,
      ...next,
      firstTypingAt:
        current.firstTypingAt ??
        (next.content || next.title || next.contributionTypes?.length ? new Date().toISOString() : null),
    }));
  };

  const toggleContributionType = (type: RecruitingAreaType) => {
    updateDraft({
      contributionTypes: draft.contributionTypes.includes(type)
        ? draft.contributionTypes.filter((item) => item !== type)
        : [...draft.contributionTypes, type],
    });
  };

  const handleTemporarySave = () => {
    setStoredDraft({ ...draft, lastSavedAt: new Date().toISOString() });
    setSaveStatus('방금 저장했어요');
  };

  const handleAnalyze = async () => {
    if (!draft.content.trim()) return;
    setIsAnalyzing(true);
    handleTemporarySave();
    const input: PullRequestDraftInput = {
      repositoryId: repository.id,
      authorId: MOCK_CURRENT_USER_ID,
      title: draft.title.trim() || `${repository.title} 창작 제안`,
      originalContent: draft.content.trim(),
      contributionTypes:
        draft.contributionTypes.length > 0
          ? draft.contributionTypes
          : [recruitingAreas[0]?.type ?? 'CHARACTER'],
    };
    const pullRequest = await pullRequestService.createAiReviewedPullRequest(input);
    navigate(`/r/${repository.id}/pr/${pullRequest.id}/review`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        to={`/r/${repository.id}`}
      >
        <ArrowLeft className="size-4" />
        돌아가기
      </Link>

      {/* Hero — 작품 맥락 */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          alt=""
          className="absolute inset-0 size-full object-cover opacity-50"
          src={repository.thumbnail}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />
        <div className="relative px-7 py-10">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">작품에 기여하기</p>
          <h1 className="mt-2 text-4xl font-black text-white">{repository.title}</h1>
          {author && (
            <div className="mt-4 flex items-center gap-2.5">
              <img
                alt={author.displayName}
                className="size-8 rounded-full object-cover ring-2 ring-white/40"
                src={author.avatar}
              />
              <span className="text-sm font-semibold text-white/90">@{author.username} 작가님 작품에 기여하기</span>
            </div>
          )}
        </div>
      </div>

      {/* 금지 설정 경고 */}
      {repository.readme.forbiddenSettings.length > 0 && (
        <div className="rounded-2xl bg-amber-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">작가님이 원하지 않는 것들</p>
          <ul className="mt-2.5 space-y-1.5">
            {repository.readme.forbiddenSettings.slice(0, 2).map((setting) => (
              <li key={setting} className="flex items-start gap-2 text-sm font-medium text-amber-900">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                {setting}
              </li>
            ))}
          </ul>
          <Link className="mt-3 inline-flex text-xs font-semibold text-amber-600 hover:text-amber-800" to={`/r/${repository.id}`}>
            작품 규칙 전체 보기 →
          </Link>
        </div>
      )}

      {/* 모집 영역 선택 */}
      {recruitingAreas.length > 0 && (
        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-bold text-slate-800">작가님이 찾는 건</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recruitingAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleContributionType(area.type)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  draft.contributionTypes.includes(area.type)
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {RECRUITING_AREA_LABELS[area.type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 작성 폼 */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="px-5 pt-5">
          <label className="text-sm font-bold text-slate-800" htmlFor="pr-title">
            제목을 붙여볼까요?
          </label>
          <input
            id="pr-title"
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-400/15 transition"
            onChange={(event) => updateDraft({ title: event.target.value })}
            placeholder="예: 마법 아카데미에 신입 교수 한 명 추가"
            value={draft.title}
          />
        </div>

        <div className="px-5 pt-5">
          <label className="text-sm font-bold text-slate-800" htmlFor="pr-content">
            뭐든 자유롭게 써주세요
          </label>
          <textarea
            id="pr-content"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent-400 focus:bg-white focus:ring-2 focus:ring-accent-400/15 transition min-h-[320px]"
            onChange={(event) => updateDraft({ content: event.target.value })}
            placeholder={`이 작품에 어떤 걸 제안하고 싶은지 편하게 써주세요.\n\n예) ${repository.title}에 새로운 캐릭터를 추가하고 싶어요. 이 캐릭터는...`}
            value={draft.content}
          />
        </div>

        <div className="flex items-center justify-between px-5 py-3 text-xs font-medium text-slate-400">
          <span>{draft.content.length.toLocaleString('ko-KR')}자</span>
          <span>{saveStatus}</span>
        </div>
      </div>

      <TimestampGuard draftStartedAt={draft.firstTypingAt} />

      {/* 액션 */}
      <div className="space-y-2 pb-6">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!draft.content.trim() || isAnalyzing}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-900 py-4 text-base font-bold text-white transition hover:bg-slate-800 disabled:opacity-30"
        >
          <Sparkles className="size-5" />
          {isAnalyzing ? '분석 중...' : 'AI한테 다듬어달라고 하기'}
        </button>
        <button
          type="button"
          onClick={handleTemporarySave}
          className="flex w-full items-center justify-center rounded-2xl py-3 text-sm text-slate-400 transition hover:text-slate-600"
        >
          나중에 마저 쓸게요
        </button>
      </div>
    </div>
  );
};
