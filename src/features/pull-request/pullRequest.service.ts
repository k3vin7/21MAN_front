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
import { apiClient, isApiEnabled } from '@/lib/apiClient';
import { mapApiPullRequest } from '@/lib/apiMappers';
import { API_PATHS } from '@/lib/apiPaths';
import { cloneMock, mockDelay } from '@/lib/mock';

type PullRequestFilters = {
  repositoryId?: string;
  authorId?: string;
  authorUsername?: string;
  statuses?: PullRequestStatus[];
};

let pullRequests = cloneMock(pullRequestsMock);

type ApiListResponse = {
  items?: unknown[];
};

type ApiDraftResponse = {
  pull_request_id?: number | string;
  first_drafted_at?: string;
  last_saved_at?: string;
  raw_content?: string | null;
};

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

const withApiFallback = async <T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>) => {
  if (!isApiEnabled) {
    return mockCall();
  }

  try {
    return await apiCall();
  } catch (error) {
    console.warn('Falling back to pull request mock service.', error);
    return mockCall();
  }
};

const writeWithApiOnly = async <T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>) => {
  if (!isApiEnabled) {
    return mockCall();
  }

  return apiCall();
};

const getApiStatus = (status: PullRequestStatus) => {
  const map: Record<PullRequestStatus, string> = {
    DRAFT: 'DRAFT',
    AI_REVIEWED: 'DRAFT',
    OPEN: 'SUBMITTED',
    REVIEWING: 'SUBMITTED',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    ACCEPTED: 'ACCEPTED',
    MERGED: 'MERGED',
    REJECTED: 'REJECTED',
  };

  return map[status];
};

const replaceCachedPullRequest = (next: PullRequest) => {
  const exists = pullRequests.some((item) => item.id === next.id);
  pullRequests = exists
    ? pullRequests.map((item) => (item.id === next.id ? next : item))
    : [next, ...pullRequests];
};

