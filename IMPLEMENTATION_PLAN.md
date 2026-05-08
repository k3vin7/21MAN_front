# IMPLEMENTATION_PLAN.md

# WorldBuild Frontend Implementation Plan

React + Vite + TypeScript 기반으로 `WorldBuild` 공동창작 플랫폼 프론트엔드를 구현한다.

이 문서는 Codex가 프로젝트 루트에서 읽고, 단계별로 구현할 수 있도록 작성된 전체 구현 지시서다.

---

## 0. Project Overview

WorldBuild는 창작 업계 지망생을 위한 GitHub 스타일의 공동창작 플랫폼이다.

원작자는 세계관 Repository를 만들고, 컨트리뷰터는 자유롭게 기여 PR을 작성한다.  
AI는 PR 내용을 분석하여 기여 유형, 구조화된 PR 양식, 충돌 가능성, 기여 등급을 판정한다.  
원작자는 PR을 검토한 뒤 Accept / Request Changes / Reject / Merge를 결정한다.  
Merge된 기여는 공식 세계관에 반영되고, 컨트리뷰터 프로필에 영구 크레딧으로 기록된다.

### Core Identity

- “여러분의 첫 크레딧은 여기서 시작됩니다.”
- 컨트리뷰터는 팬이 아니라 공동창작자다.
- 모든 PR에는 작성 / 제출 / 열람 / Merge 타임스탬프가 기록된다.
- IP는 원작자에게 귀속된다.
- 크레딧은 컨트리뷰터에게 영구 보장된다.
- Public PR은 도용 방지와 증거 확보에 더 유리하다.
- Private PR은 원작자와 작성자만 볼 수 있다.

---

## 1. Tech Stack

Use the following stack:

- React
- Vite
- TypeScript
- React Router DOM
- Tailwind CSS
- Zustand
- TanStack Query
- lucide-react
- clsx or classnames
- Mock data only
- No real backend API integration yet

The project should be implemented like a real-world React frontend project with clear folder separation, reusable components, mock services, stores, hooks, and types.

---

## 2. Design Direction

### Visual Tone

- Calm and trustworthy
- GitHub + Notion style
- Dark-mode-first
- Light mode should be structurally possible
- Gray scale base
- Deep teal accent color
- Korean-inspired mood, but not traditional or old-fashioned
- Clean spacing and readable hierarchy

### UI Hierarchy

Use this flow:

1. Card
2. Hover overlay
3. Modal preview
4. Detail page

### Responsive Grid

- 1440px and above: 4 columns
- 1024px: 3 columns
- 768px: 2 columns
- 480px and below: 1 column

---

## 3. Project Folder Structure

Create and use the following structure.

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx

  pages/
    HomePage.tsx
    SearchPage.tsx
    RepositoryDetailPage.tsx
    NewPullRequestPage.tsx
    PullRequestReviewPage.tsx
    AuthorDashboardPage.tsx
    UserProfilePage.tsx
    NewRepositoryPage.tsx
    NotFoundPage.tsx

  layouts/
    RootLayout.tsx
    DashboardLayout.tsx

  components/
    common/
      Header.tsx
      Footer.tsx
      Button.tsx
      Input.tsx
      Textarea.tsx
      Modal.tsx
      Tabs.tsx
      Badge.tsx
      Card.tsx
      Skeleton.tsx
      Toast.tsx
      EmptyState.tsx

    repository/
      RepoCard.tsx
      RepoGrid.tsx
      RepoDetailModal.tsx
      RepoStatsBar.tsx
      RecruitingAreaCard.tsx
      RepositoryReadme.tsx
      RepositoryTabs.tsx

    pull-request/
      GradeBadge.tsx
      PullRequestListItem.tsx
      PullRequestCard.tsx
      AiScoreBars.tsx
      ConflictCheckCard.tsx
      TimestampGuard.tsx
      LicenseNotice.tsx
      VisibilitySelector.tsx
      AgreementChecklist.tsx

    contributor/
      ContributorCard.tsx
      ContributorBadge.tsx
      ContributionSummaryCard.tsx
      ActivityGraph.tsx
      AchievementBadge.tsx

    forms/
      RepositoryWizard.tsx
      StepBasicInfo.tsx
      StepExternalLinks.tsx
      StepReadme.tsx
      StepRecruitingAreas.tsx
      StepLicense.tsx
      StepPreview.tsx

  features/
    repository/
      repository.types.ts
      repository.store.ts
      repository.service.ts

    pull-request/
      pullRequest.types.ts
      pullRequest.store.ts
      pullRequest.service.ts

    user/
      user.types.ts
      user.store.ts
      user.service.ts

  mocks/
    users.mock.ts
    repositories.mock.ts
    pullRequests.mock.ts
    activities.mock.ts

  hooks/
    useDebounce.ts
    useLocalStorage.ts
    useModal.ts
    useToast.ts
    useIntersectionObserver.ts

  lib/
    cn.ts
    date.ts
    format.ts
    constants.ts

  styles/
    globals.css

  main.tsx
