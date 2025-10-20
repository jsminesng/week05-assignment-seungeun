Week 5 Assignment: AI Todo Breakdown App
🎯 프로젝트 개요

Supabase 기반 Todo 앱에 AI 기능을 추가하여, 사용자가 입력한 복잡한 작업을 자동으로 작은 단계로 분해해주는 기능을 구현했습니다.
Express 서버를 프록시로 사용해 API 키를 보호하고, Rate Limiting 및 에러 처리도 적용했습니다.

✨ 주요 기능
✅ 기본 Todo 기능 (Supabase)
회원가입 / 로그인
Todo 추가, 수정, 삭제 (CRUD)
사용자별 Todo 분리
전체 삭제, 진행 현황 통계

🤖 AI 기능 (Gemini 기반)
AI Todo Breakdown: 복잡한 작업을 자동으로 작은 단계로 분리
단계 선택 및 추가: 원하는 단계만 선택하여 Todo에 추가
Rate Limiting: 1분에 10회 요청 제한

🛠 기술 스택
Frontend: React(CDN), TailwindCSS, Supabase
Backend: Express.js, Google Gemini API, express-rate-limit, CORS

🚀 실행 방법
저장소 클론 & 의존성 설치
git clone https://github.com/[your-username]/week5-assignment.git
cd week5-assignment/backend
npm install


.env 파일 생성
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
PORT=3002


서버 실행
node server.js


프론트엔드 실행
# frontend/index.html 파일을 Live Server로 열기
# 또는
cd frontend
python -m http.server 8000

📱 사용 방법
로그인 후 Todo 입력
AI Todo Breakdown 섹션에서 큰 작업 입력 → "Break Down" 클릭
AI가 제안한 단계 중 원하는 것 선택 → Todo에 추가

📊 API 엔드포인트
GET / → 서버 상태 확인
POST /api/ai/generate → 일반 프롬프트 요청
POST /api/ai/breakdown → 할일 자동 분해

📁 프로젝트 구조
week5-assignment/
├── backend/      # Express 서버
├── frontend/     # 클라이언트 (HTML, JS)
└── README.md

🔒 보안
LLM API 키는 서버에서만 관리
Supabase RLS로 사용자별 데이터 보호
Rate Limiting으로 서버 부하 방지

🔮 향후 개선
AI 히스토리 저장
AI 응답 편집 기능
OpenAI / Hugging Face 추가 지원
모바일 UI 최적화
