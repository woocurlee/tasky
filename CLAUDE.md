@AGENTS.md

# Tasky — 개인용 할일 관리 앱

혼자 사용하는 할일 관리 웹 앱. 로컬에서 개발/실행 후 **DuckDNS**로 외부 접근까지 목표.
모바일 브라우저로 접속하는 경우가 많을 예정이라 **모바일 동작이 최우선**.

## 기술 스택
- **Next.js 16 (App Router) + React 19 + TypeScript**
- **Tailwind CSS** (mobile-first 유틸리티)
- **Prisma ORM + SQLite** (2단계에서 도입, 파일 기반 `todo.db`)
  - 추후 PostgreSQL 전환 가능성을 고려해 Prisma 스키마 기반으로 설계
- 상태관리: React 내장 상태(useState/Context)로 충분
- ⚠️ Next.js 16은 학습 데이터와 다른 breaking change가 있음 → 코드 작성 전
  `node_modules/next/dist/docs/`의 관련 가이드를 먼저 확인할 것 (AGENTS.md 참고)

## 개발 단계
- **1단계 (완료)**: 프론트엔드 UI. (당시 mock + localStorage)
- **2단계 (완료)**: Prisma 7 + SQLite로 영속화.
  - DB 파일: 프로젝트 루트 `dev.db` (CLI가 cwd 기준 `file:./dev.db`로 생성).
  - Prisma 7은 **드라이버 어댑터 필수** → `@prisma/adapter-better-sqlite3` 사용.
    클라이언트는 `src/generated/prisma`로 생성(gitignore), 절대경로로 어댑터 연결(`src/lib/prisma.ts`).
  - 초기 데이터: `page.tsx`(async 서버 컴포넌트)에서 Prisma로 읽어 `DataProvider`에 props로 SSR 주입.
  - 변경: `src/lib/data/store.tsx`가 **낙관적 업데이트 + API 호출**. `useData()` 인터페이스는 1단계와 동일(패널 무수정).
  - API: `src/app/api/{categories,categories/[id],todos,todos/[id],todos/reorder}`.
  - 시드: `npm run db:seed` (`prisma/seed.ts`, idempotent). 스키마 변경 시 `npx prisma migrate dev`.
  - 클론 후: `npm install`(postinstall이 `prisma generate`) → `migrate`/`db:seed`.
  - ⚠️ **프라이버시 한계**: 비공개 카테고리도 초기 데이터에 포함돼 **RSC payload로 클라이언트에 전송**됨
    (화면엔 안 보이지만 페이지 소스/네트워크엔 존재). 어깨너머 차단엔 충분하나, devtools로 보는 것까진 못 막음.
    완전 차단하려면 로그인+서버측 필터링(보기 시 서버 재요청)이 필요 → 로그인 단계에서 고려.

## 디자인 원칙: Mobile-First (중요)
- **모바일 화면을 기본으로 먼저 설계**하고, 큰 화면은 Tailwind 반응형 접두사
  (`sm:`/`md:`/`lg:`)로 점진 확장한다.
- 모바일에서 레이아웃이 깨지지 않는 것이 최우선.
- 터치 친화: 탭 영역 충분히 크게(최소 44x44px 권장), 요소 간 간격 확보.
- 가로 스크롤 발생 금지(overflow 주의). 폰트/여백은 모바일에서 읽기 편하게.
- 입력 폼/모달도 모바일 화면을 벗어나지 않게.

## 화면 레이아웃 (핵심: 수학 4사분면 배치)
- **2사분면 (좌상)**: 캘린더 뷰
- **1사분면 (우상)**: Daily 할일
- **3·4사분면 (하단 전체 가로)**: 이번주 할일

반응형 동작:
- **모바일(기본)**: 4사분면을 가로 분할하지 않고 **세로 1열로 스택**.
  순서 [캘린더] → [Daily 할일] → [이번주 할일]. 각 영역은 카드로 구분, 세로 스크롤.
- **데스크탑(`lg:` 이상)**: 4사분면으로 전개.
  - 상단 행(1·2사분면)은 높게, 하단 행(3·4사분면)은 낮게(height 작게).
  - 예: 상단 65~70%, 하단 30~35% 비율 (보기 좋게 조절).
- 태블릿(`md:`)은 중간 형태로 자연스럽게 전환.

## 기능 요구사항

### 1. 간단한 로그인
- 사용자 관리 불필요(혼자 사용).
- 아이디/비밀번호를 환경변수(`.env`)로 하드코딩하고 입력값과 비교.
- 로그인 성공 시 세션 유지(쿠키 기반 세션 또는 localStorage 토큰).
- 미로그인 상태로 메인 접근 시 로그인 페이지로 리다이렉트
  (Next.js middleware 또는 라우트 가드).
- 로그인 화면도 mobile-first.

