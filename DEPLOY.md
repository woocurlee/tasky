# Tasky 배포 가이드 (맥미니)

집에 있는 맥미니에서 서버를 띄우고, DuckDNS로 외부에서 접근하는 절차.
**SQLite는 별도 DB 서버가 아니라 `dev.db` 파일** 하나라, Next.js 서버만 띄우면 DB도 같이 동작한다.

---

## 0. 사전 준비 (맥미니에 1회)

- **Node 20+ 설치** (LTS 권장). 확인: `node -v`
  - 없으면 [nodejs.org] 설치 또는 `brew install node`
- better-sqlite3가 네이티브 모듈이라 컴파일이 필요할 수 있음. 빌드 에러 나면:
  ```bash
  xcode-select --install
  ```

---

## 1. 코드 받기

처음:
```bash
git clone https://github.com/woocurlee/tasky.git
cd tasky
```

이후 업데이트(이어서 작업한 걸 반영):
```bash
cd tasky
git pull
```

---

## 2. `.env` 만들기 (레포에 없음 — 직접 생성)

`.env.example`을 복사해서 값을 채운다:
```bash
cp .env.example .env
```

`.env` 내용:
```env
DATABASE_URL="file:./dev.db"

AUTH_USERNAME="원하는아이디"
AUTH_PASSWORD="원하는비밀번호"
AUTH_SECRET="아래명령으로_생성한_긴_랜덤문자열"
```

`AUTH_SECRET` 생성:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ `.env`는 절대 깃에 올리지 말 것 (이미 `.gitignore` 처리됨).

---

## 3. 설치 · DB 준비 · 실행

```bash
npm install                 # postinstall이 prisma generate 자동 실행
npx prisma migrate deploy   # dev.db 생성 + 스키마 적용 (비대화형/운영용)
npm run db:seed             # (선택) 초기 예시 데이터 넣기
npm run build
npm run start               # http://localhost:3000  (Ctrl+C로 종료)
```

포트 바꾸려면:
```bash
PORT=3000 npm run start     # 원하는 포트로
```

---

## 4. 상시 실행 (터미널 닫아도 계속)

### 방법 A — pm2 (간단, 추천)
```bash
npm install -g pm2
pm2 start npm --name tasky -- start
pm2 save                    # 현재 프로세스 목록 저장
pm2 startup                 # 부팅 시 자동 시작 (출력되는 명령 한 줄 복붙 실행)
```
관리:
```bash
pm2 logs tasky     # 로그
pm2 restart tasky  # 재시작 (코드 업데이트 후)
pm2 stop tasky     # 중지
```

### 방법 B — launchd (macOS 기본)
`~/Library/LaunchAgents/com.tasky.app.plist` 생성:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.tasky.app</string>
  <key>WorkingDirectory</key><string>/Users/사용자명/tasky</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>npm run start</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/Users/사용자명/tasky/tasky.log</string>
  <key>StandardErrorPath</key><string>/Users/사용자명/tasky/tasky.err</string>
</dict>
</plist>
```
적용:
```bash
launchctl load ~/Library/LaunchAgents/com.tasky.app.plist
launchctl start com.tasky.app
```

---

## 5. DuckDNS 외부 접근

### 5-1. DuckDNS 도메인 + 토큰
1. https://www.duckdns.org 로그인 → 서브도메인 생성 (예: `mytasky` → `mytasky.duckdns.org`)
2. 페이지 상단의 **token** 복사

### 5-2. 공인 IP 자동 갱신 (집 IP가 바뀌어도 도메인이 따라오게)
crontab에 5분마다 갱신 등록:
```bash
crontab -e
```
아래 한 줄 추가 (값 교체):
```
*/5 * * * * curl -s "https://www.duckdns.org/update?domains=mytasky&token=토큰값&ip=" >/dev/null 2>&1
```

### 5-3. 공유기 포트 포워딩
공유기 관리 페이지에서 **외부 포트 → 맥미니 내부 IP:포트** 포워딩.
- 예: 외부 `80` → 맥미니 `192.168.x.x:3000`
- 맥미니 내부 IP 확인: `ipconfig getifaddr en0`
- 가능하면 맥미니를 **고정 IP**(DHCP 예약)로 설정해 두기

이제 `http://mytasky.duckdns.org` 로 외부 접근 가능.

### 5-4. (권장) HTTPS — Caddy 리버스 프록시
평문 http는 로그인 정보가 노출될 수 있으니 가능하면 HTTPS를 붙인다.
```bash
brew install caddy
```
`Caddyfile`:
```
mytasky.duckdns.org {
    reverse_proxy localhost:3000
}
```
실행: `caddy run` (또는 `brew services start caddy`).
Caddy가 Let's Encrypt 인증서를 자동 발급(80/443 포트 포워딩 필요).

> ✅ HTTPS를 붙였다면 `src/app/login/actions.ts`의 쿠키 옵션을 **`secure: true`** 로 바꾸고
> 다시 `npm run build && pm2 restart tasky`.

---

## 6. 코드 업데이트(재배포) 루틴

맥북에서 작업/푸시 후, 맥미니에서:
```bash
cd tasky
git pull
npm install
npx prisma migrate deploy   # 스키마 변경 있으면 적용 (없으면 그냥 통과)
npm run build
pm2 restart tasky           # launchd면: launchctl kickstart -k gui/$(id -u)/com.tasky.app
```

---

## 7. 데이터 백업 / 이전

데이터는 전부 `dev.db` 파일 하나에 들어있다.
```bash
cp dev.db dev.db.backup        # 백업
```
다른 기기 데이터를 가져오려면 그 기기의 `dev.db`를 복사해 덮어쓰면 된다.

---

## 8. 트러블슈팅

- **로그인해도 계속 /login으로 튕김** → `.env`의 `AUTH_SECRET`이 비었거나, http인데 쿠키 `secure:true`인지 확인.
- **DB 테이블 없음(P2021)** → `npx prisma migrate deploy` 안 했는지 확인. `dev.db`는 프로젝트 루트에 생성됨.
- **better-sqlite3 빌드 실패** → `xcode-select --install` 후 `npm install` 재시도.
- **외부에서 접속 안 됨** → 공유기 포트 포워딩 / 맥미니 방화벽 / 공인 IP(DuckDNS) 갱신 여부 확인.
