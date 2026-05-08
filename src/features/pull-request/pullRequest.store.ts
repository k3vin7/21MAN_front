import { create } from 'zustand';
import type {
  PullRequest,
  PullRequestDecision,
  PullRequestDraftInput,
  PullRequestGrade,
  PullRequestReviewUpdate,
  PullRequestStatus,
} from '@/features/pull-request/pullRequest.types';
import { pullRequestService } from '@/features/pull-request/pullRequest.service';

type PullRequestFilters = {
  repositoryId?: string;
  authorId?: string;
  statuses?: PullRequestStatus[];
};

type PullRequestState = {
  pullRequests: PullRequest[];
  selectedPullRequest: PullRequest | null;
  filters: PullRequestFilters;
  isLoading: boolean;
  error: string | null;
  fetchPullRequests: (filters?: PullRequestFilters) => Promise<void>;
  fetchPullRequestById: (pullRequestId: string) => Promise<PullRequest | null>;
  createAiReviewedPullRequest: (input: PullRequestDraftInput) => Promise<PullRequest | null>;
  submitPullRequest: (pullRequestId: string) => Promise<PullRequest | null>;
  updatePullRequestReview: (
    pullRequestId: string,
    update: PullRequestReviewUpdate,
  ) => Promise<PullRequest | null>;
  recordAuthorView: (pullRequestId: string, viewerId: string) => Promise<PullRequest | null>;
  decidePullRequest: (
    pullRequestId: string,
    decision: PullRequestDecision,
    note?: string,
    finalGrade?: PullRequestGrade,
  ) => Promise<PullRequest | null>;
  selectPullRequest: (pullRequest: PullRequest | null) => void;
};

const replacePullRequest = (items: PullRequest[], next: PullRequest) => {
  const exists = items.some((item) => item.id === next.id);

  if (!exists) {
    return [next, ...items];
  }

  return items.map((item) => (item.id === next.id ? next : item));
};

export const usePullRequestStore = create<PullRequestState>((set, get) => ({
  pullRequests: [],
  selectedPullRequest: null,
  filters: {},
  isLoading: false,
  error: null,

  fetchPullRequests: async (filters) => {
    const nextFilters = filters ?? get().filters;
    set({ isLoading: true, error: null, filters: nextFilters });

    try {
      const pullRequests = await pullRequestService.getPullRequests(nextFilters);
      set({ pullRequests, isLoading: false });
    } catch {
      set({ error: '창작 제안 목록을 불러오지 못했습니다.', isLoading: false });
    }
  },

  fetchPullRequestById: async (pullRequestId) => {
    set({ isLoading: true, error: null });

    try {
      const selectedPullRequest = await pullRequestService.getPullRequestById(pullRequestId);
      set({ selectedPullRequest, isLoading: false });
      return selectedPullRequest;
    } catch {
      set({ error: '창작 제안 정보를 불러오지 못했습니다.', isLoading: false });
      return null;
    }
  },

  createAiReviewedPullRequest: async (input) => {
    set({ isLoading: true, error: null });

    try {
      const pullRequest = await pullRequestService.createAiReviewedPullRequest(input);
      set((state) => ({
        pullRequests: replacePullRequest(state.pullRequests, pullRequest),
        selectedPullRequest: pullRequest,
        isLoading: false,
      }));
      return pullRequest;
    } catch {
      set({ error: 'AI 검토 창작 제안을 생성하지 못했습니다.', isLoading: false });
      return null;
    }
  },

  submitPullRequest: async (pullRequestId) => {
    set({ isLoading: true, error: null });

    try {
      const pullRequest = await pullRequestService.submitPullRequest(pullRequestId);
      if (pullRequest) {
        set((state) => ({
          pullRequests: replacePullRequest(state.pullRequests, pullRequest),
          selectedPullRequest: pullRequest,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return pullRequest;
    } catch {
      set({ error: '창작 제안을 제출하지 못했습니다.', isLoading: false });
      return null;
    }
  },

  updatePullRequestReview: async (pullRequestId, update) => {
    set({ isLoading: true, error: null });

    try {
      const pullRequest = await pullRequestService.updatePullRequestReview(pullRequestId, update);
      if (pullRequest) {
        set((state) => ({
          pullRequests: replacePullRequest(state.pullRequests, pullRequest),
          selectedPullRequest: pullRequest,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return pullRequest;
    } catch {
      set({ error: '창작 제안 검토 정보를 저장하지 못했습니다.', isLoading: false });
      return null;
    }
  },

  recordAuthorView: async (pullRequestId, viewerId) => {
    set({ isLoading: true, error: null });

    try {
      const pullRequest = await pullRequestService.recordAuthorView(pullRequestId, viewerId);
      if (pullRequest) {
        set((state) => ({
          pullRequests: replacePullRequest(state.pullRequests, pullRequest),
          selectedPullRequest: pullRequest,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return pullRequest;
    } catch {
      set({ error: '창작 제안 열람 기록을 저장하지 못했습니다.', isLoading: false });
      return null;
    }
  },

  decidePullRequest: async (pullRequestId, decision, note, finalGrade) => {
    set({ isLoading: true, error: null });

    try {
      const pullRequest = await pullRequestService.decidePullRequest(
        pullRequestId,
        decision,
        note,
        finalGrade,
      );
      if (pullRequest) {
        set((state) => ({
          pullRequests: replacePullRequest(state.pullRequests, pullRequest),
          selectedPullRequest: pullRequest,
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }
      return pullRequest;
    } catch {
      set({ error: '창작 제안 처리 결과를 저장하지 못했습니다.', isLoading: false });
      return null;
    }
  },

  selectPullRequest: (pullRequest) => {
    set({ selectedPullRequest: pullRequest });
  },
}));
