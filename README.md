<div align="center">

# 서랍 Frontend

좋아하는 웹툰 세계관에 캐릭터, 에피소드, 설정을 제안하고  
작가가 검토한 기여를 공식 세계관에 반영하는 협업형 월드빌딩 플랫폼입니다.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=111827)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## 서비스 개요

서랍은 웹툰 세계관을 GitHub repository처럼 관리하는 창작 협업 서비스입니다.

작가는 작품의 세계관 repository를 만들고, 독자와 공동 창작자는 pull request처럼 새로운 설정을 제안합니다.  
제안은 AI 분석을 거쳐 범위, 영구성, 충돌 위험, 기여 등급으로 정리되고, 작가는 이를 검토해 채택, 수정 요청, 반려, 공식 반영을 결정합니다.

## 핵심 기능

- 세계관 repository 탐색 및 검색
- 웹툰 세계관 상세 모달과 공식 README 확인
- 캐릭터, 에피소드, 지역, 세계 규칙 등 모집 영역 기반 기여
- 창작 제안 작성 및 AI 리뷰 플로우
- 작가용 대시보드에서 제안 검토, 채택, 반려, 공식 반영
- 프로필에서 내가 만든 세계관과 공식 반영된 기여 확인
- 백엔드 API 연동 및 개발용 mock fallback

## 화면 흐름

```txt
홈
 ├─ 추천 세계관 카드
 ├─ 검색 / 태그 탐색
 └─ 기여자 랭킹

세계관
 ├─ repository 상세
 ├─ README / 모집 영역 / 통계
 └─ 창작 제안 작성

PR
 ├─ AI 분석
 ├─ 기여자 의견
 └─ 제출

작가 대시보드
 ├─ 제안 큐
 ├─ 충돌 위험 / AI 점수
 └─ Accept / Request Changes / Reject / Merge
```

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Framework | React, Vite |
| Language | TypeScript |
| Routing | React Router DOM |
| Styling | Tailwind CSS |
| State | Zustand |
| Server State | TanStack Query |
| Icons | lucide-react |
| API | Fetch 기반 custom API client |

## 프로젝트 구조

```txt
src/
  app/                 # 라우터와 앱 프로바이더
  assets/              # 정적 이미지
  components/          # 공통 UI와 도메인 컴포넌트
  features/            # repository, PR, user, auth 도메인 로직
  hooks/               # 공통 훅
  layouts/             # 페이지 레이아웃
  lib/                 # API client, mapper, path, formatter
  mocks/               # 개발용 mock 데이터
  pages/               # 라우트 페이지
```

## 시작하기

```bash
npm install
npm run dev
```

기본 개발 서버는 Vite 설정에 따라 `http://localhost:5173`에서 실행됩니다.

## 환경 변수

`.env.example`을 참고해 `.env`를 생성합니다.

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_ENABLED=true
VITE_ACCESS_TOKEN_KEY=worldbuild:access-token
```

`VITE_API_ENABLED=true`이면 백엔드 API를 우선 사용합니다.  
읽기 API는 실패 시 mock 데이터로 fallback하고, 생성/수정/제출 같은 쓰기 API는 API 활성화 상태에서 mock fallback을 하지 않도록 구성되어 있습니다.

## 스크립트

```bash
npm run dev        # 개발 서버 실행
npm run build      # 타입체크 후 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run typecheck  # TypeScript 타입 검사
```

## 주요 라우트

| Route | 설명 |
| --- | --- |
| `/` | 홈, 추천 세계관, 검색 진입 |
| `/search` | 세계관 검색과 필터 |
| `/r/new` | 새 세계관 생성 |
| `/r/:repoId` | 세계관 상세 |
| `/r/:repoId/pr/new` | 창작 제안 작성 |
| `/r/:repoId/dashboard` | 작가 제안 검토 대시보드 |
| `/u/:username` | 유저 프로필 |

## 개발 메모

- API path는 `src/lib/apiPaths.ts`에서 관리합니다.
- 백엔드 응답은 `src/lib/apiMappers.ts`에서 프론트 타입으로 변환합니다.
- repository, pull request, user 기능은 `src/features` 단위로 분리되어 있습니다.
- mock 데이터는 백엔드가 불안정한 개발 상황에서도 주요 화면이 깨지지 않도록 보조 역할을 합니다.

---

<div align="center">

서랍은 창작자의 세계관을 지키면서도, 독자의 상상을 공식 기록으로 남기는 것을 목표로 합니다.

</div>
