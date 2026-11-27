import aiChatService from "../services/aiChatService";

/**
 * API: POST /api/ai-chat
 * Chức năng: trả lời câu hỏi tư vấn sức khỏe cho chatbox AI.
 *
 * - Ai gọi tới: `AIChatBox` (frontend) qua `aiChatService.postAIChatService()`.
 * - Gọi tiếp: `aiChatService.chat(message, history)`.
 * - Bảng DB: không truy cập.
 * - Body: `{ message: string, history: [{ role, content }] }`
 * - Trả về: `{ errCode, answer, source, model }`
 *     errCode 0 = thành công, 1 = thiếu message, -1 = lỗi server.
 *
 * ⚠️ Key AI nằm trong `.env` của backend, không bao giờ trả về client.
 */
let postAIChat = async (req, res) => {
    try {
        const { message, history } = req.body || {};
        const info = await aiChatService.chat(message, history);
        return res.status(200).json(info);
    } catch (e) {
        console.log('>>> AI CHAT ERROR:', e.message);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server ...',
        });
    }
};

/**
 * API: GET /api/ai-chat/status
 * Chức năng: kiểm tra cấu hình AI mà KHÔNG lộ key.
 *
 * - Ai gọi tới: người quản trị (curl/trình duyệt) sau khi thay key.
 * - Trả về: `{ errCode, hasKey, keyFormatOk, provider, model, fallbackModels, apiUrlHost }`
 *     keyFormatOk = đúng định dạng của nhà cung cấp:
 *       - OpenAI: bắt đầu bằng "sk-"
 *       - Google AI Studio: bắt đầu bằng "AIza" hoặc "AQ."
 *
 * Dùng để biết nhanh: đã có key chưa, key có đúng dạng không, đang dùng model nào.
 */
let getAIStatus = async (req, res) => {
    const key = process.env.AI_API_KEY || '';
    let apiUrlHost = '';
    try {
        apiUrlHost = new URL(process.env.AI_API_URL || 'https://api.openai.com').host;
    } catch (e) {
        apiUrlHost = 'invalid-url';
    }

    const isGoogle = apiUrlHost.includes('generativelanguage.googleapis.com');
    const provider = isGoogle ? 'google' : (apiUrlHost.includes('openai.com') ? 'openai' : 'custom');
    const keyFormatOk = provider === 'google'
        ? /^(AIza|AQ\.)/.test(key)
        : (provider === 'openai' ? key.startsWith('sk-') : Boolean(key));

    return res.status(200).json({
        errCode: 0,
        hasKey: Boolean(key),
        keyFormatOk,
        provider,
        keyLength: key.length,
        model: process.env.AI_MODEL || 'gemini-3.1-flash-lite',
        fallbackModels: String(process.env.AI_MODEL_FALLBACKS || '')
            .split(',').map((item) => item.trim()).filter(Boolean),
        reasoningEffort: process.env.AI_REASONING_EFFORT || '',
        apiUrlHost,
    });
};

module.exports = {
    postAIChat,
    getAIStatus,
};
