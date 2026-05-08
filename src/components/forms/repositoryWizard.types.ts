import type {
  Character,
  Difficulty,
  Location,
  RecruitingArea,
  RecruitingAreaStatus,
  RecruitingAreaType,
  RepositoryGenre,
} from '@/features/repository/repository.types';

export type WizardExternalLink = {
  id: string;
  type: string;
  url: string;
};

export type WizardRecruitingArea = {
  id: string;
  type: RecruitingAreaType;
  status: RecruitingAreaStatus;
  difficulty: Difficulty;
  description: string;
};

export type RepositoryWizardState = {
  title: string;
  thumbnail: string;
  intro: string;
  description: string;
  genres: RepositoryGenre[];
  tags: string[];
  externalLinks: WizardExternalLink[];
  worldOverview: string;
  mainCharacters: Character[];
  mainLocations: Location[];
  coreRulesText: string;
  forbiddenSettingsText: string;
  recruitingAreas: WizardRecruitingArea[];
  contributionGuidelines: string;
  licenseAgreements: string[];
};

export type RepositoryWizardStepProps = {
  draft: RepositoryWizardState;
  updateDraft: (patch: Partial<RepositoryWizardState>) => void;
};

export const createWizardId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
};

export const toRecruitingArea = (area: WizardRecruitingArea): RecruitingArea => ({
  id: area.id,
  type: area.type,
  status: area.status,
  difficulty: area.difficulty,
  description: area.description,
});

