import type {
  ConflictRisk,
  PullRequest,
  PullRequestDecision,
  PullRequestDraftInput,
  PullRequestGrade,
  PullRequestReviewUpdate,
  PullRequestStatus,
} from '@/features/pull-request/pullRequest.types';
import { mergeHistoryMock } from '@/mocks/activities.mock';
import { pullRequestsMock } from '@/mocks/pullRequests.mock';
import { cloneMock, mockDelay } from '@/lib/mock';

type PullRequestFilters = {
  repositoryId?: string;
  authorId?: string;
  statuses?: PullRequestStatus[];
};

let pullRequests = cloneMock(pullRequestsMock);

const getGradeFromScore = (score: number): PullRequestGrade => {
  if (score >= 80) {
    return 'MAJOR';
  }

  if (score >= 55) {
    return 'NORMAL';
  }

  return 'MINOR';
};

const createMockAnalysis = (input: PullRequestDraftInput) => {
  const baseScore = Math.min(90, Math.max(45, input.originalContent.length / 8));
  const scope = Math.round(Math.min(20, baseScore / 5));
  const permanence = input.contributionTypes.includes('WORLD_RULE') ? 18 : 13;
  const cascade = input.contributionTypes.length > 1 ? 15 : 10;
  const alignment = Math.round(Math.min(20, 12 + input.originalContent.length / 120));
  const specificity = input.originalContent.length > 120 ? 17 : 12;
  const totalScore = scope + permanence + cascade + alignment + specificity;
  const grade = getGradeFromScore(totalScore);
  const conflictRisk: ConflictRisk = totalScore > 82 ? 'MEDIUM' : 'LOW';

  return {
    structuredContent: {
      coreIdea: input.originalContent.slice(0, 120),
      relatedCharacters: [] as string[],
      relatedWorldRules: input.contributionTypes.includes('WORLD_RULE') ? ['새 세계 규칙 후보'] : [],
      relatedLocations: input.contributionTypes.includes('LOCATION') ? ['새 지역 후보'] : [],
      expectedEffect: '기존 세계관의 빈 공간을 채우고 후속 에피소드의 진입점을 만듭니다.',
      conflictRisk,
    },
    aiGrading: {
      scope,
      permanence,
      cascade,
      alignment,
      specificity,
      totalScore,
      grade,
      rationale: '초안의 구체성, 공식 설정 반영 범위, 충돌 가능성을 기준으로 산정한 mock AI 분석입니다.',
    },
  };
};

