export type RepositoryBadge = 'ACTIVE_AUTHOR' | 'NEW' | 'FAST_REVIEW';

export type RepositoryGenre = '판타지' | 'SF' | '전통설화' | '현대' | '무협';

export type WorkScale = 'SHORT' | 'MEDIUM' | 'LONG';

export type RecruitingAreaType =
  | 'CHARACTER'
  | 'EPISODE'
  | 'WORLD_RULE'
  | 'LOCATION'
  | 'EXTRA'
  | 'STORYBOARD';

export type RecruitingAreaStatus = 'ACTIVELY_RECRUITING' | 'REVIEWING' | 'CLOSED';

export type Difficulty = 'HIGH' | 'MEDIUM' | 'LOW';

export type Character = {
  id: string;
  name: string;
  role: string;
  description: string;
};

export type Location = {
  id: string;
  name: string;
  description: string;
};

export type RecruitingArea = {
  id: string;
  type: RecruitingAreaType;
  status: RecruitingAreaStatus;
  difficulty: Difficulty;
  description: string;
};

export type Repository = {
  id: string;
  title: string;
  thumbnail: string;
  authorId: string;
  description: string;
  genre: RepositoryGenre;
  workScale: WorkScale;
  tags: string[];
  externalLinks: {
    type: string;
    url: string;
  }[];
  readme: {
    intro: string;
    worldOverview: string;
    mainCharacters: Character[];
    mainLocations: Location[];
    coreRules: string[];
    forbiddenSettings: string[];
    recruitingAreas: RecruitingArea[];
    contributionGuidelines: string;
  };
  stats: {
    prCount: number;
    mergeCount: number;
    mergeRate: number;
    avgReviewDays: number;
    contributorCount: number;
    lastActivity: string;
  };
  badges: RepositoryBadge[];
};

export type RepositorySortOption =
  | 'RECOMMENDED'
  | 'RECENT'
  | 'POPULAR'
  | 'MERGE_RATE'
  | 'FAST_REVIEW'
  | 'NEW_FIRST';

export type RepositorySearchFilters = {
  query?: string;
  tag?: string;
  genres?: RepositoryGenre[];
  recruitingAreas?: RecruitingAreaType[];
  authorActivity?: 'ACTIVE' | 'STEADY' | 'QUIET';
  badges?: RepositoryBadge[];
  minMergeRate?: number;
  recruitingOnly?: boolean;
  workScales?: WorkScale[];
  sort?: RepositorySortOption;
};
