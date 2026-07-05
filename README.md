# Tasky

혼자 쓰는 개인용 **할일 관리 + 가계부** 웹 앱. 로컬(맥미니 등)에서 실행하고 **DuckDNS**로 외부 접근까지 목표로 합니다. 모바일 브라우저 사용이 잦아 **모바일 동작이 최우선(mobile-first)** 입니다.

## 주요 기능

- **할일(Tasky) 모드**
  - 캘린더(주/월 전환), 오늘 강조, 이전/다음 이동
  - Daily 할일: 카테고리별로 추가/완료/삭제, 드래그로 순서 변경
  - 이번주 할일: 주 단위 작성/관리
  - **비공개 카테고리**: 이름까지 통째로 숨김(회사에서 민감한 항목 가림). 새로고침 시 항상 숨김으로 시작
- **가계부(Ledger) 모드** — 헤더 토글로 전환
  - 날짜별 지출 입력(금액 숫자 전용 + 프리셋 카테고리 칩 선택)
  - 주간/월간 총 지출 + 카테고리별 집계
- 공통: 7색 액센트 테마 전환, 은은한 모션, 단일 사용자 로그인

## 기술 스택

- **Next.js 16 (App Router) + React 19 + TypeScript**
- **Tailwind CSS v4**
- **Prisma 7 + SQLite** (파일 기반 `dev.db`, 드라이버 어댑터 `@prisma/adapter-better-sqlite3`)
- 드래그 정렬: `@dnd-kit`

## 시작하기

### 1. 의존성 설치

```bash
npm install   # postinstall이 prisma generate 자동 실행
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env`를 열어 값을 채웁니다:

- `AUTH_USERNAME` / `AUTH_PASSWORD` — 로그인 계정
- `AUTH_SECRET` — 세션 쿠키 토큰. 아래로 랜덤 생성:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

> `.env`는 절대 커밋하지 않습니다(gitignore). 템플릿은 `.env.example`만 커밋.

### 3. DB 준비

```bash
npx prisma migrate deploy   # 스키마 적용 (개발 중 스키마 변경 시엔 migrate dev)
npm run db:seed             # 초기 예시 데이터 (idempotent)
```

### 4. 실행

```bash
npm run dev                 # 개발 서버 → http://localhost:3000
```

프로덕션:

```bash
npm run build
npm run start
```

## 프로젝트 구조

```
src/
  app/
    page.tsx              # 루트(서버 컴포넌트): Prisma로 초기 데이터 SSR 주입
    login/               # 로그인 페이지 + 서버 액션
    api/                 # categories, todos, transactions REST 엔드포인트
  proxy.ts               # 인증 라우트 가드 (Next 16, 구 middleware)
  components/            # Dashboard, 패널, 헤더 토글 등
    panels/             # CalendarPanel, DailyPanel, WeeklyPanel
    ledger/             # LedgerDailyPanel, LedgerSummaryPanel
  lib/
    data/store.tsx       # 할일 데이터 레이어(useData): 낙관적 업데이트 + API
    ledger/store.tsx     # 가계부 데이터 레이어(useLedger)
    prisma.ts, date.ts, money.ts, types.ts, context.tsx
prisma/
  schema.prisma, seed.ts
```

## 배포

맥미니 + DuckDNS 배포 절차는 [`DEPLOY.md`](./DEPLOY.md) 참고.

재배포 요약(스키마 변화 없을 때):

```bash
git pull
npm install
npm run build
pm2 restart tasky   # 또는 사용 중인 프로세스 매니저
```

## 참고

- 프로젝트 스펙/설계 메모: [`CLAUDE.md`](./CLAUDE.md)
- ⚠️ 비공개 카테고리는 화면엔 안 보이지만 초기 데이터(RSC payload)엔 포함됩니다. 어깨너머 차단엔 충분하나 devtools까진 못 막습니다(추후 서버측 필터링 과제).
