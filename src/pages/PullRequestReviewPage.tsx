import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
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

const gradeKorean = {
  MAJOR: '상',
  NORMAL: '중',
  MINOR: '하',
} as const;

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

      if (!mounted) {
        return;
      }

      setPullRequest(nextPullRequest);
      setRepository(nextRepository);
      setTitle(nextPullRequest?.title ?? '');
      setVisibility(nextPullRequest?.visibility ?? 'PUBLIC');
      setAgreesWithAI(nextPullRequest?.contributorOpinion?.agreesWithAI ?? true);
      setOpinionNote(nextPullRequest?.contributorOpinion?.note ?? '');
      setIsLoading(false);
    };

    fetchReview();

    return () => {
      mounted = false;
    };
  }, [prId, repoId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">AI가 창작 제안을 분석했습니다</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {loadingSteps.map((step) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
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
          <Link className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white" to={`/r/${repoId}/pr/new`}>
            새 창작 제안 작성
          </Link>
        }
        title="창작 제안을 찾지 못했습니다"
        description="mock service 메모리에 없는 창작 제안입니다. 작성 페이지에서 AI 분석을 다시 실행해보세요."
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

    if (updated) {
      setPullRequest(updated);
    }

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
          title: '창작 제안이 제출되었습니다',
          description: '세계관 소개 페이지로 이동합니다.',
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
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        to={`/r/${pullRequest.repositoryId}/pr/new`}
      >
        <ArrowLeft className="size-4" />
        수정하러 돌아가기
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-700">AI 검토</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-950">AI가 창작 제안을 분석했습니다</h1>
          {isSubmitted ? <Badge tone="teal">제출 완료</Badge> : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">내용을 확인하고 제출하세요.</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Input label="제안 제목" onChange={(event) => setTitle(event.target.value)} value={title} />
        <div className="mt-4 flex flex-wrap gap-2">
          {pullRequest.contributionTypes.map((type) => (
            <Badge key={type} tone="blue">
              {type}
            </Badge>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{pullRequest.structuredContent.expectedEffect}</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-accent-700" />
          <h2 className="text-lg font-semibold text-slate-950">정리된 창작 제안</h2>
        </div>
        <dl className="mt-5 grid gap-4">
          <StructuredItem label="핵심 제안" value={pullRequest.structuredContent.coreIdea} />
          <StructuredItem label="관련 캐릭터" value={pullRequest.structuredContent.relatedCharacters.join(', ') || '해당 없음'} />
          <StructuredItem label="관련 지역/세력" value={pullRequest.structuredContent.relatedLocations.join(', ') || '해당 없음'} />
          <StructuredItem label="관련 세계 규칙" value={pullRequest.structuredContent.relatedWorldRules.join(', ') || '해당 없음'} />
          <StructuredItem label="기대 효과" value={pullRequest.structuredContent.expectedEffect} />
        </dl>
        <Button className="mt-5" onClick={() => setShowOriginal((value) => !value)} variant="secondary">
          원문 {showOriginal ? '닫기' : '보기'}
        </Button>
        {showOriginal ? (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {pullRequest.originalContent}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-accent-200 bg-accent-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">AI 창작 제안 등급</h2>
            <p className="mt-1 text-sm text-slate-600">사용자 표시 등급: {gradeKorean[pullRequest.aiGrading.grade]}</p>
          </div>
          <div className="flex items-center gap-3">
            <GradeBadge grade={pullRequest.aiGrading.grade} />
            <span className="text-2xl font-semibold text-slate-950">{pullRequest.aiGrading.totalScore}/100</span>
          </div>
        </div>
        <div className="mt-5">
          <AiScoreBars grading={pullRequest.aiGrading} />
        </div>
        <p className="mt-5 rounded-lg border border-accent-100 bg-white p-4 text-sm leading-6 text-slate-700">
          {pullRequest.aiGrading.rationale}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">AI 판정에 동의하시나요?</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => setAgreesWithAI(true)} variant={agreesWithAI ? 'primary' : 'secondary'}>
            동의합니다
          </Button>
          <Button onClick={() => setAgreesWithAI(false)} variant={!agreesWithAI ? 'primary' : 'secondary'}>
            이의 있음
          </Button>
        </div>
        {!agreesWithAI ? (
          <Textarea
            className="mt-4"
            label="이의 사유"
            onChange={(event) => setOpinionNote(event.target.value)}
            placeholder="AI가 놓친 맥락이나 등급 판단에 대한 의견을 적어주세요."
            value={opinionNote}
          />
        ) : null}
      </section>

      <ConflictCheckCard pullRequest={pullRequest} repository={repository} />
      <VisibilitySelector onChange={setVisibility} value={visibility} />
      <AgreementChecklist onChange={setAgreements} value={agreements} />
      <TimestampGuard
        draftStartedAt={pullRequest.timestamps.draftStartedAt}
        firstViewedByAuthorAt={pullRequest.timestamps.firstViewedByAuthorAt}
        submittedAt={pullRequest.timestamps.submittedAt}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={saveReviewState} variant="secondary">
          임시 저장
        </Button>
        <Button
          disabled={isSubmitted || !allAgreed || (!agreesWithAI && !opinionNote.trim()) || !title.trim()}
          leftIcon={<Sparkles className="size-4" />}
          onClick={() => setConfirmOpen(true)}
        >
          {isSubmitted ? '제출 완료' : '제출'}
        </Button>
      </div>

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setConfirmOpen(false)} variant="ghost">
              취소
            </Button>
            <Button isLoading={isSubmitting} onClick={handleSubmit}>
              제출 확정
            </Button>
          </div>
        }
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="창작 제안을 제출할까요?"
      >
        <p className="text-sm leading-6 text-slate-600">
          제출 후 작성 시각과 제출 시각이 기록되며, 원작자가 열람하면 열람 로그도 추가됩니다.
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
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-slate-700">{value}</dd>
    </div>
  );
};
