import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Paperclip, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { Textarea } from '@/components/common/Textarea';
import { LicenseNotice } from '@/components/pull-request/LicenseNotice';
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

      if (!mounted) {
        return;
      }

      setRepository(nextRepository);
      setAuthor(nextAuthor);
      setIsLoading(false);
    };

    fetchContext();

    return () => {
      mounted = false;
    };
  }, [repoId]);

  useEffect(() => {
    setDraft(storedDraft);
  }, [storageKey]);

  useEffect(() => {
    if (!draft.content && !draft.title && !draft.contributionTypes.length) {
      return;
    }

    const lastSavedAt = new Date().toISOString();
    setStoredDraft({ ...debouncedDraft, lastSavedAt });
    setSaveStatus('마지막 저장: 방금 전');
  }, [debouncedDraft, setStoredDraft]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!draft.content && !draft.title && !draft.contributionTypes.length) {
        return;
      }

      setStoredDraft({ ...draft, lastSavedAt: new Date().toISOString() });
      setSaveStatus('마지막 저장: 방금 전');
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [draft, setStoredDraft]);

  if (isLoading) {
    return <Skeleton className="mx-auto h-[720px] max-w-4xl" />;
  }

  if (!repository) {
    return (
      <EmptyState
        action={
          <Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" to="/search">
            검색으로 이동
          </Link>
        }
        title="창작 제안을 보낼 세계관을 찾지 못했습니다"
        description="mock data에 없는 세계관 ID입니다."
      />
    );
  }

  const recruitingAreas = repository.readme.recruitingAreas.filter(
    (area) => area.status === 'ACTIVELY_RECRUITING',
  );

  const updateDraft = (next: Partial<DraftState>) => {
    setSaveStatus('자동 저장 중');
    setDraft((current) => ({
      ...current,
      ...next,
      firstTypingAt:
        current.firstTypingAt ??
        (next.content || next.title || next.contributionTypes?.length ? new Date().toISOString() : null),
    }));
  };

  const toggleContributionType = (type: RecruitingAreaType) => {
    const nextTypes = draft.contributionTypes.includes(type)
      ? draft.contributionTypes.filter((item) => item !== type)
      : [...draft.contributionTypes, type];

    updateDraft({ contributionTypes: nextTypes });
  };

  const handleTemporarySave = () => {
    setStoredDraft({ ...draft, lastSavedAt: new Date().toISOString() });
    setSaveStatus('마지막 저장: 방금 전');
  };

  const handleAnalyze = async () => {
    if (!draft.content.trim()) {
      return;
    }

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
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        to={`/r/${repository.id}`}
      >
        <ArrowLeft className="size-4" />
        작품으로 돌아가기
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-700">창작 제안</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">이 세계관에 창작 제안하기</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          @{author?.username ?? 'unknown'} 의 세계관에 창작 제안을 보냅니다.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">이 작품의 금지 설정을 확인하셨나요?</h2>
            <Link className="mt-2 inline-flex text-sm font-medium text-accent-700 hover:text-accent-900" to={`/r/${repository.id}`}>
              세계관 문서 확인하기
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {repository.readme.forbiddenSettings.slice(0, 2).map((setting) => (
              <Badge key={setting} tone="amber">
                {setting}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700">현재 모집 영역</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {recruitingAreas.map((area) => (
              <button
                key={area.id}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  draft.contributionTypes.includes(area.type)
                    ? 'border-accent-300 bg-accent-50 text-accent-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950'
                }`}
                onClick={() => toggleContributionType(area.type)}
                type="button"
              >
                {RECRUITING_AREA_LABELS[area.type]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <LicenseNotice />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-medium text-slate-700" htmlFor="pr-title">
          제안 제목
        </label>
        <input
          id="pr-title"
          className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15"
          onChange={(event) => updateDraft({ title: event.target.value })}
          placeholder="예: 강릉 환승령에 바람표 검표원 추가"
          value={draft.title}
        />

        <div className="mt-5">
          <Textarea
            className="min-h-[400px]"
            helperText="어떤 종류든 자유롭게 쓰세요. AI가 창작 제안 양식으로 정리하고 등급을 판정합니다."
            label="자유 작성"
            onChange={(event) => updateDraft({ content: event.target.value })}
            placeholder={`예시: ${repository.title}에서 아직 비어 있는 장소 하나를 제안하고 싶습니다. 이 장소는 기존 규칙과 이렇게 연결됩니다...`}
            value={draft.content}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>{draft.content.length.toLocaleString('ko-KR')}자</span>
            <span>{saveStatus}</span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">첨부</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button leftIcon={<ImagePlus className="size-4" />} variant="secondary">
            이미지 추가
          </Button>
          <Button leftIcon={<Paperclip className="size-4" />} variant="secondary">
            파일 추가
          </Button>
        </div>
      </section>

      <TimestampGuard draftStartedAt={draft.firstTypingAt} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={handleTemporarySave} variant="secondary">
          임시 저장
        </Button>
        <Button
          isLoading={isAnalyzing}
          leftIcon={<Sparkles className="size-4" />}
          onClick={handleAnalyze}
          disabled={!draft.content.trim()}
        >
          AI 분석 받기
        </Button>
      </div>
    </div>
  );
};