export const pullRequestService = {
  async getPullRequests(filters: PullRequestFilters = {}): Promise<PullRequest[]> {
    await mockDelay();
    const result = pullRequests.filter((pullRequest) => {
      const matchesRepository = filters.repositoryId
        ? pullRequest.repositoryId === filters.repositoryId
        : true;
      const matchesAuthor = filters.authorId ? pullRequest.authorId === filters.authorId : true;
      const matchesStatus = filters.statuses?.length
        ? filters.statuses.includes(pullRequest.status)
        : true;

      return matchesRepository && matchesAuthor && matchesStatus;
    });

    return cloneMock(
      result.sort(
        (a, b) =>
          new Date(b.timestamps.submittedAt ?? b.timestamps.draftStartedAt).getTime() -
          new Date(a.timestamps.submittedAt ?? a.timestamps.draftStartedAt).getTime(),
      ),
    );
  },

  async getPullRequestById(pullRequestId: string): Promise<PullRequest | null> {
    await mockDelay();
    const pullRequest = pullRequests.find((item) => item.id === pullRequestId);

    return pullRequest ? cloneMock(pullRequest) : null;
  },

  async createAiReviewedPullRequest(input: PullRequestDraftInput): Promise<PullRequest> {
    await mockDelay();
    const now = new Date().toISOString();
    const analysis = createMockAnalysis(input);
    const pullRequest: PullRequest = {
      id: `pr-${Date.now()}`,
      repositoryId: input.repositoryId,
      authorId: input.authorId,
      title: input.title,
      originalContent: input.originalContent,
      attachments: [],
      contributionTypes: input.contributionTypes,
      structuredContent: analysis.structuredContent,
      aiGrading: analysis.aiGrading,
      contributorOpinion: null,
      finalGrade: analysis.aiGrading.grade,
      authorGradingNote: '',
      visibility: 'PUBLIC',
      status: 'AI_REVIEWED',
      timestamps: {
        draftStartedAt: now,
        submittedAt: null,
        firstViewedByAuthorAt: null,
        viewLogs: [],
        mergedAt: null,
      },
      rejectReason: null,
    };

    pullRequests = [pullRequest, ...pullRequests];

    return cloneMock(pullRequest);
  },

  async submitPullRequest(pullRequestId: string): Promise<PullRequest | null> {
    await mockDelay();
    const now = new Date().toISOString();
    pullRequests = pullRequests.map((pullRequest) =>
      pullRequest.id === pullRequestId
        ? {
            ...pullRequest,
            status: 'OPEN',
            timestamps: {
              ...pullRequest.timestamps,
              submittedAt: now,
            },
          }
        : pullRequest,
    );

    const updated = pullRequests.find((pullRequest) => pullRequest.id === pullRequestId);
    return updated ? cloneMock(updated) : null;
  },

  async updatePullRequestReview(
    pullRequestId: string,
    update: PullRequestReviewUpdate,
  ): Promise<PullRequest | null> {
    await mockDelay();

    pullRequests = pullRequests.map((pullRequest) =>
      pullRequest.id === pullRequestId
        ? {
            ...pullRequest,
            title: update.title ?? pullRequest.title,
            contributorOpinion:
              update.contributorOpinion === undefined
                ? pullRequest.contributorOpinion
                : update.contributorOpinion,
            visibility: update.visibility ?? pullRequest.visibility,
            finalGrade: update.finalGrade ?? pullRequest.finalGrade,
            authorGradingNote: update.authorGradingNote ?? pullRequest.authorGradingNote,
          }
        : pullRequest,
    );

    const updated = pullRequests.find((pullRequest) => pullRequest.id === pullRequestId);
    return updated ? cloneMock(updated) : null;
  },

  async recordAuthorView(pullRequestId: string, viewerId: string): Promise<PullRequest | null> {
    await mockDelay();
    const now = new Date().toISOString();
    pullRequests = pullRequests.map((pullRequest) => {
      if (pullRequest.id !== pullRequestId) {
        return pullRequest;
      }

      return {
        ...pullRequest,
        status: pullRequest.status === 'OPEN' ? 'REVIEWING' : pullRequest.status,
        timestamps: {
          ...pullRequest.timestamps,
          firstViewedByAuthorAt: pullRequest.timestamps.firstViewedByAuthorAt ?? now,
          viewLogs: [...pullRequest.timestamps.viewLogs, { viewerId, viewedAt: now }],
        },
      };
    });

    const updated = pullRequests.find((pullRequest) => pullRequest.id === pullRequestId);
    return updated ? cloneMock(updated) : null;
  },

  async decidePullRequest(
    pullRequestId: string,
    decision: PullRequestDecision,
    note = '',
    finalGrade?: PullRequestGrade,
  ): Promise<PullRequest | null> {
    await mockDelay();
    const now = new Date().toISOString();
    const statusByDecision: Record<PullRequestDecision, PullRequestStatus> = {
      ACCEPT: 'ACCEPTED',
      REQUEST_CHANGES: 'CHANGES_REQUESTED',
      REJECT: 'REJECTED',
      MERGE: 'MERGED',
    };

    pullRequests = pullRequests.map((pullRequest) =>
      pullRequest.id === pullRequestId
        ? {
            ...pullRequest,
            status: statusByDecision[decision],
            finalGrade: finalGrade ?? pullRequest.finalGrade,
            authorGradingNote: note,
            timestamps: {
              ...pullRequest.timestamps,
              mergedAt: decision === 'MERGE' ? now : pullRequest.timestamps.mergedAt,
            },
            rejectReason: decision === 'REJECT' ? note : pullRequest.rejectReason,
          }
        : pullRequest,
    );

    const updated = pullRequests.find((pullRequest) => pullRequest.id === pullRequestId);

    if (updated && decision === 'MERGE') {
      const alreadyExists = mergeHistoryMock.some((entry) => entry.pullRequestId === updated.id);

      if (!alreadyExists) {
        mergeHistoryMock.unshift({
          id: `merge-${Date.now()}`,
          repositoryId: updated.repositoryId,
          pullRequestId: updated.id,
          contributorId: updated.authorId,
          title: updated.title,
          grade: finalGrade ?? updated.finalGrade,
          mergedAt: updated.timestamps.mergedAt ?? now,
          summary: note || updated.structuredContent.expectedEffect,
        });
      }
    }

    return updated ? cloneMock(updated) : null;
  },
};