### 2. 캘린더 뷰 (2사분면)
- 일주일 뷰 / 한달 뷰 전환 토글.
- 오늘 날짜 강조, 이전/다음 이동 버튼.
- 날짜 클릭 시 Daily 할일 영역과 연동(선택 날짜 기준 표시).
- 모바일에서 한달 뷰 날짜 셀이 깨지지 않게.

### 3. Daily 할일 (1사분면)
- 선택된 날짜의 할일 관리.
- 카테고리 추가 → 각 카테고리 아래에 할일 추가.
- 할일: 추가 / 완료 체크 / 삭제.
- 카테고리: 추가 / 삭제 / 이름 수정.

### 4. 이번주 할일 (3·4사분면)
- 주 단위 할일 작성/관리.
- 추가 / 완료 체크 / 삭제.
- 현재 주(週) 표시(예: 6/23 ~ 6/29).

## 데이터 모델 (2단계 Prisma 기준, 1단계 TS 타입도 동일 구조로)
- **Category**: id, name, **private**(비공개 여부)
- **Todo**: id, title, done, date(daily용), weekStart(주간용), categoryId(nullable), **order**(정렬)
  - daily 할일 = date + category로 구분
  - 주간 할일 = weekStart로 구분

## 비공개(프라이버시) 모드
- 카테고리 단위로 `private` 표시(이름까지 통째로 숨김). 회사 등에서 민감한 항목(예: 이직 준비) 가림.
- 헤더 `PrivacyToggle`로 보기/숨기기. **보기 상태는 저장하지 않음** → 새로고침/접속 시 항상 숨김으로 시작(안전).
- 표시 상태는 `AppContext.revealPrivate`(세션 only), 비공개 플래그는 `Category.private`(저장됨).

## 외부 접근 (DuckDNS)
- 추후 로컬 Next.js 서버를 DuckDNS 도메인으로 외부 접근 가능하게 할 예정.
- 호스트/포트 등 환경 설정을 `.env`로 분리해 배포 시 조정 쉽게.

## 산출물 기준
- README에 실행 방법 포함: 의존성 설치, 개발 서버 실행, `.env.example`.
- mock 데이터로 모든 화면 동작.
- 컴포넌트/데이터 접근 레이어 분리, 폴더 구조 깔끔하게.
- 모바일/데스크탑 양쪽에서 레이아웃 안 깨지는지 확인.

## 나중에 할 작업 (Backlog)
> 핵심 기능을 모두 구현한 뒤 진행할 항목. 잊지 말 것.

- [~] **인터랙션 강화** (진행 중, 2026-06-29 착수)
      - [x] 액센트 테마 시스템: CSS 변수(`--accent`) + `[data-accent]`로 7색 테마,
            헤더 `ThemeSwitcher`로 전환, localStorage 저장, FOUC 방지 인라인 스크립트.
            색 클래스는 `bg-accent`/`text-accent`/`text-accent-foreground`/`accent-[var(--accent)]`.
      - [x] 은은·빠릿 모션: 버튼 `active:scale`, 색 전환, 리스트 `animate-fade-in`,
            `prefers-reduced-motion` 존중.
      - [x] 체크 팝: 커스텀 체크박스(`check-pop` 키프레임, 체크 시 통통 튀는 체크마크).
      - [x] 삭제 exit 애니메이션: `leaving` 상태 → `fade-out` 후 `onAnimationEnd`에서 실제 제거.
      - [x] 날짜·뷰 전환 트랜지션: 캘린더 그리드(기간 key)·Daily(날짜 key)·주간(주 key)
            remount 시 `fade-in`.
      - [x] 드래그로 순서 변경: `@dnd-kit` 도입, Todo에 `order` 필드 추가(Prisma도 반영 필요),
            `SortableList` 래퍼 + `TodoItem` 드래그 핸들. 리스트별(날짜+카테고리/주) 정렬,
            `reorderTodos`로 order 재배정. 터치 대응(PointerSensor distance 6).
      - [x] hover 커서: 전역 base 규칙으로 button/role=button에 `cursor: pointer`,
            드래그 핸들은 `cursor-grab`.
      - 인터랙션 강화 작업 일단락 (필요 시 추가 다듬기).
- [x] **로그인** — 완료. 환경변수(`AUTH_USERNAME`/`AUTH_PASSWORD`/`AUTH_SECRET`),
      `/login` + 서버 액션(`src/app/login/actions.ts`)으로 httpOnly 쿠키 세션,
      `src/middleware.ts`로 전 경로(+API) 보호. 헤더에 로그아웃. `.env.example` 추가.
      쿠키 `secure:false`(http 배포 고려) — HTTPS 적용 시 true로 바꿀 것.
      ※ 비공개 카테고리 완전 차단(서버측 필터링)은 아직 미적용 — 추후 과제로 남김.
- [x] **DB (2단계)** — Prisma 7 + SQLite 완료 (위 '개발 단계' 참고).
