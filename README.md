Week 5 Assignment: AI Todo Breakdown App
🎯 프로젝트 개요

Supabase 기반 Todo 앱에 AI 기능을 결합하여, 복잡한 작업을 자동으로 작은 단계로 분해하는 기능을 구현했습니다.
Express 서버를 프록시로 두어 API 키를 보호하고, Rate Limiting 및 에러 처리도 적용했습니다.

✨ 주요 기능
✅ Todo 기본 기능

사용자 인증 (회원가입 / 로그인)

Todo 추가, 수정, 삭제 (CRUD)

사용자별 데이터 분리 (Supabase RLS)

전체 삭제 및 진행 현황 통계

🤖 AI 기능 (Gemini 기반)

큰 작업을 5개 이하의 작은 단계로 자동 분해

선택한 단계만 Todo에 추가 가능

요청 제한 (1분당 10회)으로 서버 보호

🛠 기술 스택

Frontend: React(CDN), TailwindCSS, Supabase

Backend: Express.js, Google Gemini API, express-rate-limit, CORS

🚀 실행 방법
1. 클론 & 설치
git clone https://github.com/[your-username]/week5-assignment.git
cd week5-assignment/backend
npm install

2. 환경 변수 설정

backend/.env 파일 생성:

PORT=3002
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key

3. 서버 실행
node server.js


서버 주소: http://localhost:3002

4. 프론트엔드 실행
cd frontend
python -m http.server 8000
# → http://localhost:8000 접속

📊 API 엔드포인트

GET / → 서버 상태 확인

POST /api/ai/generate → AI 응답 생성

POST /api/ai/breakdown → 할일 분해 전용

📁 프로젝트 구조
week5-assignment/
├── backend/      # Express API 서버
│   └── server.js
├── frontend/     # 클라이언트 (index.html 등)
└── README.md

🔒 보안

API 키는 서버에서만 관리 (프론트엔드에 직접 노출 ❌)

Supabase RLS로 사용자별 데이터 보호

Rate Limiting으로 과도한 요청 차단

🔮 향후 개선

AI 히스토리 저장

응답 편집 기능

Hugging Face / OpenAI 추가 지원

모바일 UI 최적화
