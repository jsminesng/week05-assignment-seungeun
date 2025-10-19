/**
 * Express AI Proxy Server for Week 5
 *
 * 이 서버의 역할:
 * 1. 프론트엔드와 LLM API 사이의 프록시 (API 키 보호)
 * 2. Rate Limiting (비용 관리)
 * 3. 에러 처리 및 로깅
 * 4. 여러 LLM 제공자 지원 (Gemini, OpenAI, Hugging Face)
 *
 * 실행 방법:
 * 1. npm install
 * 2. .env 파일 설정
 * 3. node server.js
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3002;

// ===================================
// 미들웨어 설정
// ===================================

// CORS 활성화 (프론트엔드에서 접근 가능)
app.use(cors());

// JSON 파싱
app.use(express.json());

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rate Limiting (비용 관리!)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 10, // 1분에 10번 허용 (테스트/학습용으로 완화)
  message: {
    success: false,
    error: "Too many AI requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===================================
// LLM 설정 (Multi-Provider Support)
// ===================================

const LLM_CONFIGS = {
  gemini: {
    name: "Google Gemini",
    async generate(prompt) {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const result = await model.generateContent(prompt);
      return result.response.text();
    },
  },
  openai: {
    name: "OpenAI",
    async generate(prompt) {
      const { OpenAI } = require("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    },
  },
  huggingface: {
    name: "Hugging Face",
    async generate(prompt) {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 250,
              temperature: 0.7,
              top_p: 0.95,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Hugging Face API error");
      }

      const data = await response.json();
      return data[0].generated_text;
    },
  },
};

// ===================================
// API 엔드포인트
// ===================================

// 헬스 체크
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Week 5 AI Proxy Server",
    provider: process.env.LLM_PROVIDER || "gemini",
    timestamp: new Date().toISOString(),
  });
});

// AI 생성 엔드포인트 (Rate Limited)
app.post("/api/ai/generate", aiLimiter, async (req, res) => {
  const { prompt } = req.body;

  // 입력 검증
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      success: false,
      error: "Prompt is required and must be a string",
    });
  }

  if (prompt.length > 2000) {
    return res.status(400).json({
      success: false,
      error: "Prompt is too long (max 2000 characters)",
    });
  }

  // LLM 제공자 선택
  const provider = process.env.LLM_PROVIDER || "gemini";
  const config = LLM_CONFIGS[provider];

  if (!config) {
    return res.status(500).json({
      success: false,
      error: `Unsupported LLM provider: ${provider}`,
    });
  }

  // API 키 확인
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) {
    console.error(`Missing API key for provider: ${provider}`);
    return res.status(500).json({
      success: false,
      error: "LLM API key not configured",
    });
  }

  console.log(`[AI Request] Provider: ${config.name}`);
  console.log(`[AI Request] Prompt: ${prompt.slice(0, 100)}...`);

  try {
    const startTime = Date.now();

    // LLM API 호출
    const text = await config.generate(prompt);

    const duration = Date.now() - startTime;
    console.log(`[AI Response] Success (${duration}ms)`);

    res.json({
      success: true,
      text,
      provider: config.name,
      duration,
    });
  } catch (error) {
    console.error("[AI Error]", error);

    // 에러 메시지 정제
    let errorMessage = error.message;

    if (error.message.includes("API key")) {
      errorMessage = "Invalid API key. Please check your configuration.";
    } else if (error.message.includes("quota")) {
      errorMessage = "API quota exceeded. Please try again later.";
    } else if (error.message.includes("rate limit")) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      provider: config.name,
    });
  }
});

// 할일 분해 전용 엔드포인트 (프롬프트 템플릿 포함)
app.post("/api/ai/breakdown", aiLimiter, async (req, res) => {
  const { task } = req.body;

  if (!task || typeof task !== "string") {
    return res.status(400).json({
      success: false,
      error: "Task is required and must be a string",
    });
  }

  // 프롬프트 템플릿
  const prompt = `다음 할일을 구체적이고 실행 가능한 5개 이하의 작은 단계로 나누세요:
"${task}"

각 단계는 한 줄로 작성하고, 번호를 붙이지 마세요.
실행 가능한 동사로 시작하세요 (예: "~하기", "~작성하기").
간결하게 작성하세요 (각 단계는 한 문장).`;

  // generate 엔드포인트 재사용
  req.body = { prompt };
  return app._router.handle(req, res, () => {});
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// ===================================
// 서버 시작
// ===================================

app.listen(PORT, () => {
  console.log("\n🚀 Week 5 AI Proxy Server Started!");
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🤖 LLM Provider: ${process.env.LLM_PROVIDER || "gemini"}`);
  console.log(`⏱️  Rate Limit: 10 requests per 1 minute (학습용 완화 설정)`);
  console.log("\n📋 Available Endpoints:");
  console.log(`  GET  /                  - Health check`);
  console.log(`  POST /api/ai/generate   - General AI generation`);
  console.log(`  POST /api/ai/breakdown  - Task breakdown (preset prompt)`);
  console.log("\n💡 Frontend URL: Open index.html in browser");
  console.log("⚠️  Remember: NEVER expose API keys in frontend!\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});
