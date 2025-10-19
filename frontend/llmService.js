/**
 * LLM Service Layer
 *
 * Express 서버와 통신하는 추상화 레이어
 * 프론트엔드에서 사용하기 쉽도록 간단한 인터페이스 제공
 *
 * 사용법:
 * <script src="llmService.js"></script>
 * <script>
 *   const text = await LLMService.generate('프롬프트');
 *   const steps = await LLMService.breakdownTask('할일');
 * </script>
 */

const LLMService = {
  // Express 서버 URL
  serverUrl: "http://localhost:3002",

  /**
   * 일반 텍스트 생성
   * @param {string} prompt - AI에게 보낼 프롬프트
   * @returns {Promise<string>} AI 응답 텍스트
   */
  async generate(prompt) {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Prompt must be a non-empty string");
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      if (!data.success) {
        throw new Error(data.error || "AI generation failed");
      }

      return data.text;
    } catch (error) {
      // 네트워크 오류 처리
      if (error.message === "Failed to fetch") {
        throw new Error(
          "Cannot connect to server. Is the Express server running?"
        );
      }
      throw error;
    }
  },

  /**
   * 할일 분해 (프롬프트 템플릿 자동 적용)
   * @param {string} task - 분해할 할일
   * @returns {Promise<string[]>} 분해된 단계 배열
   */
  async breakdownTask(task) {
    if (!task || typeof task !== "string") {
      throw new Error("Task must be a non-empty string");
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/ai/breakdown`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      if (!data.success) {
        throw new Error(data.error || "Task breakdown failed");
      }

      // AI 응답을 배열로 파싱
      return this._parseSteps(data.text);
    } catch (error) {
      if (error.message === "Failed to fetch") {
        throw new Error(
          "Cannot connect to server. Is the Express server running?"
        );
      }
      throw error;
    }
  },

  /**
   * AI 응답을 단계별 배열로 파싱
   * @private
   * @param {string} text - AI 응답 텍스트
   * @returns {string[]} 단계 배열
   */
  _parseSteps(text) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // 번호 제거 (1. 2. 3. 등)
        return line.replace(/^[\d]+[\.\)\-\:]\s*/, "");
      })
      .filter((line) => line.length > 5); // 너무 짧은 줄 제외
  },

  /**
   * 서버 연결 테스트
   * @returns {Promise<boolean>} 연결 성공 여부
   */
  async testConnection() {
    try {
      const response = await fetch(this.serverUrl);
      const data = await response.json();
      return response.ok && data.status === "OK";
    } catch (error) {
      return false;
    }
  },

  /**
   * Rate limit 정보 확인 (서버에서 제공하는 경우)
   * @returns {Promise<object>} Rate limit 정보
   */
  async getRateLimitInfo() {
    try {
      const response = await fetch(`${this.serverUrl}/api/ai/rate-limit`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};

// 글로벌 객체로 노출 (HTML에서 바로 사용 가능)
if (typeof window !== "undefined") {
  window.LLMService = LLMService;
}

// ES Module로도 사용 가능
if (typeof module !== "undefined" && module.exports) {
  module.exports = LLMService;
}
