# WorldBuild Implementation Phases

이 문서는 `IMPLEMENTATION_PLAN.md`를 실제 작업 단위로 나눈 실행 계획이다.

앞으로 작업을 요청할 때는 예를 들어 `1-2페이즈 진행해줘`, `3-4페이즈 구현해줘`처럼 2개 페이즈씩 진행하면 된다.

## Plan Summary

WorldBuild는 창작 업계 지망생을 위한 GitHub 스타일 공동창작 플랫폼이다.

사용자는 홈에서 세계관을 발견하고, 검색으로 필터링하며, 레포지토리 상세에서 README와 PR, 기여자, 머지 히스토리를 확인한다. 컨트리뷰터는 자유롭게 PR을 작성하고 AI 분석 결과를 확인한 뒤 제출한다. 원작자는 대시보드에서 PR을 검토하고, 등급 조정, 변경 요청, 거절, 수락, 머지를 처리한다. 머지된 기여는 컨트리뷰터 프로필에 창작 이력으로 남는다.

구현은 React, Vite, TypeScript, React Router DOM, Tailwind CSS, Zustand, TanStack Query, lucide-react를 사용하며 실제 API 없이 mock data와 mock service로 전체 흐름을 연결한다. 구조는 feature-based로 나누고, pages, components, mocks, services, stores, hooks, types를 분리한다.

## Phase 1: Project Bootstrap

Goal: Vite + React + TypeScript + Tailwind 기반 실행 가능한 프로젝트 뼈대를 만든다.

Files to create or modify:

