import type {
  Difficulty,
  RecruitingAreaStatus,
  RecruitingAreaType,
  RepositoryBadge,
  RepositoryGenre,
  RepositorySortOption,
  WorkScale,
} from '@/features/repository/repository.types';
import type {
  ConflictRisk,
  PullRequestGrade,
  PullRequestStatus,
  PullRequestVisibility,
} from '@/features/pull-request/pullRequest.types';

export const APP_NAME = 'WorldBuild';

export const GENRES: RepositoryGenre[] = ['로맨스', '판타지', '액션', '일상', '스릴러'];

export const RECOMMENDED_TAGS = ['로맨스', '판타지', '액션', '일상', '스릴러'];

export const RECRUITING_AREA_LABELS: Record<RecruitingAreaType, string> = {
  CHARACTER: '캐릭터',
  EPISODE: '에피소드',
  WORLD_RULE: '세계 규칙',
  LOCATION: '지역/세력',
  EXTRA: '외전',
  STORYBOARD: '콘티',
};

export const RECRUITING_STATUS_LABELS: Record<RecruitingAreaStatus, string> = {
  ACTIVELY_RECRUITING: '적극 모집',
  REVIEWING: '검토 중',
  CLOSED: '마감',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

export const REPOSITORY_BADGE_LABELS: Record<RepositoryBadge, string> = {
  ACTIVE_AUTHOR: '활동적인 원작자',
  NEW: '신규',
  FAST_REVIEW: '빠른 검토',
};

export const WORK_SCALE_LABELS: Record<WorkScale, string> = {
  SHORT: '짧은 세계관',
  MEDIUM: '중간 규모',
  LONG: '장편/대형',
};

export const REPOSITORY_SORT_LABELS: Record<RepositorySortOption, string> = {
  RECOMMENDED: '추천순',
  RECENT: '최근 활동순',
  POPULAR: '인기순',
  MERGE_RATE: '반영률순',
  FAST_REVIEW: '빠른 검토순',
  NEW_FIRST: '신생작 우선',
};

export const PULL_REQUEST_STATUS_LABELS: Record<PullRequestStatus, string> = {
  DRAFT: '초안',
  AI_REVIEWED: 'AI 분석 완료',
  OPEN: '접수됨',
  REVIEWING: '검토 중',
  CHANGES_REQUESTED: '수정 요청됨',
  ACCEPTED: '채택됨',
  MERGED: '공식 반영됨',
  REJECTED: '반려',
};

export const PULL_REQUEST_GRADE_LABELS: Record<PullRequestGrade, string> = {
  MAJOR: '핵심 제안',
  NORMAL: '일반 제안',
  MINOR: '작은 제안',
};

export const CONFLICT_RISK_LABELS: Record<ConflictRisk, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

export const VISIBILITY_LABELS: Record<PullRequestVisibility, string> = {
  PUBLIC: '공개 제안',
  PRIVATE: '비공개 제안',
};

export const MOCK_CURRENT_USER_ID = 'user-haneul';
export const MOCK_AUTHOR_ID = 'user-ara';