const getMockPullRequests = async (filters: PullRequestFilters = {}) => {
  await mockDelay();
  const result = pullRequests.filter((pullRequest) => {
    const matchesRepository = filters.repositoryId
      ? pullRequest.repositoryId === filters.repositoryId
      : true;
    const authorFilters = [filters.authorId, filters.authorUsername].filter(Boolean);
    const matchesAuthor = authorFilters.length
      ? authorFilters.includes(pullRequest.authorId)
      : true;
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
};

const getMockPullRequestById = async (pullRequestId: string) => {
  await mockDelay();
  const pullRequest = pullRequests.find((item) => item.id === pullRequestId);

  return pullRequest ? cloneMock(pullRequest) : null;
};

const getApiPullRequestById = async (pullRequestId: string) => {
  const detail = await apiClient.get<Record<string, unknown>>(API_PATHS.pullRequests.detail(pullRequestId));
  const analysis = await apiClient
    .get<Record<string, unknown>>(API_PATHS.pullRequests.aiAnalysis(pullRequestId))
    .catch(() => null);
  const pullRequest = mapApiPullRequest({
    ...detail,
    ai_analysis: analysis,
  });

  replaceCachedPullRequest(pullRequest);
  return pullRequest;
};

export const pullRequestService = {
  async getPullRequests(filters: PullRequestFilters = {}): Promise<PullRequest[]> {
    return withApiFallback(
      async () => {
        const response = await apiClient.get<ApiListResponse>(API_PATHS.pullRequests.list, {
          repo_id: filters.repositoryId,
          author: filters.authorUsername ?? filters.authorId,
          status: filters.statuses?.map(getApiStatus),
          page: 1,
          size: 100,
        });
        const apiPullRequests = (response.items ?? []).map(mapApiPullRequest);

        apiPullRequests.forEach(replaceCachedPullRequest);
        return cloneMock(
          apiPullRequests.sort(
            (a, b) =>
              new Date(b.timestamps.submittedAt ?? b.timestamps.draftStartedAt).getTime() -
              new Date(a.timestamps.submittedAt ?? a.timestamps.draftStartedAt).getTime(),
          ),
        );
      },
      () => getMockPullRequests(filters),
    );
  },

  async getPullRequestById(pullRequestId: string): Promise<PullRequest | null> {
    return withApiFallback<PullRequest | null>(
      () => getApiPullRequestById(pullRequestId),
      () => getMockPullRequestById(pullRequestId),
    );
  },

  async createAiReviewedPullRequest(input: PullRequestDraftInput): Promise<PullRequest> {
    return writeWithApiOnly(
      async () => {
        const draft = await apiClient.post<ApiDraftResponse>(
          API_PATHS.pullRequests.createDraft(input.repositoryId),
        );
        const pullRequestId = String(draft.pull_request_id ?? '');

        await apiClient.patch(API_PATHS.pullRequests.draft(pullRequestId), {
          raw_content: input.originalContent,
        });

        const analysis = await apiClient.post<Record<string, unknown>>(
          API_PATHS.pullRequests.aiAnalyze(pullRequestId),
        );
        const pullRequest = mapApiPullRequest({
          id: pullRequestId,
          pull_request_id: pullRequestId,
          repo_id: input.repositoryId,
          author_id: input.authorId,
          title: input.title,
          raw_content: input.originalContent,
          contribution_types: input.contributionTypes,
          visibility: 'PUBLIC',
          status: 'DRAFT',
          first_drafted_at: draft.first_drafted_at,
          latest_ai_analysis: analysis,
        });

        replaceCachedPullRequest(pullRequest);
        return pullRequest;
      },
      async () => {
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
    );
  },

  async submitPullRequest(pullRequestId: string): Promise<PullRequest | null> {
    return writeWithApiOnly<PullRequest | null>(
      async () => {
        const current = pullRequests.find((item) => item.id === pullRequestId);
        const response = await apiClient.post<Record<string, unknown>>(
          API_PATHS.pullRequests.submit(pullRequestId),
          { visibility: current?.visibility ?? 'PUBLIC' },
        );
        const submittedAt = typeof response.submitted_at === 'string'
          ? response.submitted_at
          : new Date().toISOString();
        const updated = current
          ? {
              ...current,
              status: 'OPEN' as PullRequestStatus,
              visibility: current.visibility,
              timestamps: {
                ...current.timestamps,
                submittedAt,
              },
            }
          : await getApiPullRequestById(pullRequestId);

        replaceCachedPullRequest(updated);
        return cloneMock(updated);
      },
      async () => {
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
    );
  },

  async updatePullRequestReview(
    pullRequestId: string,
    update: PullRequestReviewUpdate,
  ): Promise<PullRequest | null> {
    return writeWithApiOnly<PullRequest | null>(
      async () => {
        if (update.contributorOpinion !== undefined) {
          await apiClient.patch(API_PATHS.pullRequests.contributorComment(pullRequestId), {
            contributor_comment: update.contributorOpinion?.note ?? '',
          });
        }

        const current = pullRequests.find((item) => item.id === pullRequestId) ??
          await getApiPullRequestById(pullRequestId);
        const updated = {
          ...current,
          title: update.title ?? current.title,
          contributorOpinion:
            update.contributorOpinion === undefined
              ? current.contributorOpinion
              : update.contributorOpinion,
          visibility: update.visibility ?? current.visibility,
          finalGrade: update.finalGrade ?? current.finalGrade,
          authorGradingNote: update.authorGradingNote ?? current.authorGradingNote,
        };

        replaceCachedPullRequest(updated);
        return cloneMock(updated);
      },
      async () => {
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
    );
  },

  async recordAuthorView(pullRequestId: string, viewerId: string): Promise<PullRequest | null> {
    return writeWithApiOnly<PullRequest | null>(
      async () => {
        const now = new Date().toISOString();
        const current = await getApiPullRequestById(pullRequestId);
        const updated = {
          ...current,
          status: current.status === 'OPEN' ? 'REVIEWING' as PullRequestStatus : current.status,
          timestamps: {
            ...current.timestamps,
            firstViewedByAuthorAt: current.timestamps.firstViewedByAuthorAt ?? now,
            viewLogs: [...current.timestamps.viewLogs, { viewerId, viewedAt: now }],
          },
        };

        replaceCachedPullRequest(updated);
        return cloneMock(updated);
      },
      async () => {
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
    );
  },

  async decidePullRequest(
    pullRequestId: string,
    decision: PullRequestDecision,
    note = '',
    finalGrade?: PullRequestGrade,
  ): Promise<PullRequest | null> {
    const applyLocalDecision = async () => {
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
    };

    return writeWithApiOnly<PullRequest | null>(
      async () => {
        if (finalGrade) {
          await apiClient.post(API_PATHS.pullRequests.gradeOverride(pullRequestId), {
            grade: finalGrade,
            reason: note,
          });
        }

        if (decision === 'ACCEPT') {
          await apiClient.post(API_PATHS.pullRequests.accept(pullRequestId), { comment: note });
        } else if (decision === 'REQUEST_CHANGES') {
          await apiClient.post(API_PATHS.pullRequests.requestChanges(pullRequestId), {
            reason: note || '수정이 필요합니다.',
            comment: note,
          });
        } else if (decision === 'REJECT') {
          await apiClient.post(API_PATHS.pullRequests.reject(pullRequestId), {
            category: 'OTHER',
            detail: note || '거절 사유가 입력되지 않았습니다.',
          });
        } else {
          await apiClient.post(API_PATHS.pullRequests.merge(pullRequestId), {
            credit_text: note || '공식 세계관에 반영된 기여입니다.',
            readme_apply_note: note,
            comment: note,
            final_grade: finalGrade,
          });
        }

        return getApiPullRequestById(pullRequestId);
      },
      applyLocalDecision,
    );
  },
};