```

Do not put all UI into one large file.  
If a file becomes too long, split it into smaller components.

---

## 4. Data Types

Place domain types in the matching `src/features/*/*.types.ts` files.

### 4.1 User

```ts
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
```

### 4.2 Repository

```ts
export type RepositoryBadge = 'ACTIVE_AUTHOR' | 'NEW' | 'FAST_REVIEW';

export type RecruitingAreaType =
  | 'CHARACTER'
  | 'EPISODE'
  | 'WORLD_RULE'
  | 'LOCATION'
  | 'EXTRA'
  | 'STORYBOARD';

export type RecruitingAreaStatus =
  | 'ACTIVELY_RECRUITING'
  | 'REVIEWING'
  | 'CLOSED';

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
```

### 4.3 PullRequest

```ts
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
```

---

## 5. Routing

Use React Router DOM.

Create the following routes:

```txt
/                           -> HomePage
/search                     -> SearchPage
/r/new                      -> NewRepositoryPage
/r/:repoId                  -> RepositoryDetailPage
/r/:repoId/pr/new           -> NewPullRequestPage
/r/:repoId/pr/:prId/review  -> PullRequestReviewPage
/r/:repoId/dashboard        -> AuthorDashboardPage
/u/:username                -> UserProfilePage
*                           -> NotFoundPage
```

Use a `RootLayout` with `Header`, `main`, and `Footer` where appropriate.

---

## 6. Pages

## 6.1 HomePage `/`

### Purpose

Introduce the platform and guide users to search repositories, contribute to worlds, or register their own world.

### Sections

#### 1. Sticky Header

- Logo
- Search bar
- Login button
- Register repository button
- Mobile menu button on small screens

#### 2. Hero

- Main copy: `여러분의 첫 크레딧은 여기서 시작됩니다`
- Sub copy: `다른 창작자의 세계관에 기여하고, 내 창작 이력을 쌓는 공동창작 플랫폼`
- Large centered search box
- Recommended tag chips:
  - #전통설화
  - #판타지
  - #지역문화
  - #캐릭터모집
  - #에피소드제안

Search behavior:

- Pressing Enter navigates to `/search?q=<query>`.
- Clicking a tag navigates to `/search?tag=<tag>`.

#### 3. Repositories Looking for Contributors

- Section title: `지금 기여자를 찾는 세계관`
- Show 4 `RepoCard` items in a responsive grid.
- Each card shows thumbnail and title by default.
- On hover, show overlay with:
  - Author name
  - Activity badges
  - PR count
  - Merge count
  - Merge rate
  - Average review days
  - Recruiting areas
- On click, open `RepoDetailModal`.

#### 4. Featured Contributors

- Section title: `이번 주 주목받는 컨트리뷰터`
- Show 4 `ContributorCard` items.
- Each card shows:
  - Avatar
  - Username
  - Main contribution field
  - Major Merge count

This section is important. Contributors should be treated as equal creative participants, not only fans.

#### 5. First-time User Entry

Two large cards:

- `컨트리뷰터로 시작`
  - Description: `다른 사람 세계관에 기여하면서 창작 이력을 쌓아보세요`
  - CTA: `세계관 둘러보기`
- `원작자로 시작`
  - Description: `내 세계관을 등록하고 함께 키워갈 동료를 만나보세요`
  - CTA: `세계관 등록하기`

#### 6. Footer

- Terms
- Privacy
- License policy
- Contact

---

## 6.2 SearchPage `/search`

### Purpose

Allow users to search and filter repositories.

### Layout

- Header with sticky search
- Left filter sidebar, about 200px wide
- Right result area with responsive grid

### Left Filter Sidebar

Filters should work against mock data.

#### Genre

Multi-select:

- 판타지
- SF
- 전통설화
- 현대
- 무협

#### Recruiting Area

Multi-select:

- 캐릭터
- 지역세력
- 에피소드
- 외전
- 콘티

#### Author Activity

Multi-select:

- 활발한 작가
- 신생 작가
- 검토 빠름

#### Merge Rate

Radio:

- 전체
- 10% 이상
- 30% 이상

#### Work Scale

Multi-select:

- 신생
- 성장
- 성숙

Include a `필터 초기화` button.

### Top Controls

- Sort dropdown:
  - 활동성순
  - 최신순
  - Merge율 높은순
  - 신생작 우선

- Quick filter chips:
  - 신생작 우선
  - 모집중
  - 검토 빠름

### Results

- Use `RepoGrid` and `RepoCard`.
- Card click opens `RepoDetailModal`.
- If no result, show an `EmptyState`:
  - `못 찾으셨나요? 컨트리뷰터로 검색해보세요.`

---

## 6.3 RepositoryDetailPage `/r/:repoId`

### Purpose

Show a single worldbuilding repository with README, PRs, contributors, merge history, and insights.

### 1. Repository Header

Show:

- Thumbnail
- Repository title
- Author
- Activity badges
- Tags
- Description
- External links
- Watch button
- Bookmark button
- Main CTA: `Contribute 기여하기`

`Contribute` button navigates to `/r/:repoId/pr/new`.

### 2. Stats Bar

Show one-row stats:

- PR
- Merge
- Merge rate
- Average review days
- Contributor count
- Last activity

### 3. Tabs

Use reusable `Tabs` component.

Tabs:

- README
- Pull Requests
- Contributors
- Merge History
- Insights

### 4. README Tab

Sections:

- 작품 소개
- 세계관 개요
- 주요 캐릭터
- 주요 지역
- 핵심 규칙
- 금지 설정
- 지금 받고 싶은 기여
- 기여 가이드라인
- 라이선스 정책 링크

Forbidden settings should use a warning visual style.

Recruiting areas should use `RecruitingAreaCard`.

### 5. Pull Requests Tab

Include:

- Filter chips:
  - Open
  - Reviewing
  - Changes Requested
  - Closed
  - 내 PR만
- Sort options:
  - 최신순
  - 등급 높은순
  - 추천순
- PR list using `PullRequestListItem`.

Each PR list item shows:

- Grade badge
- PR title
- Author
- Time
- Public / Private
- AI grade
- Impact summary
- Conflict risk
- Status

### 6. Contributors Tab

- Contributor grid
- Avatar
- Username
- Contribution count
- Major Merge count
- Sort by contribution count or recent activity

### 7. Merge History Tab

Timeline style:

- Grade badge
- PR title
- Contributor
- Merge date
- Author comment
- Shareable URL placeholder

### 8. Insights Tab

Show placeholder:

`데이터를 수집 중입니다.`

---

## 6.4 NewPullRequestPage `/r/:repoId/pr/new`

### Purpose

Allow a contributor to freely write a proposal without rigid forms.

### Layout

Single column, max width 800px.

### 1. Top Context

Show:

- Back link: `← 작품으로 돌아가기`
- Title: `이 세계관에 기여하기`
- Author context: `@username 의 세계관에 PR을 보냅니다`

### 2. Pre-writing Checklist Box

Show:

- `이 작품의 금지 설정을 확인하셨나요?`
- Link: `README 확인하기`
- Current recruiting areas
- License summary:
  - IP belongs to the original author after Merge
  - Credit is permanently guaranteed to the contributor

### 3. Main Writing Area

- Large textarea
- Minimum height: 400px
- Auto-resize if possible
- Character count
- Placeholder with a creative example
- Guide text:
  - `어떤 종류든 자유롭게 쓰세요. AI가 PR 양식으로 정리하고 등급을 판정합니다.`

### 4. Attachments

V2 placeholder:

- Add image button
- Add file button
- No actual upload required

### 5. Auto Save

Use localStorage.

- Save every 30 seconds
- Save 5 seconds after text change using debounce
- Show status:
  - `자동 저장 중`
  - `마지막 저장: 방금 전`

Record first typing timestamp in local state / localStorage.

### 6. Actions

- Temporary save
- Primary: `AI 분석 받기`

When clicking `AI 분석 받기`:

- Create a mock PR
- Navigate to `/r/:repoId/pr/:prId/review`

### 7. Timestamp Guard

Use `TimestampGuard` component to show:

- Writing time is automatically recorded
- Submission time is recorded
- Author view time is recorded
- These logs can be used as evidence if plagiarism happens

---

## 6.5 PullRequestReviewPage `/r/:repoId/pr/:prId/review`

### Purpose

Show AI analysis result and let the contributor confirm before submitting.

### Layout

Single column, max width 900px.

### 1. Top

- Title: `AI가 PR을 분석했습니다`
- Subtitle: `내용을 확인하고 제출하세요`

### 2. AI Analysis Progress

If loading, show mock progress steps:

- `내용 분석 중...`
- `기여 유형 판정 중...`
- `등급 계산 중...`
- `충돌 검사 중...`

### 3. Basic Summary Card

Show:

- Editable PR title
- Contribution type chips
- One-line summary

### 4. Structured PR Card

Show:

- Core proposal
- Related characters
- Related locations / factions
- Related world rules
- Expected effect
- Original text toggle

### 5. AI Grade Card

Most important card.

Show:

- Large `GradeBadge`
- Total score, example `38/50`
- 5-axis score bars using `AiScoreBars`:
  - Scope
  - Permanence
  - Cascade
  - Alignment
  - Specificity
- AI rationale

Grade labels for users:

- MAJOR -> 상
- NORMAL -> 중
- MINOR -> 하

### 6. Contributor Opinion

Ask:

`AI 판정에 동의하시나요?`

Options:

- `동의합니다`
- `이의 있음`

If disagreement is selected, show textarea for note.

The contributor cannot directly change the AI grade. The note is only passed to the author.

### 7. Conflict Check Card

Show:

- Conflict risk: 낮음 / 중간 / 높음
- Checklist:
  - No conflict with forbidden settings
  - No contradiction with existing characters
  - Possible overlap with an existing concept
- Missing details if any

### 8. Visibility Selector

Radio options:

- Public
  - Other users can view it and react.
- Private
  - Only the author and contributor can view it.

Show guide:

- Public is safer for proving originality because there are more witnesses.
- Private has fewer witnesses, but still records timestamps.
- If a Private PR is merged, official merge history may become public.

### 9. Agreement Checklist

All must be checked before submit button is enabled.

- Merge 시 IP는 원작자에게 귀속됨에 동의
- 크레딧은 내 프로필에 영구 표기됨에 동의
- 작성 / 제출 / 열람 시점이 영구 기록됨에 동의

### 10. Actions

- Back to edit
- Temporary save
- Submit

Submit button must be disabled until every agreement is checked.

On submit:

- Show confirmation modal
- Change PR status to `OPEN`
- Show success toast

---

## 6.6 AuthorDashboardPage `/r/:repoId/dashboard`

### Purpose

Allow the original author to review PRs, adjust final grade, request changes, reject, accept, and merge.

### Layout

Split view.

### Left Panel: PR List

Width around 300px.

Include filters:

- 새 PR
- Public PR
- Private PR
- 충돌 위험 PR
- 인기 PR
- 변경 요청 중
- Merge 대기

Sort options:

- 최신순
- 등급 높은순
- 충돌 위험순

Each PR card should show:

- Grade badge
- Title
- Author
- Time
- Public / Private icon
- AI conflict risk

### Right Panel: PR Detail

When a PR is selected, show:

#### 1. Header

- PR title
- Grade badge
- Public / Private
- Author avatar
- Author username
- Author mini stats
- Written time
- Submitted time
- First viewed time

#### 2. View Log Notice

Before reading a private or unviewed PR, show:

- `이 PR을 열람하면 영구 로그가 기록됩니다.`
- `열람 후 유사 설정 사용 시 컨트리뷰터가 도용 증거로 사용할 수 있습니다.`
- Buttons:
  - `열람합니다`
  - `닫기`

Clicking `열람합니다` updates the mock view log.

#### 3. AI Summary

- 5-axis score graph
- AI rationale
- Conflict check result

#### 4. Structured PR

- AI structured content
- Original text toggle

#### 5. Contributor Opinion

Show if it exists.

#### 6. Final Grade Adjustment

Show:

- AI grade
- Final grade dropdown
  - 상
  - 중
  - 하

If final grade differs from AI grade:

- Show required textarea for author grading note
- Note is permanently recorded

#### 7. Actions

Buttons:

- Accept
- Request Changes
- Hold
- Reject

Reject requires:

- Category
  - 유사 설정 이미 존재
  - 방향 다름
  - 품질 미달
  - 금지 설정 위반
  - 기타
- Required reason text

#### 8. Merge Section

After Accept:

- Show `AI가 공식 문서 반영 초안을 생성했습니다`
- Show editable preview
- Button: `Merge 확정`

Clicking `Merge 확정`:

- Updates PR status to `MERGED`
- Updates mock merge history
- Shows success toast

Use Zustand or local mock state.

---

## 6.7 UserProfilePage `/u/:username`

### Purpose

Show a profile that works like a creative resume.

### Layout

Max width 1100px.

### 1. Profile Header

Show:

- Large avatar
- Username
- Display name if available
- Bio
- Role badges:
  - 원작자
  - 컨트리뷰터
- External links
- Share profile button
- Cite profile button

### 2. Core Stats

Four large stat cards:

- Major Merge
- Normal Merge
- Minor Merge
- Repository

### 3. Tabs

Tabs:

- Contribution
- Repository
- Activity
- Achievements

### 4. Contribution Tab

Show repositories the user contributed to.

Each contribution card:

- Repository thumbnail
- Repository title
- PR count by grade
- Role in that world:
  - 캐릭터 설정
  - 세계관 보완
  - 에피소드 제안
- Major Merge preview

Expanded PR detail:

- Major Merge highlighted card
- Title
- Repository name
- Merge date
- Official adoption note
- Link to original PR

Normal and Minor merges can be shown as a compact list.

Private PRs should only show as:

`비공개 기여 N건`

### 5. Repository Tab

Show repositories owned by the user using `RepoCard`.

### 6. Activity Tab

Show:

- GitHub grass-style activity graph
- Recent PRs
- Recent merges
- Recent comments

### 7. Achievements Tab

Badge collection:

- First Major Merge
- 10 Merges
- Monthly Top Contributor
- Helped New Author

Clicking a badge can show condition and date.

---

## 6.8 NewRepositoryPage `/r/new`

### Purpose

Allow original authors to register a new worldbuilding repository.

### Layout

Wizard form, max width 800px.

Use `RepositoryWizard` and step components.

Store wizard state in localStorage.

### Step 1. Basic Info

Fields:

- Title
- Thumbnail URL input
- One-line intro
- Description textarea
- Genre multi-select
- Tag chip input

### Step 2. External Links

Repeatable fields:

- Link type
- URL

Supported examples:

- Naver Webtoon
- KakaoPage
- Instagram
- Notion
- Website

### Step 3. README

Fields:

- World overview textarea
- Main characters repeatable list:
  - Name
  - Role
  - Description
- Main locations repeatable list:
  - Name
  - Description
- Core rules textarea, separated by line breaks
- Forbidden settings textarea, separated by line breaks

Forbidden settings guide:

`여기 적은 내용은 AI 충돌 검사의 기준이 됩니다.`

### Step 4. Recruiting Areas

Repeatable area form:

- Area type:
  - Character
  - Location / faction
  - Episode
  - Extra
  - Storyboard
  - World rule
- Status:
  - Actively recruiting
  - Reviewing
  - Closed
- Difficulty:
  - High
  - Medium
  - Low
- Description

### Step 5. Guidelines & License

Fields:

- Contribution guidelines textarea
- Required license checkboxes:
  - Merge된 기여물의 IP는 나에게 귀속됨에 동의
  - 컨트리뷰터에게 영구 크레딧 표기 의무에 동의
  - 외부 사업화 시 컨트리뷰터 크레딧 표기 의무에 동의
  - Reject 사유는 영구 기록됨에 동의
  - 모든 PR 열람 시 자동으로 로그가 남음을 이해

### Step 6. Preview & Publish

Render the entered data like a README page.

Buttons:

- Edit
- Publish

On publish:

- Create mock repository
- Navigate to `/r/:repoId`
- Show success toast

---

## 7. Shared Components

## 7.1 Header

Features:

- Sticky top
- Logo navigates to `/`
- Search input
- Login button
- Register repository button
- Mobile menu button

Search behavior:

- Enter navigates to `/search?q=<query>`.

## 7.2 RepoCard

Default:

- Thumbnail
- Title only

Hover overlay:

- Author
- Activity badge
- PR count
- Merge count
- Merge rate
- Average review days
- Recruiting areas

Click:

- Open `RepoDetailModal`

## 7.3 RepoDetailModal

Show:

- Thumbnail
- Title
- Author
- Badges
- Description
- Stats
- Current recruiting areas
- Recent merged contributions
- Detail button
- Bookmark button

Detail button navigates to `/r/:repoId`.

## 7.4 GradeBadge

Map grades:

- `MAJOR` -> `상`
- `NORMAL` -> `중`
- `MINOR` -> `하`

Colors:

- MAJOR: gold / amber
- NORMAL: green
- MINOR: gray

## 7.5 ContributorBadge

Show contributor activity status and achievement style labels.

## 7.6 TimestampGuard

Show a compact notice:

- 작성 시점 자동 기록
- 제출 시점 기록
- 원작자 열람 시점 기록
- 도용 발생 시 증거로 사용 가능

## 7.7 LicenseNotice

Show:

- IP belongs to original author after Merge
- Contributor receives permanent credit
- External commercialization requires credit attribution

## 7.8 AiScoreBars

Show 5 horizontal score bars:

- Scope
- Permanence
- Cascade
- Alignment
- Specificity

Each score is 0 to 10.

## 7.9 ConflictCheckCard

Show conflict risk and checklist items.

## 7.10 AgreementChecklist

Reusable checklist that can disable submit until every item is checked.

---

## 8. State Management

Use Zustand.

### 8.1 repository.store.ts

Manage:

- selectedRepository
- bookmarkedRepositoryIds
- watchedRepositoryIds
- filters
- sortOption

### 8.2 pullRequest.store.ts

Manage:

- draftContent
- selectedPullRequest
- temporaryDrafts
- reviewVisibility
- contributorOpinion
- agreementChecked
- mock PR updates

### 8.3 user.store.ts

Manage:

- current mock user
- login state placeholder

---

## 9. Mock Services

Do not call real backend APIs.

Create service functions that return Promises with artificial delay of 300ms to 800ms.

Examples:

```ts
getRepositories()
getRepositoryById(id)
searchRepositories(params)
getPullRequestsByRepositoryId(repoId)
getPullRequestById(prId)
createDraftPullRequest(data)
submitPullRequest(prId)
updatePullRequestFinalGrade(prId, grade, note)
getUserByUsername(username)
```

Every async page should have loading, error, and empty states.

---

## 10. Mock Data

Create consistent mock data across all pages.

### Minimum mock data required

- 8 repositories
- 6 users
- 4 featured contributors
- 12 pull requests
- Several merge history entries
- Several activities for profile page
- Achievement examples

Mock repositories should include different genres and statuses:

- Traditional folktale fantasy
- SF
- Modern supernatural
- Martial arts
- Regional culture fantasy
- School mystery
- Historical fantasy
- Cozy village story

Use realistic Korean titles and descriptions.

---

## 11. Loading / Error / Empty States

Each major page should support:

- Loading skeleton
- Empty state
- Error state with retry button
- Success toast after actions

AI analysis should include visible mock progress:

- `내용 분석 중...`
- `기여 유형 판정 중...`
- `등급 계산 중...`
- `충돌 검사 중...`

---

## 12. Accessibility

Implement basic accessibility:

- Semantic HTML
- `aria-label` for icon buttons
- Labels connected to inputs
- Keyboard focus states
- Modal closes with ESC
- Modal closes on overlay click
- Buttons must be real `<button>` elements
- Links must be real `<a>` or React Router `Link`

---

## 13. Performance

Implement or prepare for:

- Lazy loading images
- Separated grid component for future virtualization
- `useIntersectionObserver` hook for future infinite scroll
- Avoid huge page-level components
- Avoid repeated inline logic when reusable components make sense

---

## 14. Implementation Priority

Implement in this order:

1. Vite + React + TypeScript setup
2. Tailwind CSS setup
3. Router setup
4. Providers setup
5. Type definitions
6. Mock data
7. Mock services
8. Zustand stores
9. Layouts
10. Common components
11. Repository components
12. Pull request components
13. Contributor components
14. HomePage
15. SearchPage
16. RepositoryDetailPage
17. NewPullRequestPage
18. PullRequestReviewPage
19. AuthorDashboardPage
20. UserProfilePage
21. NewRepositoryPage
22. Responsive polish
23. Dark mode polish
24. Accessibility pass
25. Run checks

---

## 15. Completion Criteria

The project is complete when:

- `npm install` works
- `npm run dev` works
- All routes render without crashing
- All pages use mock data
- Header search navigates to search page
- Home repository cards open detail modal
- Search filters work with mock data
- Search sorting works
- Repository detail tabs switch correctly
- Contribute button navigates to PR creation page
- PR writing page saves draft to localStorage
- AI analysis button navigates to review page
- Review page shows AI grade and agreement checklist
- Submit button is disabled until all agreements are checked
- Author dashboard PR selection works
- Final grade dropdown works
- Grade change reason appears when final grade differs from AI grade
- Accept / Reject / Hold / Request Changes UI works with mock state
- User profile tabs work
- New repository wizard stores data in localStorage
- Preview step renders repository data
- Responsive grid works
- Dark-mode-first style is applied

---

## 16. Code Style Rules

- Use TypeScript types for props.
- Keep components small and readable.
- Split large components.
- Do not mix mock data directly into pages if a service layer can be used.
- Use service functions for data access.
- Use constants for repeated labels and options.
- Use reusable UI components.
- Prefer composition over deeply nested conditional JSX.
- Use meaningful file names.
- Avoid unused dependencies.
- Avoid overengineering.
- The project should feel like a maintainable frontend MVP.

---

## 17. Suggested First Codex Command

After placing this file in the project root, run Codex and say:

```txt
Read AGENTS.md if it exists, then read IMPLEMENTATION_PLAN.md. Implement this React Vite TypeScript frontend project step by step. Start with project structure, routing, mock data, services, stores, layouts, and shared components. Then implement the pages in the priority order written in the plan. Do not put everything in one huge file. Run checks after implementation.
```

If there is no `AGENTS.md`, use:

```txt
Read IMPLEMENTATION_PLAN.md and implement this React Vite TypeScript frontend project step by step. Start with project structure, routing, mock data, services, stores, layouts, and shared components. Then implement the pages in the priority order written in the plan. Do not put everything in one huge file. Run checks after implementation.
```

---

## 18. Follow-up Codex Commands

If the first implementation is too shallow, use these follow-up prompts.

### Follow-up 1: Main pages polish

```txt
Improve HomePage, SearchPage, and RepositoryDetailPage to a more complete service-level UI. Focus on RepoCard hover overlay, RepoDetailModal, tabs, filters, mock loading states, responsive grid, and dark-mode polish.
```

### Follow-up 2: PR flow polish

```txt
Improve NewPullRequestPage and PullRequestReviewPage. Make localStorage draft saving reliable, add debounce auto-save, improve AI analysis mock progress, make the agreement checklist control the submit button, and improve the visibility selector and timestamp guard UI.
```

### Follow-up 3: Dashboard and profile polish

```txt
Improve AuthorDashboardPage and UserProfilePage. Make the dashboard split view feel complete, make PR selection and grade changes work with mock state, add reject reason UI, improve the profile tabs, contribution cards, activity graph, and achievement badges.
```

### Follow-up 4: Repository wizard polish

```txt
Improve NewRepositoryPage and RepositoryWizard. Make every step save to localStorage, support repeatable characters, locations, links, and recruiting areas, and make the preview render like the final README tab.
```
