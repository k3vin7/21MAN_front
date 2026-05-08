import type { RecruitingAreaType } from '@/features/repository/repository.types';

export type PullRequestGrade = 'MAJOR' | 'NORMAL' | 'MINOR';
export type ConflictRisk = 'HIGH' | 'MEDIUM' | 'LOW';
export type PullRequestVisibility = 'PUBLIC' | 'PRIVATE';

export type PullRequestStatus =
  | 'DRAFT'
  | 'AI_REVIEWED'
  | 'OPEN'
  | 'REVIEWING'
  | 'CHANGES_REQUESTED'
  | 'ACCEPTED'
  | 'MERGED'
  | 'REJECTED';

export type PullRequest = {
  id: string;
  repositoryId: string;
  authorId: string;
  title: string;
  originalContent: string;
  attachments: {
    type: 'image' | 'file';
    url: string;
  }[];
  contributionTypes: string[];
  structuredContent: {
    coreIdea: string;
    relatedCharacters: string[];
    relatedWorldRules: string[];
    relatedLocations: string[];
    expectedEffect: string;
    conflictRisk: ConflictRisk;
  };
  aiGrading: {
    scope: number;
    permanence: number;
    cascade: number;
    alignment: number;
    specificity: number;
    totalScore: number;
    grade: PullRequestGrade;
    rationale: string;
  };
  contributorOpinion: {
    agreesWithAI: boolean;
    note: string;
  } | null;
  finalGrade: PullRequestGrade;
  authorGradingNote: string;
  visibility: PullRequestVisibility;
  status: PullRequestStatus;
  timestamps: {
    draftStartedAt: string;
    submittedAt: string | null;
    firstViewedByAuthorAt: string | null;
    viewLogs: {
      viewerId: string;
      viewedAt: string;
    }[];
    mergedAt: string | null;
  };
  rejectReason: string | null;
};

export type PullRequestDraftInput = {
  repositoryId: string;
  authorId: string;
  title: string;
  originalContent: string;
  contributionTypes: RecruitingAreaType[];
};

export type PullRequestDecision = 'ACCEPT' | 'REQUEST_CHANGES' | 'REJECT' | 'MERGE';

export type PullRequestReviewUpdate = {
  title?: string;
  contributorOpinion?: {
    agreesWithAI: boolean;
    note: string;
  } | null;
  visibility?: PullRequestVisibility;
  finalGrade?: PullRequestGrade;
  authorGradingNote?: string;
};

export type MergeHistoryEntry = {
  id: string;
  repositoryId: string;
  pullRequestId: string;
  contributorId: string;
  title: string;
  grade: PullRequestGrade;
  mergedAt: string;
  summary: string;
};
