import { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { Textarea } from '@/components/common/Textarea';
import { AgreementChecklist, AGREEMENT_IDS } from '@/components/pull-request/AgreementChecklist';
import { AiScoreBars } from '@/components/pull-request/AiScoreBars';
import { ConflictCheckCard } from '@/components/pull-request/ConflictCheckCard';
import { GradeBadge } from '@/components/pull-request/GradeBadge';
import { TimestampGuard } from '@/components/pull-request/TimestampGuard';
import { VisibilitySelector } from '@/components/pull-request/VisibilitySelector';
import type { PullRequest, PullRequestVisibility } from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';
import type { Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import { useToast } from '@/hooks/useToast';

const loadingSteps = ['내용 분석 중...', '제안 유형 판정 중...', '등급 계산 중...', '충돌 검사 중...'];

export const PullRequestReviewPage = () => {
  const { repoId = '', prId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<PullRequestVisibility>('PUBLIC');
  const [agreesWithAI, setAgreesWithAI] = useState(true);
  const [opinionNote, setOpinionNote] = useState('');
  const [agreements, setAgreements] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchReview = async () => {
      setIsLoading(true);
      const [nextPullRequest, nextRepository] = await Promise.all([
        pullRequestService.getPullRequestById(prId),
        repositoryService.getRepositoryById(repoId),
      ]);

      if (!mounted) return;

      setPullRequest(nextPullRequest);
      setRepository(nextRepository);
      setTitle(nextPullRequest?.title ?? '');
      setVisibility(nextPullRequest?.visibility ?? 'PUBLIC');
      setAgreesWithAI(nextPullRequest?.contributorOpinion?.agreesWithAI ?? true);
      setOpinionNote(nextPullRequest?.contributorOpinion?.note ?? '');
      setIsLoading(false);
    };

    fetchReview();
    return () => { mounted = false; };
  }, [prId, repoId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">AI가 분석하고 있어요</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {loadingSteps.map((step) => (
              <div key={step} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                {step}
              </div>
            ))}
          </div>
        </section>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!pullRequest) {
    return (
      <EmptyState
        action={
          <Link className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" to={`/r/${repoId}/pr/new`}>
            다시 써볼게요
          </Link>
        }
        title="제안을 찾지 못했어요"
        description="작성 페이지에서 AI 분석을 다시 실행해보세요."
      />
    );
  }

  const allAgreed = AGREEMENT_IDS.every((agreement) => agreements.includes(agreement));
  const isSubmitted = Boolean(pullRequest.timestamps.submittedAt);

  const saveReviewState = async () => {
    const updated = await pullRequestService.updatePullRequestReview(pullRequest.id, {
      title,
      visibility,
      contributorOpinion: {
        agreesWithAI,
        note: agreesWithAI ? 'AI 판정에 동의합니다.' : opinionNote,
      },
    });

    if (updated) setPullRequest(updated);
    return updated;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const updated = await saveReviewState();
      const submitted = updated ? await pullRequestService.submitPullRequest(updated.id) : null;

      if (submitted) {
        setPullRequest(submitted);
        toast({
          title: '제안이 작가님한테 전달됐어요',
          description: '작품 페이지로 돌아갑니다.',
          tone: 'success',
        });
        setConfirmOpen(false);
        navigate(`/r/${submitted.repositoryId}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        to={`/r/${pullRequest.repositoryId}/pr/new`}
      >
        <ArrowLeft className="size-4" />
        수정하러 돌아가기
      </Link>

      {/* 헤더 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black text-slate-950">AI 분석 결과</h1>
          {isSubmitted && (
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">제출 완료</span>
          )}
        </div>
        <p className="mt-2 text-base text-slate-500">아래 내용 확인하고 제출하면 돼요.</p>
      </section>

      {/* 제목 + 기여 유형 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <Input label="제안 제목" onChange={(event) => setTitle(event.target.value)} value={title} />
        {pullRequest.contributionTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {pullRequest.contributionTypes.map((type) => (
              <span key={type} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
                {type}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 text-sm leading-7 text-slate-600">{pullRequest.structuredContent.expectedEffect}</p>
      </section>

      {/* 정리된 내용 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">AI가 정리한 내용</h2>
        <dl className="mt-4 space-y-4">
          <StructuredItem label="핵심 제안" value={pullRequest.structuredContent.coreIdea} />
          <StructuredItem label="관련 캐릭터" value={pullRequest.structuredContent.relatedCharacters.join(', ') || '해당 없음'} />
          <StructuredItem label="관련 지역·세력" value={pullRequest.structuredContent.relatedLocations.join(', ') || '해당 없음'} />
          <StructuredItem label="관련 세계 규칙" value={pullRequest.structuredContent.relatedWorldRules.join(', ') || '해당 없음'} />
          <StructuredItem label="기대 효과" value={pullRequest.structuredContent.expectedEffect} />
        </dl>
        <button
          type="button"
          className="mt-5 rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          onClick={() => setShowOriginal((v) => !v)}
        >
          원문 {showOriginal ? '닫기' : '보기'}
        </button>
        {showOriginal && (
          <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
            {pullRequest.originalContent}
          </p>
        )}
      </section>

      {/* AI 등급 */}
      <section className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-slate-900">AI 등급 판정</h2>
          <div className="flex items-center gap-3">
            <GradeBadge grade={pullRequest.aiGrading.grade} />
            <span className="text-2xl font-black text-slate-950">{pullRequest.aiGrading.totalScore}<span className="text-base font-semibold text-slate-400">/100</span></span>
          </div>
        </div>
        <div className="mt-5">
          <AiScoreBars grading={pullRequest.aiGrading} />
        </div>
        <p className="mt-5 rounded-xl bg-white px-4 py-3 text-sm leading-7 text-slate-600">
          {pullRequest.aiGrading.rationale}
        </p>
      </section>

      {/* AI 판정 동의 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">AI 판정, 어떻게 생각하세요?</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAgreesWithAI(true)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              agreesWithAI ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            맞아요
          </button>
          <button
            type="button"
            onClick={() => setAgreesWithAI(false)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !agreesWithAI ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            다르게 봐요
          </button>
        </div>
        {!agreesWithAI && (
          <Textarea
            className="mt-4"
            label="어떤 부분이 다른가요?"
            onChange={(event) => setOpinionNote(event.target.value)}
            placeholder="AI가 놓친 맥락이나 등급 판단에 대한 의견을 적어주세요."
            value={opinionNote}
          />
        )}
      </section>

      <ConflictCheckCard pullRequest={pullRequest} repository={repository} />
      <VisibilitySelector onChange={setVisibility} value={visibility} />
      <AgreementChecklist onChange={setAgreements} value={agreements} />
      <TimestampGuard
        draftStartedAt={pullRequest.timestamps.draftStartedAt}
        firstViewedByAuthorAt={pullRequest.timestamps.firstViewedByAuthorAt}
        submittedAt={pullRequest.timestamps.submittedAt}
      />

      <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={saveReviewState}
          className="flex h-12 items-center justify-center rounded-2xl bg-slate-100 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:w-auto"
        >
          임시 저장
        </button>
        <button
          type="button"
          disabled={isSubmitted || !allAgreed || (!agreesWithAI && !opinionNote.trim()) || !title.trim()}
          onClick={() => setConfirmOpen(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800 disabled:opacity-30 sm:w-auto sm:px-8"
        >
          <Sparkles className="size-5" />
          {isSubmitted ? '제출 완료' : '작가님한테 보내기'}
        </button>
      </div>

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setConfirmOpen(false)} variant="ghost">
              잠깐만요
            </Button>
            <Button isLoading={isSubmitting} onClick={handleSubmit}>
              보낼게요
            </Button>
          </div>
        }
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="작가님한테 보낼게요"
      >
        <p className="text-sm leading-7 text-slate-600">
          제출하면 작성 시각과 제출 시각이 기록돼요. 작가님이 열어보면 열람 기록도 남아요.
        </p>
      </Modal>
    </div>
  );
};

type StructuredItemProps = {
  label: string;
  value: string;
};

const StructuredItem = ({ label, value }: StructuredItemProps) => {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-slate-800">{value}</dd>
    </div>
  );
};
