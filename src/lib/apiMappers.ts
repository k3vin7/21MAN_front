import type {
  RecruitingArea,
  RecruitingAreaType,
  Repository,
  RepositoryBadge,
  RepositoryGenre,
  WorkScale,
} from '@/features/repository/repository.types';
import type {
  ConflictRisk,
  PullRequest,
  PullRequestGrade,
  PullRequestStatus,
  PullRequestVisibility,
} from '@/features/pull-request/pullRequest.types';
import type { User } from '@/features/user/user.types';

type ApiObject = Record<string, unknown>;

const DEFAULT_THUMBNAIL =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80';

const isObject = (value: unknown): value is ApiObject => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const asObject = (value: unknown): ApiObject => (isObject(value) ? value : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => (typeof value === 'number' ? value : fallback);
const asStringArray = (value: unknown) => asArray(value).filter((item): item is string => typeof item === 'string');

const normalizeRecruitingAreaType = (value: unknown): RecruitingAreaType => {
  const normalized = asString(value, 'CHARACTER').toUpperCase();
  const map: Record<string, RecruitingAreaType> = {
    CHARACTER: 'CHARACTER',
    CHARACTER_ADD: 'CHARACTER',
    EPISODE: 'EPISODE',
    EPISODE_ADD: 'EPISODE',
    WORLD_RULE: 'WORLD_RULE',
    WORLDBUILDING: 'WORLD_RULE',
    WORLD_RULE_ADD: 'WORLD_RULE',
    LOCATION: 'LOCATION',
    REGION: 'LOCATION',
    LOCATION_ADD: 'LOCATION',
    EXTRA: 'EXTRA',
    STORYBOARD: 'STORYBOARD',
  };

  return map[normalized] ?? 'CHARACTER';
};

const normalizeGenre = (tags: string[]): RepositoryGenre => {
  if (tags.includes('SF')) {
    return 'SF';
  }

  return '?먰?吏';
};

const normalizeStatus = (status: unknown): PullRequestStatus => {
  const value = asString(status, 'OPEN').toUpperCase();
  const map: Record<string, PullRequestStatus> = {
    DRAFT: 'DRAFT',
    AI_REVIEWED: 'AI_REVIEWED',
    SUBMITTED: 'OPEN',
    OPEN: 'OPEN',
    REVIEWING: 'REVIEWING',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    ACCEPTED: 'ACCEPTED',
    MERGED: 'MERGED',
    REJECTED: 'REJECTED',
  };

  return map[value] ?? 'OPEN';
};

const normalizeGrade = (value: unknown): PullRequestGrade => {
  const grade = asString(value, 'NORMAL').toUpperCase();
  return grade === 'MAJOR' || grade === 'MINOR' ? grade : 'NORMAL';
};

const normalizeVisibility = (value: unknown): PullRequestVisibility => {
  return asString(value, 'PUBLIC').toUpperCase() === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC';
};

const normalizeRisk = (value: unknown): ConflictRisk => {
  const risk = asString(value, 'LOW').toUpperCase();
  return risk === 'HIGH' || risk === 'MEDIUM' ? risk : 'LOW';
};

const buildRecruitingAreas = (value: unknown): RecruitingArea[] => {
  return asArray(value).map((item, index) => {
    const area = asObject(item);
    const rawType = isObject(item) ? area.type : item;

    return {
      id: asString(area.id, `area-${index}`),
      type: normalizeRecruitingAreaType(rawType),
      status: asString(area.status, 'ACTIVELY_RECRUITING') === 'CLOSED' ? 'CLOSED' : 'ACTIVELY_RECRUITING',
      difficulty: 'MEDIUM',
      description: asString(area.description, '백엔드 모집 영역'),
    };
  });
};

export const mapApiUser = (payload: unknown): User => {
  const user = asObject(payload);
  const id = String(user.id ?? user.username ?? 'unknown');
  const username = asString(user.username, id);

  return {
    id,
    username,
    displayName: asString(user.display_name, username),
    avatar: asString(user.avatar, `https://api.dicebear.com/9.x/notionists/svg?seed=${username}`),
    bio: asString(user.bio),
    roles: ['AUTHOR', 'CONTRIBUTOR'],
    stats: {
      repositoriesOwned: asNumber(user.repository_count),
      contributionsTotal: asNumber(user.total_prs),
      majorMerges: asNumber(user.major_count),
      normalMerges: asNumber(user.normal_count),
      minorMerges: asNumber(user.minor_count),
      mergeRate: Math.round(asNumber(user.merge_ratio) * 100),
    },
  };
};

export const mapApiRepository = (payload: unknown): Repository => {
  const repository = asObject(payload);
  const author = asObject(repository.author);
  const readme = asObject(repository.readme);
  const tags = asStringArray(repository.tags);
  const recruitingAreas = buildRecruitingAreas(repository.recruiting_areas);
  const updatedAt = asString(repository.updated_at, asString(repository.created_at, new Date().toISOString()));
  const prCount = asNumber(repository.pr_count);
  const mergeCount = asNumber(repository.merge_count);
  const badges: RepositoryBadge[] = [];

  if (Date.now() - new Date(updatedAt).getTime() < 1000 * 60 * 60 * 24 * 14) {
    badges.push('NEW');
  }

  return {
    id: String(repository.id ?? ''),
    title: asString(repository.title, 'Untitled Repository'),
    thumbnail: asString(repository.thumbnail, DEFAULT_THUMBNAIL),
    authorId: String(author.id ?? author.username ?? ''),
    description: asString(repository.description),
    genre: normalizeGenre(tags),
    workScale: 'MEDIUM' as WorkScale,
    tags,
    externalLinks: asArray(repository.external_links).map((link, index) => ({
      type: `link-${index + 1}`,
      url: asString(link),
    })),
    readme: {
      intro: asString(readme.content, asString(repository.description)),
      worldOverview: asString(readme.content, asString(repository.description)),
      mainCharacters: asArray(readme.characters).map((character, index) => {
        const item = asObject(character);
        return {
          id: `character-${index}`,
          name: asString(item.name, `Character ${index + 1}`),
          role: asString(item.role),
          description: asString(item.description),
        };
      }),
      mainLocations: asArray(readme.regions).map((region, index) => {
        const item = asObject(region);
        return {
          id: `location-${index}`,
          name: asString(item.name, `Location ${index + 1}`),
          description: asString(item.description),
        };
      }),
      coreRules: asStringArray(readme.world_rules),
      forbiddenSettings: asStringArray(readme.forbidden_settings),
      recruitingAreas,
      contributionGuidelines: asString(repository.contribution_guidelines),
    },
    stats: {
      prCount,
      mergeCount,
      mergeRate: prCount > 0 ? Math.round((mergeCount / prCount) * 100) : 0,
      avgReviewDays: asNumber(repository.avg_review_days),
      contributorCount: asNumber(repository.contributor_count),
      lastActivity: updatedAt,
    },
    badges,
  };
};

export const mapApiPullRequest = (payload: unknown): PullRequest => {
  const pullRequest = asObject(payload);
  const repository = asObject(pullRequest.repository);
  const author = asObject(pullRequest.author);
  const analysis = asObject(pullRequest.latest_ai_analysis ?? pullRequest.ai_analysis);
  const structuredContent = asObject(analysis.structured_content ?? pullRequest.structured_content);
  const rejectReason = asObject(pullRequest.reject_reason);
  const mergeInfo = asObject(pullRequest.merge_info);
  const aiGrade = normalizeGrade(
    pullRequest.author_grade_override ?? analysis.ai_grade ?? pullRequest.ai_grade ?? mergeInfo.final_grade,
  );
  const submittedAt = asString(pullRequest.submitted_at);
  const draftedAt = asString(pullRequest.first_drafted_at, asString(pullRequest.created_at, new Date().toISOString()));

  return {
    id: String(pullRequest.id ?? pullRequest.pull_request_id ?? ''),
    repositoryId: String(repository.id ?? pullRequest.repo_id ?? pullRequest.repository_id ?? ''),
    authorId: String(author.id ?? author.username ?? pullRequest.author_id ?? ''),
    title: asString(pullRequest.title, asString(analysis.generated_title, 'Untitled Pull Request')),
    originalContent: asString(pullRequest.raw_content),
    attachments: [],
    contributionTypes: asStringArray(pullRequest.contribution_types ?? analysis.contribution_types).map(
      normalizeRecruitingAreaType,
    ),
    structuredContent: {
      coreIdea: asString(analysis.summary, asString(structuredContent.coreIdea, asString(pullRequest.title))),
      relatedCharacters: asStringArray(structuredContent.relatedCharacters),
      relatedWorldRules: asStringArray(structuredContent.relatedWorldRules),
      relatedLocations: asStringArray(structuredContent.relatedLocations),
      expectedEffect: asString(structuredContent.expectedEffect, asString(analysis.rationale)),
      conflictRisk: normalizeRisk(structuredContent.conflictRisk),
    },
    aiGrading: {
      scope: asNumber(analysis.score_scope),
      permanence: asNumber(analysis.score_permanence),
      cascade: asNumber(analysis.score_cascade),
      alignment: asNumber(analysis.score_alignment),
      specificity: asNumber(analysis.score_specificity),
      totalScore: asNumber(analysis.score_total),
      grade: aiGrade,
      rationale: asString(analysis.rationale, asString(pullRequest.author_review_comment)),
    },
    contributorOpinion: pullRequest.contributor_comment
      ? {
          agreesWithAI: true,
          note: asString(pullRequest.contributor_comment),
        }
      : null,
    finalGrade: normalizeGrade(mergeInfo.final_grade ?? pullRequest.author_grade_override ?? aiGrade),
    authorGradingNote: asString(pullRequest.author_grade_override_reason ?? pullRequest.author_review_comment),
    visibility: normalizeVisibility(pullRequest.visibility),
    status: normalizeStatus(pullRequest.status),
    timestamps: {
      draftStartedAt: draftedAt,
      submittedAt: submittedAt || null,
      firstViewedByAuthorAt: asString(asObject(pullRequest.view_log_summary).first_viewed_at) || null,
      viewLogs: [],
      mergedAt: asString(pullRequest.merged_at ?? mergeInfo.merged_at) || null,
    },
    rejectReason: asString(rejectReason.detail) || null,
  };
};
