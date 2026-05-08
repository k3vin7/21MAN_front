export type UserRole = 'AUTHOR' | 'CONTRIBUTOR';

export type User = {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  roles: UserRole[];
  links?: {
    type: string;
    url: string;
  }[];
  stats: {
    repositoriesOwned: number;
    contributionsTotal: number;
    majorMerges: number;
    normalMerges: number;
    minorMerges: number;
    mergeRate: number;
  };
};

export type ContributionField =
  | '캐릭터'
  | '에피소드'
  | '세계 규칙'
  | '지역 설정'
  | '외전'
  | '콘티';

export type FeaturedContributor = {
  userId: string;
  mainField: ContributionField;
  weeklyHighlights: string[];
};

export type ProfileActivityType =
  | 'PR_CREATED'
  | 'PR_REVIEWED'
  | 'PR_MERGED'
  | 'REPOSITORY_CREATED'
  | 'CREDIT_GRANTED';

export type ProfileActivity = {
  id: string;
  userId: string;
  type: ProfileActivityType;
  repositoryId: string;
  pullRequestId?: string;
  title: string;
  occurredAt: string;
};

export type Achievement = {
  id: string;
  userId: string;
  title: string;
  description: string;
  earnedAt: string;
  tone: 'teal' | 'amber' | 'blue' | 'rose';
};