- `package.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `postcss.config.js`
- `tailwind.config.js`
- `src/main.tsx`
- `src/styles/globals.css`
- 기본 `src` 폴더 구조

Expected result:

- `npm install`과 `npm run dev`가 가능한 최소 앱이 준비된다.
- Tailwind CSS와 다크모드 우선 글로벌 스타일이 적용된다.
- 계획서의 feature-based 폴더 구조가 만들어진다.

Checks to run:

- `npm install`
- `npm run dev`
- `npm run build`

## Phase 2: App Shell And Routing

Goal: 전체 라우트 구조와 공통 레이아웃을 세워 모든 URL이 기본 렌더링되게 한다.

Files to create or modify:

- `src/app/App.tsx`
- `src/app/router.tsx`
- `src/app/providers.tsx`
- `src/layouts/RootLayout.tsx`
- `src/layouts/DashboardLayout.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/SearchPage.tsx`
- `src/pages/RepositoryDetailPage.tsx`
- `src/pages/NewPullRequestPage.tsx`
- `src/pages/PullRequestReviewPage.tsx`
- `src/pages/AuthorDashboardPage.tsx`
- `src/pages/UserProfilePage.tsx`
- `src/pages/NewRepositoryPage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/components/common/Header.tsx`
- `src/components/common/Footer.tsx`

Expected result:

- `/`, `/search`, `/r/new`, `/r/:repoId`, `/r/:repoId/pr/new`, `/r/:repoId/pr/:prId/review`, `/r/:repoId/dashboard`, `/u/:username`, `*` 라우트가 크래시 없이 열린다.
- Header, main, Footer가 포함된 기본 레이아웃이 동작한다.
- Header 검색 입력은 Enter 시 `/search?q=<query>`로 이동할 준비가 된다.

Checks to run:

- `npm run dev`
- 주요 라우트 수동 확인
- `npm run build`

## Phase 3: Domain Types, Constants, And Mock Data

Goal: 레포지토리, PR, 유저 도메인 타입과 일관된 한국어 mock data를 만든다.

Files to create or modify:

- `src/features/repository/repository.types.ts`
- `src/features/pull-request/pullRequest.types.ts`
- `src/features/user/user.types.ts`
- `src/mocks/users.mock.ts`
- `src/mocks/repositories.mock.ts`
- `src/mocks/pullRequests.mock.ts`
- `src/mocks/activities.mock.ts`
- `src/lib/constants.ts`
- `src/lib/date.ts`
- `src/lib/format.ts`
- `src/lib/cn.ts`

Expected result:

- 최소 8개 레포지토리, 6명 유저, 4명 featured contributor, 12개 PR, merge history, profile activity, achievement 예시가 준비된다.
- mock data끼리 repositoryId, authorId, username 등이 자연스럽게 연결된다.
- 장르와 상태가 검색 필터 요구사항을 만족한다.

Checks to run:

- `npm run build`
- `npm run typecheck`가 있다면 실행

## Phase 4: Services, Stores, Hooks, And Common UI

Goal: mock service, Zustand store, reusable hook, 공통 UI 컴포넌트를 만든다.

Files to create or modify:

- `src/features/repository/repository.service.ts`
- `src/features/repository/repository.store.ts`
- `src/features/pull-request/pullRequest.service.ts`
- `src/features/pull-request/pullRequest.store.ts`
- `src/features/user/user.service.ts`
- `src/features/user/user.store.ts`
- `src/hooks/useDebounce.ts`
- `src/hooks/useLocalStorage.ts`
- `src/hooks/useModal.ts`
- `src/hooks/useToast.ts`
- `src/hooks/useIntersectionObserver.ts`
- `src/components/common/Button.tsx`
- `src/components/common/Input.tsx`
- `src/components/common/Textarea.tsx`
- `src/components/common/Modal.tsx`
- `src/components/common/Tabs.tsx`
- `src/components/common/Badge.tsx`
- `src/components/common/Card.tsx`
- `src/components/common/Skeleton.tsx`
- `src/components/common/Toast.tsx`
- `src/components/common/EmptyState.tsx`

Expected result:

- 데이터 접근은 mock service 계층을 통해 이루어진다.
- service 함수는 300ms-800ms artificial delay를 가진 Promise를 반환한다.
- repository, pull request, user 관련 전역 상태가 Zustand로 관리된다.
- loading, error, empty, toast, modal을 재사용할 수 있다.

Checks to run:

- `npm run build`
- 공통 컴포넌트 기본 렌더 수동 확인

## Phase 5: Home And Search Experience

Goal: 사용자가 세계관을 발견하고, 검색하고, 카드와 모달로 살펴보는 흐름을 완성한다.

Files to create or modify:

- `src/pages/HomePage.tsx`
- `src/pages/SearchPage.tsx`
- `src/components/repository/RepoCard.tsx`
- `src/components/repository/RepoGrid.tsx`
- `src/components/repository/RepoDetailModal.tsx`
- `src/components/contributor/ContributorCard.tsx`
- `src/components/contributor/ContributorBadge.tsx`

Expected result:

- 홈에서 hero, 추천 태그, 기여자 모집 레포, featured contributors, first-time user entry가 보인다.
- RepoCard hover overlay에 author, badge, PR count, merge count, merge rate, average review days, recruiting areas가 표시된다.
- RepoCard 클릭 시 RepoDetailModal이 열린다.
- SearchPage에서 genre, recruiting area, author activity, merge rate, work scale 필터와 sort가 mock data에 대해 동작한다.
- 결과가 없을 때 EmptyState가 표시된다.

Checks to run:

- `npm run dev`
- 홈 검색 Enter 이동 확인
- 추천 태그 클릭 이동 확인
- RepoCard hover와 modal 확인
- 검색 필터, 정렬, 초기화 확인
- `npm run build`

## Phase 6: Repository Detail Page

Goal: README, PR 목록, 기여자, 머지 히스토리, 인사이트 탭이 있는 상세 페이지를 구현한다.

Files to create or modify:

- `src/pages/RepositoryDetailPage.tsx`
- `src/components/repository/RepoStatsBar.tsx`
- `src/components/repository/RecruitingAreaCard.tsx`
- `src/components/repository/RepositoryReadme.tsx`
- `src/components/repository/RepositoryTabs.tsx`
- `src/components/pull-request/PullRequestListItem.tsx`
- `src/components/pull-request/GradeBadge.tsx`

Expected result:

- 레포지토리 헤더, 통계 바, README, PR 목록, 기여자, merge history, insights placeholder가 렌더링된다.
- README의 forbidden settings는 경고 스타일로 표시된다.
- `Contribute 기여하기` 버튼은 `/r/:repoId/pr/new`로 이동한다.
- PR 탭에서 상태 필터와 정렬 UI가 동작한다.

Checks to run:

- `/r/:repoId` 수동 확인
- 탭 전환 확인
- Contribute 버튼 이동 확인
- 존재하지 않는 repository ID 처리 확인
- `npm run build`

## Phase 7: Pull Request Writing And AI Review Flow

Goal: 자유 작성, 자동 저장, AI 분석 결과 확인, 동의 체크 후 제출까지 연결한다.

Files to create or modify:

- `src/pages/NewPullRequestPage.tsx`
- `src/pages/PullRequestReviewPage.tsx`
- `src/components/pull-request/AiScoreBars.tsx`
- `src/components/pull-request/ConflictCheckCard.tsx`
- `src/components/pull-request/TimestampGuard.tsx`
- `src/components/pull-request/LicenseNotice.tsx`
- `src/components/pull-request/VisibilitySelector.tsx`
- `src/components/pull-request/AgreementChecklist.tsx`
- `src/components/pull-request/PullRequestCard.tsx`

Expected result:

- PR 작성 페이지에서 자유 텍스트 입력, 글자 수, 첨부 placeholder, timestamp notice가 보인다.
- 초안은 localStorage에 저장되고 새로고침 후 복원된다.
- `AI 분석 받기` 클릭 시 mock PR이 생성되고 `/r/:repoId/pr/:prId/review`로 이동한다.
- 리뷰 페이지에서 AI summary, structured PR, grade, score bars, conflict check, visibility selector, contributor opinion, agreement checklist가 보인다.
- 모든 agreement가 체크되기 전까지 Submit 버튼이 비활성화된다.

Checks to run:

- 작성 중 localStorage 저장 확인
- 새로고침 후 초안 복원 확인
- AI 분석 버튼 이동 확인
- agreement 체크 전후 버튼 상태 확인
- submit modal과 success toast 확인
- `npm run build`

## Phase 8: Author Dashboard And User Profile

Goal: 원작자 검토 화면과 창작 이력 프로필을 구현한다.

Files to create or modify:

- `src/pages/AuthorDashboardPage.tsx`
- `src/pages/UserProfilePage.tsx`
- `src/components/contributor/ContributionSummaryCard.tsx`
- `src/components/contributor/ActivityGraph.tsx`
- `src/components/contributor/AchievementBadge.tsx`
- 필요 시 pull request store/service 보강
- 필요 시 user store/service 보강

Expected result:

- AuthorDashboardPage에서 PR 목록, 필터, 정렬, 선택된 PR detail split view가 동작한다.
- private 또는 unviewed PR 열람 시 view log notice가 표시되고, 확인 후 mock view log가 업데이트된다.
- 최종 등급을 AI 등급과 다르게 바꾸면 author grading note가 필수로 나타난다.
- Accept, Request Changes, Hold, Reject UI가 mock state로 동작한다.
- Accept 후 merge section이 나타나고 `Merge 확정` 시 PR 상태가 `MERGED`가 된다.
- UserProfilePage에서 profile header, stats, contribution, repository, activity, achievements 탭이 동작한다.

Checks to run:

- PR 선택과 필터/정렬 확인
- view log 업데이트 확인
- 등급 변경 사유 UI 확인
- reject reason 필수 UI 확인
- merge 후 상태 변경 확인
- profile tab 전환 확인
- `npm run build`

## Phase 9: New Repository Wizard

Goal: 원작자가 단계형 폼으로 새 세계관 레포지토리를 등록하고 미리보기 후 발행할 수 있게 한다.

Files to create or modify:

- `src/pages/NewRepositoryPage.tsx`
- `src/components/forms/RepositoryWizard.tsx`
- `src/components/forms/StepBasicInfo.tsx`
- `src/components/forms/StepExternalLinks.tsx`
- `src/components/forms/StepReadme.tsx`
- `src/components/forms/StepRecruitingAreas.tsx`
- `src/components/forms/StepLicense.tsx`
- `src/components/forms/StepPreview.tsx`
- 필요 시 repository store/service 보강

Expected result:

- Basic info, external links, README, recruiting areas, guidelines/license, preview/publish 단계가 구현된다.
- wizard state는 localStorage에 저장되고 복원된다.
- characters, locations, external links, recruiting areas는 반복 입력을 지원한다.
- preview step은 최종 README처럼 렌더링된다.
- Publish 시 mock repository가 생성되고 `/r/:repoId`로 이동한다.

Checks to run:

- 단계 이동 확인
- localStorage 복원 확인
- 반복 입력 추가/삭제 확인
- license checkbox 필수 처리 확인
- publish 후 상세 페이지 이동 확인
- `npm run build`

## Phase 10: Responsive, Dark Mode, Accessibility, And Final QA

Goal: 전체 화면을 모바일까지 다듬고, 접근성, 로딩, 에러, 빈 상태를 보완한 뒤 최종 검증한다.

Files to create or modify:

- `src/styles/globals.css`
- 각 page와 component 스타일 조정
- loading, error, empty state 보강 대상 파일 전반

Expected result:

- repository grid는 1440px 이상 4열, 1024px 3열, 768px 2열, 480px 이하 1열로 동작한다.
- 다크모드 우선 톤이 전체 UI에 일관되게 적용된다.
- 주요 async page는 loading, error, empty state를 가진다.
- modal은 ESC와 overlay click으로 닫힌다.
- icon button에는 `aria-label`이 있다.
- button은 실제 `button`, navigation은 실제 `Link` 또는 `a`를 사용한다.
- 모바일과 데스크톱에서 텍스트 겹침 없이 렌더링된다.

Checks to run:

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- 주요 라우트 수동 smoke test
- desktop/mobile viewport 수동 확인

## Recommended Work Rhythm

기본 진행 단위는 2개 페이즈씩이 적당하다.

- 1차 작업: Phase 1-2
- 2차 작업: Phase 3-4
- 3차 작업: Phase 5-6
- 4차 작업: Phase 7-8
- 5차 작업: Phase 9-10

각 작업 후에는 가능한 범위에서 build/type/lint 확인을 실행하고, 다음 페이즈로 넘어가기 전에 깨진 라우트나 타입 오류를 먼저 정리한다.
