import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, GitMerge, Pause, Send, ShieldAlert, XCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { Textarea } from '@/components/common/Textarea';
import { AiScoreBars } from '@/components/pull-request/AiScoreBars';
import { ConflictCheckCard } from '@/components/pull-request/ConflictCheckCard';
import { GradeBadge } from '@/components/pull-request/GradeBadge';
import { PullRequestCard } from '@/components/pull-request/PullRequestCard';
import type { PullRequest, PullRequestGrade } from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';
import type { Repository } from '@/features/repository/repository.types';
import { repositoryService } from '@/features/repository/repository.service';
import type { User } from '@/features/user/user.types';
import { userService } from '@/features/user/user.service';
import { useToast } from '@/hooks/useToast';
import { MOCK_AUTHOR_ID, PULL_REQUEST_GRADE_LABELS, PULL_REQUEST_STATUS_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/date';

type QueueFilter =
  | 'NEW'
  | 'PUBLIC'
  | 'PRIVATE'
  | 'CONFLICT'
  | 'POPULAR'
  | 'CHANGES_REQUESTED'
  | 'MERGE_READY';

type QueueSort = 'recent' | 'grade' | 'risk';

const queueFilters: Array<{ label: string; value: QueueFilter }> = [
  { label: '새 PR', value: 'NEW' },
  { label: 'Public PR', value: 'PUBLIC' },
  { label: 'Private PR', value: 'PRIVATE' },
  { label: '충돌 위험 PR', value: 'CONFLICT' },
  { label: '인기 PR', value: 'POPULAR' },
  { label: '변경 요청 중', value: 'CHANGES_REQUESTED' },
  { label: 'Merge 대기', value: 'MERGE_READY' },
];

const gradeRank: Record<PullRequestGrade, number> = {
  MAJOR: 3,
  NORMAL: 2,
  MINOR: 1,
};

const riskRank = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const rejectCategories = ['유사 설정 이미 존재', '방향 다름', '품질 미달', '금지 설정 위반', '기타'];

export const AuthorDashboardPage = () => {
  const { repoId = '' } = useParams();
  const { toast } = useToast();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<QueueFilter[]>(['NEW']);
  const [sort, setSort] = useState<QueueSort>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [showProtectedContent, setShowProtectedContent] = useState(false);
  const [finalGrade, setFinalGrade] = useState<PullRequestGrade>('NORMAL');
  const [authorNote, setAuthorNote] = useState('');
  const [rejectCategory, setRejectCategory] = useState(rejectCategories[0]);
  const [rejectReason, setRejectReason] = useState('');
  const [mergePreview, setMergePreview] = useState('');

  const refreshPullRequests = async (nextRepoId = repoId) => {
    if (!nextRepoId) {
      return;
    }

    const nextPullRequests = await pullRequestService.getPullRequests({ repositoryId: nextRepoId });
    setPullRequests(nextPullRequests);
    setSelectedId((current) => current ?? nextPullRequests[0]?.id ?? null);
  };

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      setIsLoading(true);
      const [nextRepository, nextPullRequests, nextUsers] = await Promise.all([
        repositoryService.getRepositoryById(repoId),
        pullRequestService.getPullRequests({ repositoryId: repoId }),
        userService.getUsers(),
      ]);

      if (!mounted) {
        return;
      }

      setRepository(nextRepository);
      setPullRequests(nextPullRequests);
      setUsers(nextUsers);
      setSelectedId(nextPullRequests[0]?.id ?? null);
      setIsLoading(false);
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, [repoId]);

  const selectedPullRequest = pullRequests.find((pullRequest) => pullRequest.id === selectedId) ?? null;
  const selectedAuthor = selectedPullRequest
    ? users.find((user) => user.id === selectedPullRequest.authorId)
    : null;

  useEffect(() => {
    if (!selectedPullRequest) {
      return;
    }

    setFinalGrade(selectedPullRequest.finalGrade);
    setAuthorNote(selectedPullRequest.authorGradingNote);
    setRejectReason(selectedPullRequest.rejectReason ?? '');
    setMergePreview(
      `공식 문서 반영 초안\n\n- 제목: ${selectedPullRequest.title}\n- 핵심 제안: ${selectedPullRequest.structuredContent.coreIdea}\n- 기대 효과: ${selectedPullRequest.structuredContent.expectedEffect}`,
    );
    setShowProtectedContent(Boolean(selectedPullRequest.timestamps.firstViewedByAuthorAt));
  }, [selectedPullRequest?.id]);

  const filteredPullRequests = useMemo(() => {
    const filtered = pullRequests.filter((pullRequest) => {
      if (!activeFilters.length) {
        return true;
      }

      return activeFilters.some((filter) => {
        if (filter === 'NEW') {
          return ['OPEN', 'AI_REVIEWED'].includes(pullRequest.status);
        }

        if (filter === 'PUBLIC') {
          return pullRequest.visibility === 'PUBLIC';
        }

        if (filter === 'PRIVATE') {
          return pullRequest.visibility === 'PRIVATE';
        }

        if (filter === 'CONFLICT') {
          return pullRequest.structuredContent.conflictRisk !== 'LOW';
        }

        if (filter === 'POPULAR') {
          return pullRequest.aiGrading.totalScore >= 75;
        }

        if (filter === 'CHANGES_REQUESTED') {
          return pullRequest.status === 'CHANGES_REQUESTED';
        }

        return pullRequest.status === 'ACCEPTED';
      });
    });

    return filtered.sort((a, b) => {
      if (sort === 'grade') {
        return gradeRank[b.finalGrade] - gradeRank[a.finalGrade];
      }

      if (sort === 'risk') {
        return riskRank[b.structuredContent.conflictRisk] - riskRank[a.structuredContent.conflictRisk];
      }

      return (
        new Date(b.timestamps.submittedAt ?? b.timestamps.draftStartedAt).getTime() -
        new Date(a.timestamps.submittedAt ?? a.timestamps.draftStartedAt).getTime()
      );
    });
  }, [activeFilters, pullRequests, sort]);

  const toggleFilter = (filter: QueueFilter) => {
    setActiveFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
  };

  const canReadContent =
    selectedPullRequest &&
    (showProtectedContent ||
      (selectedPullRequest.visibility === 'PUBLIC' && selectedPullRequest.timestamps.firstViewedByAuthorAt));

  const finalGradeDiffers = selectedPullRequest ? finalGrade !== selectedPullRequest.aiGrading.grade : false;
  const gradeNoteMissing = finalGradeDiffers && !authorNote.trim();
  const rejectMissing = !rejectReason.trim();

  const handleRead = async () => {
    if (!selectedPullRequest) {
      return;
    }

    const updated = await pullRequestService.recordAuthorView(selectedPullRequest.id, MOCK_AUTHOR_ID);
    if (updated) {
      setShowProtectedContent(true);
      await refreshPullRequests(updated.repositoryId);
      toast({ title: '열람 로그가 기록되었습니다', tone: 'success' });
    }
  };

  const handleDecision = async (decision: 'ACCEPT' | 'REQUEST_CHANGES' | 'REJECT') => {
    if (!selectedPullRequest || gradeNoteMissing) {
      return;
    }

    if (decision === 'REJECT' && rejectMissing) {
      return;
    }

    const note =
      decision === 'REJECT'
        ? `[${rejectCategory}] ${rejectReason}`
        : authorNote || '작성자 검토 메모 없음';
    const updated = await pullRequestService.decidePullRequest(
      selectedPullRequest.id,
      decision,
      note,
      finalGrade,
    );

    if (updated) {
      await refreshPullRequests(updated.repositoryId);
      toast({
        title:
          decision === 'ACCEPT'
            ? 'PR을 수락했습니다'
            : decision === 'REQUEST_CHANGES'
              ? '변경 요청으로 표시했습니다'
              : 'PR을 거절했습니다',
        tone: decision === 'REJECT' ? 'warning' : 'success',
      });
    }
  };

  const handleMerge = async () => {
    if (!selectedPullRequest || gradeNoteMissing) {
      return;
    }

    const updated = await pullRequestService.decidePullRequest(
      selectedPullRequest.id,
      'MERGE',
      mergePreview,
      finalGrade,
    );

    if (updated) {
      await refreshPullRequests(updated.repositoryId);
      toast({
        title: 'Merge가 확정되었습니다',
        description: 'mock merge history에 공식 반영 이력이 추가되었습니다.',
        tone: 'success',
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[720px]" />;
  }

  if (!repository) {
    return <EmptyState title="대시보드를 열 수 없습니다" description="mock data에 없는 repository입니다." />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
          <h1 className="text-lg font-semibold text-white">{repository.title}</h1>
          <p className="mt-2 text-sm text-slate-400">PR 검토 대시보드</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {queueFilters.map((filter) => (
              <Button
                key={filter.value}
                onClick={() => toggleFilter(filter.value)}
                size="sm"
                variant={activeFilters.includes(filter.value) ? 'primary' : 'secondary'}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <select
            className="mt-4 h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-accent-300"
            onChange={(event) => setSort(event.target.value as QueueSort)}
            value={sort}
          >
            <option value="recent">최신순</option>
            <option value="grade">등급 높은순</option>
            <option value="risk">충돌 위험순</option>
          </select>
        </section>

        <section className="space-y-3">
          {filteredPullRequests.map((pullRequest) => (
            <PullRequestCard
              key={pullRequest.id}
              author={users.find((user) => user.id === pullRequest.authorId)}
              onClick={() => setSelectedId(pullRequest.id)}
              pullRequest={pullRequest}
              selected={pullRequest.id === selectedId}
            />
          ))}
        </section>
      </aside>

      <section className="min-w-0">
        {!selectedPullRequest ? (
          <EmptyState title="검토할 PR을 선택하세요" description="왼쪽 큐에서 PR을 선택하면 상세 검토 패널이 열립니다." />
        ) : !canReadContent ? (
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-6">
            <ShieldAlert className="size-6 text-amber-200" />
            <h2 className="mt-4 text-xl font-semibold text-white">이 PR을 열람하면 영구 로그가 기록됩니다.</h2>
            <p className="mt-3 text-sm leading-6 text-amber-50/80">
              열람 후 유사 설정 사용 시 컨트리뷰터가 도용 증거로 사용할 수 있습니다.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleRead}>열람합니다</Button>
              <Button onClick={() => setSelectedId(null)} variant="secondary">
                닫기
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <GradeBadge grade={finalGrade} />
                    <Badge tone={selectedPullRequest.visibility === 'PRIVATE' ? 'amber' : 'blue'}>
                      {selectedPullRequest.visibility}
                    </Badge>
                    <Badge tone="slate">{PULL_REQUEST_STATUS_LABELS[selectedPullRequest.status]}</Badge>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-white">{selectedPullRequest.title}</h2>
                  {selectedAuthor ? (
                    <div className="mt-4 flex items-center gap-3">
                      <img
                        alt={`${selectedAuthor.displayName} avatar`}
                        className="size-10 rounded-lg border border-white/10"
                        src={selectedAuthor.avatar}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">@{selectedAuthor.username}</p>
                        <p className="text-xs text-slate-500">
                          Merge rate {selectedAuthor.stats.mergeRate}% · Major {selectedAuthor.stats.majorMerges}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
                <dl className="grid gap-2 text-sm text-slate-400">
                  <div>
                    <dt className="text-xs text-slate-500">Written</dt>
                    <dd>{formatDateTime(selectedPullRequest.timestamps.draftStartedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Submitted</dt>
                    <dd>
                      {selectedPullRequest.timestamps.submittedAt
                        ? formatDateTime(selectedPullRequest.timestamps.submittedAt)
                        : '미제출'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">First viewed</dt>
                    <dd>
                      {selectedPullRequest.timestamps.firstViewedByAuthorAt
                        ? formatDateTime(selectedPullRequest.timestamps.firstViewedByAuthorAt)
                        : '아직 없음'}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
              <h3 className="text-lg font-semibold text-white">AI Summary</h3>
              <div className="mt-5">
                <AiScoreBars grading={selectedPullRequest.aiGrading} />
              </div>
              <p className="mt-5 rounded-lg border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
                {selectedPullRequest.aiGrading.rationale}
              </p>
            </section>

            <ConflictCheckCard pullRequest={selectedPullRequest} repository={repository} />

            <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
              <h3 className="text-lg font-semibold text-white">Structured PR</h3>
              <dl className="mt-4 grid gap-4 text-sm">
                <DetailItem label="핵심 제안" value={selectedPullRequest.structuredContent.coreIdea} />
                <DetailItem label="관련 캐릭터" value={selectedPullRequest.structuredContent.relatedCharacters.join(', ') || '해당 없음'} />
                <DetailItem label="관련 장소" value={selectedPullRequest.structuredContent.relatedLocations.join(', ') || '해당 없음'} />
                <DetailItem label="관련 규칙" value={selectedPullRequest.structuredContent.relatedWorldRules.join(', ') || '해당 없음'} />
                <DetailItem label="원문" value={selectedPullRequest.originalContent} />
              </dl>
            </section>

            {selectedPullRequest.contributorOpinion ? (
              <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold text-white">Contributor Opinion</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {selectedPullRequest.contributorOpinion.note}
                </p>
              </section>
            ) : null}

            <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
              <h3 className="text-lg font-semibold text-white">Final Grade Adjustment</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">AI grade</p>
                  <div className="mt-2">
                    <GradeBadge grade={selectedPullRequest.aiGrading.grade} />
                  </div>
                </div>
                <label className="text-sm font-medium text-slate-300">
                  Final grade
                  <select
                    className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-accent-300"
                    onChange={(event) => setFinalGrade(event.target.value as PullRequestGrade)}
                    value={finalGrade}
                  >
                    {(['MAJOR', 'NORMAL', 'MINOR'] as PullRequestGrade[]).map((grade) => (
                      <option key={grade} value={grade}>
                        {PULL_REQUEST_GRADE_LABELS[grade]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {finalGradeDiffers ? (
                <Textarea
                  className="mt-4"
                  error={gradeNoteMissing ? 'AI 등급과 다르게 조정하는 경우 사유가 필요합니다.' : undefined}
                  label="Author grading note"
                  onChange={(event) => setAuthorNote(event.target.value)}
                  value={authorNote}
                />
              ) : (
                <Textarea
                  className="mt-4"
                  label="Author note"
                  onChange={(event) => setAuthorNote(event.target.value)}
                  value={authorNote}
                />
              )}
            </section>

            <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
              <h3 className="text-lg font-semibold text-white">Actions</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  disabled={gradeNoteMissing}
                  leftIcon={<CheckCircle2 className="size-4" />}
                  onClick={() => handleDecision('ACCEPT')}
                >
                  Accept
                </Button>
                <Button
                  disabled={gradeNoteMissing}
                  leftIcon={<Send className="size-4" />}
                  onClick={() => handleDecision('REQUEST_CHANGES')}
                  variant="secondary"
                >
                  Request Changes
                </Button>
                <Button
                  leftIcon={<Pause className="size-4" />}
                  onClick={() => toast({ title: '검토 보류로 표시했습니다', tone: 'default' })}
                  variant="secondary"
                >
                  Hold
                </Button>
                <Button
                  disabled={gradeNoteMissing || rejectMissing}
                  leftIcon={<XCircle className="size-4" />}
                  onClick={() => handleDecision('REJECT')}
                  variant="danger"
                >
                  Reject
                </Button>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                <select
                  className="h-10 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-accent-300"
                  onChange={(event) => setRejectCategory(event.target.value)}
                  value={rejectCategory}
                >
                  {rejectCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  className="h-10 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200 outline-none focus:border-accent-300"
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Reject 사유"
                  value={rejectReason}
                />
              </div>
            </section>

            {selectedPullRequest.status === 'ACCEPTED' ? (
              <section className="rounded-lg border border-accent-300/20 bg-accent-300/10 p-5">
                <h3 className="text-lg font-semibold text-white">AI가 공식 문서 반영 초안을 생성했습니다</h3>
                <Textarea
                  className="mt-4 min-h-48"
                  onChange={(event) => setMergePreview(event.target.value)}
                  value={mergePreview}
                />
                <Button
                  className="mt-4"
                  disabled={gradeNoteMissing}
                  leftIcon={<GitMerge className="size-4" />}
                  onClick={handleMerge}
                >
                  Merge 확정
                </Button>
              </section>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
};

type DetailItemProps = {
  label: string;
  value: string;
};

const DetailItem = ({ label, value }: DetailItemProps) => {
  return (
    <div>
      <dt className="font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap leading-6 text-slate-200">{value}</dd>
    </div>
  );
};
