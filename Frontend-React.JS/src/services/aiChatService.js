import axios from '../axios';

/**
 * Gửi câu hỏi tới chatbox AI ở backend.
 *
 * - Ai gọi: `components/AIChatBox/AIChatBox.js`.
 * - Backend: POST /api/ai-chat -> `aiChatController.postAIChat`.
 * - Trả về: `{ errCode, answer, source, model }`
 *     source = 'ai' | 'fallback'.
 *
 * ⚠️ Không chứa key AI ở frontend; key nằm trong NodeJS/.env.
 */
const postAIChatService = (data) => {
    return axios.post('/api/ai-chat', data);
};

export {
    postAIChatService,
};
