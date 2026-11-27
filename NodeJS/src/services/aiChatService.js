/**
 * DỊCH VỤ CHATBOX AI TƯ VẤN SỨC KHỎE
 *
 * - Ai gọi: `aiChatController.postAIChat()` (POST /api/ai-chat)
 * - Gọi tiếp: API của nhà cung cấp LLM (OpenAI-compatible) qua `fetch`.
 * - Bảng DB: không truy cập.
 * - Trả về: `{ errCode, answer, source, model }`
 *     source = 'ai'       -> câu trả lời do mô hình sinh ra
 *     source = 'fallback' -> dùng bộ câu trả lời soạn sẵn (khi chưa có key
 *                            hoặc gọi API lỗi), để chatbox vẫn dùng được.
 *
 * CẤU HÌNH (trong NodeJS/.env):
 *   AI_API_URL   mặc định https://api.openai.com/v1/chat/completions
 *   AI_API_KEY   key của WorkBuddy AI / OpenAI / Gemini (OpenAI-compatible)
 *   AI_MODEL     mặc định gpt-4o-mini
 *   AI_TIMEOUT_MS mặc định 20000
 *
 * ⚠️ Key chỉ nằm ở backend, KHÔNG gửi xuống trình duyệt.
 */

const DEFAULT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Bộ câu hỏi + câu trả lời soạn sẵn.
 * Dùng để:
 *   1. Làm gợi ý bấm nhanh ở frontend (frontend có bản sao danh sách câu hỏi).
 *   2. Trả lời ngay khi chưa cấu hình key AI, hoặc khi gọi AI thất bại.
 *
 * Nội dung ngắn, an toàn, không chẩn đoán/kê đơn.
 */
const PREPARED_QA = [
    {
        id: 'dat-lich',
        question: 'Đặt lịch khám như thế nào?',
        keywords: ['dat lich', 'đặt lịch', 'book', 'hen kham', 'hẹn khám'],
        answer: 'Bạn chọn Chuyên khoa hoặc Bác sĩ → chọn ngày và khung giờ còn trống → điền thông tin và bấm Đặt lịch. Hệ thống sẽ gửi email/Zalo xác nhận; bạn bấm vào link xác nhận là hoàn tất.'
    },
    {
        id: 'chuan-bi',
        question: 'Cần chuẩn bị gì khi đi khám?',
        keywords: ['chuan bi', 'chuẩn bị', 'di kham', 'đi khám', 'mang gi', 'mang gì'],
        answer: 'Bạn nên mang CCCD/BHYT, kết quả xét nghiệm hoặc đơn thuốc cũ (nếu có) và đến trước giờ hẹn 10–15 phút. Nếu khám chuyên khoa, hãy nhịn ăn theo hướng dẫn khi cần xét nghiệm máu.'
    },
    {
        id: 'sot',
        question: 'Sốt cao nên xử lý ra sao?',
        keywords: ['sot', 'sốt', 'nhiet do', 'nhiệt độ'],
        answer: 'Hãy nghỉ ngơi, uống đủ nước, mặc đồ thoáng và theo dõi nhiệt độ mỗi 4–6 giờ. Nếu sốt trên 39°C kéo dài, co giật, khó thở hoặc trẻ dưới 3 tháng tuổi bị sốt, cần đến cơ sở y tế ngay.'
    },
    {
        id: 'huyet-ap',
        question: 'Huyết áp bao nhiêu là cao?',
        keywords: ['huyet ap', 'huyết áp', 'cao ap', 'cao áp', '135/85', '135 85', '140/90', '140 90', 'tam thu', 'tam truong', 'tâm thu', 'tâm trương'],
        answer: 'Huyết áp được coi là cao khi đo tại nhà từ 135/85 mmHg trở lên (tại phòng khám từ 140/90 mmHg). Bạn nên đo lại nhiều lần, nghỉ 5 phút trước khi đo và đi khám nếu chỉ số thường xuyên cao.'
    },
    {
        id: 'dau-dau',
        question: 'Đau đầu kéo dài có nguy hiểm?',
        keywords: ['dau dau', 'đau đầu', 'nhuc dau', 'nhức đầu', 'dau nua dau'],
        answer: 'Đau đầu kéo dài trên 3 ngày, tăng dần hoặc kèm sốt, nôn, nhìn mờ, yếu tay chân là dấu hiệu cần khám sớm. Nếu đau dữ dội đột ngột, hãy gọi 115 hoặc đến cấp cứu ngay.'
    },
    {
        id: 'cam-cum',
        question: 'Cảm cúm kéo dài có sao không?',
        keywords: ['cam cum', 'cảm cúm', 'bi cam', 'bị cảm', 'ho', 'hat hoi', 'hắt hơi', 'nghet mui', 'nghẹt mũi'],
        answer: 'Cảm cúm thông thường thường đỡ sau 5–7 ngày; hãy nghỉ ngơi, uống đủ nước và giữ ấm. Nếu sốt cao trên 39°C, khó thở, đau ngực hoặc triệu chứng nặng lên sau 1 tuần, bạn nên đi khám.'
    },
    {
        id: 'tieu-chay',
        question: 'Tiêu chảy nên ăn gì?',
        keywords: ['tieu chay', 'tiêu chảy', 'di ngoai', 'đi ngoài', 'dau bung', 'đau bụng'],
        answer: 'Hãy uống nhiều nước hoặc dung dịch bù điện giải, ăn cháo, cơm trắng, chuối và tránh đồ dầu mỡ. Nếu tiêu chảy trên 2 ngày, có máu, sốt cao hoặc mất nước nhiều, cần đến cơ sở y tế.'
    },
    {
        id: 'da-day',
        question: 'Đau dạ dày nên làm gì?',
        keywords: ['dau da day', 'đau dạ dày', 'bao tu', 'bạo tử', 'trao nguoc', 'trào ngược', 'oi', 'ợi'],
        answer: 'Bạn nên ăn đúng bữa, chia nhỏ khẩu phần, tránh rượu bia, cà phê và đồ cay; không nằm ngay sau ăn. Nếu đau dữ dội, nôn ra máu hoặc đi ngoài phân đen, cần đi cấp cứu ngay.'
    },
    {
        id: 'kham-dinh-ky',
        question: 'Khám sức khỏe định kỳ bao lâu một lần?',
        keywords: ['dinh ky', 'định kỳ', 'kham tong quat', 'khám tổng quát', 'kham suc khoe', 'khám sức khỏe'],
        answer: 'Người trưởng thành khỏe mạnh nên khám tổng quát mỗi 6–12 tháng; người có bệnh mạn tính (huyết áp, tiểu đường...) nên khám theo lịch bác sĩ. Bạn có thể đặt lịch khám tổng quát ngay trên HealthyCare.'
    },
    {
        id: 'tiem-chung',
        question: 'Tiêm chủng cho trẻ ở đâu?',
        keywords: ['tiem chung', 'tiêm chủng', 'vacxin', 'vắc xin', 'tiem phong', 'tiêm phòng'],
        answer: 'Bạn có thể đặt lịch tiêm chủng tại chuyên khoa Nhi hoặc cơ sở y tế dự phòng trên HealthyCare. Nhớ mang sổ tiêm chủng của trẻ để bác sĩ kiểm tra lịch tiêm còn thiếu.'
    },
    {
        id: 'bhyt',
        question: 'Có nhận bảo hiểm y tế không?',
        keywords: ['bao hiem', 'bảo hiểm', 'bhyt', 'thanh toan', 'thanh toán'],
        answer: 'Mức hưởng bảo hiểm phụ thuộc cơ sở khám và loại thẻ của bạn. Vui lòng liên hệ hotline hoặc hỏi trực tiếp tại quầy tiếp nhận trước khi khám để được kiểm tra quyền lợi.'
    },
    {
        id: 'lien-he',
        question: 'Liên hệ bác sĩ bằng cách nào?',
        keywords: ['lien he', 'liên hệ', 'hotline', 'so dien thoai', 'số điện thoại', 'tu van', 'tư vấn'],
        answer: 'Bạn có thể gọi hotline trên thanh Hỗ trợ ở đầu trang, hoặc để lại lời nhắn trong chatbox này. Đội ngũ sẽ phản hồi trong giờ làm việc; trường hợp khẩn cấp hãy gọi 115.'
    },
];

/**
 * Bỏ dấu tiếng Việt + chuyển chữ thường để so khớp từ khóa dễ hơn.
 * Ví dụ: "Đặt lịch khám" -> "dat lich kham".
 */
const normalizeVi = (text) => {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
};

/**
 * Tìm câu trả lời soạn sẵn phù hợp nhất với câu hỏi.
 * Trả về object trong PREPARED_QA hoặc null nếu không khớp.
 *
 * So khớp theo RANH GIỚI TỪ, không dùng `includes` trần: tránh trường hợp
 * "khỏe" chứa "ho" khiến câu hỏi khám định kỳ bị nhận nhầm thành cảm cúm.
 */
const findPreparedAnswer = (message) => {
    const normalized = normalizeVi(message);
    return PREPARED_QA.find((item) =>
        item.keywords.some((keyword) => {
            const key = normalizeVi(keyword);
            if (!key) return false;
            const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
            return pattern.test(normalized);
        })
    ) || null;
};

/**
 * Tìm chủ đề từ lịch sử hội thoại khi câu hỏi tiếp theo quá ngắn/không có từ khóa.
 * Ví dụ khách hỏi "giải thích thêm về 135/85 mmHg" ngay sau câu huyết áp:
 * câu hiện tại không chứa "huyết áp" nhưng lịch sử thì có.
 */
const findPreparedAnswerFromHistory = (history) => {
    if (!Array.isArray(history)) return null;
    for (let i = history.length - 1; i >= 0; i -= 1) {
        const content = history[i] && history[i].content;
        if (typeof content === 'string' && content.trim()) {
            const found = findPreparedAnswer(content);
            if (found) return found;
        }
    }
    return null;
};

/**
 * Câu trả lời dự phòng khi không khớp câu hỏi soạn sẵn và không gọi được AI.
 */
const getGenericFallback = () => ({
    answer: 'AI đang tạm bận nên chưa trả lời chi tiết được câu này. Bạn thử lại sau vài giây nhé, hoặc chọn một câu hỏi gợi ý bên dưới. Nếu cần gấp, vui lòng gọi hotline để được tư vấn trực tiếp.',
    source: 'fallback',
});

/**
 * Prompt hệ thống: giữ câu trả lời ngắn, đúng chủ đề, an toàn.
 */
const buildSystemPrompt = () => {
    return [
        'Bạn là trợ lý tư vấn sức khỏe của HealthyCare - nền tảng đặt lịch khám bệnh.',
        'Luôn trả lời bằng tiếng Việt, thân thiện, xưng "mình" và gọi người dùng là "bạn".',
        'Trả lời NGẮN: tối đa 3 câu, dưới 70 từ, đi thẳng vào câu hỏi.',
        'Chỉ tư vấn thông tin sức khỏe phổ thông và hướng dẫn đặt lịch; KHÔNG chẩn đoán bệnh, KHÔNG kê đơn thuốc.',
        'KHÔNG nêu tên thuốc cụ thể hoặc liều dùng; chỉ khuyên đến bác sĩ/cơ sở y tế để được chỉ định.',
        'Nếu có dấu hiệu nguy hiểm (khó thở, đau ngực, co giật, mất ý thức, đau đầu dữ dội đột ngột), hãy khuyên gọi 115 hoặc đến cấp cứu ngay.',
        'Nếu câu hỏi ngoài chủ đề sức khỏe/đặt lịch, lịch sự nói rằng bạn chỉ hỗ trợ chủ đề này.',
    ].join(' ');
};

/**
 * Chuẩn hóa lịch sử hội thoại do frontend gửi lên.
 * Chỉ giữ role user/assistant, nội dung chuỗi, tối đa 6 lượt gần nhất.
 */
const sanitizeHistory = (history) => {
    if (!Array.isArray(history)) return [];
    return history
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
        .filter((item) => typeof item.content === 'string' && item.content.trim())
        .slice(-6)
        .map((item) => ({
            role: item.role,
            content: item.content.trim().slice(0, 600),
        }));
};

/**
 * Đọc nội dung trả lời từ nhiều dạng response khác nhau
 * (OpenAI, Gemini OpenAI-compatible, một số gateway nội bộ).
 */
const extractAnswer = (data) => {
    if (!data) return '';
    if (data.choices && data.choices[0]) {
        const choice = data.choices[0];
        if (choice.message && typeof choice.message.content === 'string') {
            return choice.message.content;
        }
        if (typeof choice.text === 'string') return choice.text;
    }
    if (data.candidates && data.candidates[0]) {
        const parts = data.candidates[0].content && data.candidates[0].content.parts;
        if (Array.isArray(parts) && parts[0] && typeof parts[0].text === 'string') {
            return parts[0].text;
        }
    }
    if (typeof data.output_text === 'string') return data.output_text;
    return '';
};

/**
 * Làm sạch câu trả lời trước khi gửi frontend:
 * bỏ markdown thừa, gộp khoảng trắng, giới hạn độ dài.
 */
const cleanAnswer = (text) => {
    return String(text || '')
        .replace(/\*\*/g, '')
        .replace(/^#+\s*/gm, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 700);
};

/**
 * Gọi một model cụ thể. Tách riêng để `callLLM` có thể thử nhiều model.
 * Ném lỗi kèm `status` để biết có nên thử model khác hay không.
 */
const callOneModel = async (apiUrl, apiKey, model, message, history, timeoutMs) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Dòng GPT-5/GPT-6 và o-series là model suy luận: dùng max_completion_tokens,
    // không gửi temperature (một số model chỉ nhận giá trị mặc định).
    const isReasoningModel = /^(gpt-5|gpt-6|o[1-9])/i.test(model);
    const payload = {
        model,
        messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...sanitizeHistory(history),
            { role: 'user', content: String(message).slice(0, 600) },
        ],
    };
    if (isReasoningModel) {
        payload.max_completion_tokens = 260;
    } else {
        payload.temperature = 0.4;
        payload.max_tokens = 220;
    }

    // Gemini (Google AI Studio) bật "thinking" mặc định, ăn hết token và làm
    // câu trả lời bị cắt cụt. Với endpoint OpenAI-compatible, gửi
    // reasoning_effort="none" để tắt thinking. Chỉ áp dụng cho Gemini để
    // không ảnh hưởng nhà cung cấp khác.
    const isGemini = /generativelanguage\.googleapis\.com/i.test(apiUrl);
    if (isGemini && process.env.AI_REASONING_EFFORT) {
        payload.reasoning_effort = process.env.AI_REASONING_EFFORT;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            const error = new Error(`AI API HTTP ${response.status}: ${body.slice(0, 200)}`);
            error.code = 'AI_HTTP_ERROR';
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        const answer = cleanAnswer(extractAnswer(data));
        if (!answer) {
            const error = new Error('AI API returned empty answer');
            error.code = 'AI_EMPTY_ANSWER';
            error.status = 200;
            throw error;
        }
        return answer;
    } finally {
        clearTimeout(timer);
    }
};

/**
 * Gọi LLM qua endpoint OpenAI-compatible.
 *
 * Thử lần lượt `AI_MODEL` rồi `AI_MODEL_FALLBACKS` để tăng khả năng trả lời:
 * - Model không tồn tại/không có quyền (HTTP 400/404) -> thử model kế tiếp.
 * - Key sai (401/403), hết quota (429) hoặc lỗi mạng -> dừng ngay (thử nữa vô ích).
 *
 * Trả về `{ answer, model }` hoặc ném lỗi cuối cùng.
 */
const callLLM = async (message, history) => {
    const apiUrl = process.env.AI_API_URL || DEFAULT_API_URL;
    const apiKey = process.env.AI_API_KEY || '';
    const primaryModel = process.env.AI_MODEL || DEFAULT_MODEL;
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 20000;

    if (!apiKey) {
        const error = new Error('AI_API_KEY is not configured');
        error.code = 'NO_API_KEY';
        throw error;
    }

    const fallbackModels = String(process.env.AI_MODEL_FALLBACKS || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    const models = [primaryModel, ...fallbackModels]
        .filter((model, index, arr) => model && arr.indexOf(model) === index);

    let lastError = null;
    let transientAttempts = 0;

    for (const model of models) {
        try {
            const answer = await callOneModel(apiUrl, apiKey, model, message, history, timeoutMs);
            return { answer, model };
        } catch (e) {
            lastError = e;

            // Thử model kế tiếp khi:
            //  - model không tồn tại/không có quyền (400/404)
            //  - model quá tải (5xx)
            //  - request bị timeout/abort (Gemini đôi khi phản hồi rất chậm)
            // KHÔNG thử tiếp khi key sai (401/403) hoặc hết quota (429).
            const isAbort = e.name === 'AbortError' || e.code === 'ABORT_ERR' || e.code === 20;
            const retryable = e.status === 400 || e.status === 404 || isAbort || e.status >= 500;
            if (!retryable) throw e;

            // Lỗi tạm thời (timeout/5xx) chỉ thử thêm 1 lần để khách không chờ quá lâu.
            if (isAbort || e.status >= 500) {
                transientAttempts += 1;
                if (transientAttempts >= 2) throw e;
            }

            console.log(`>>> AI MODEL ${model} LOI (${e.status || e.code || e.name}), THU MODEL TIEP THEO`);
        }
    }

    throw lastError || new Error('No AI model available');
};

/**
 * Hàm chính: trả lời một tin nhắn của khách.
 *
 * Thứ tự ưu tiên:
 *   1. Nếu đã cấu hình AI_API_KEY -> gọi LLM.
 *   2. Nếu chưa có key hoặc gọi lỗi -> dùng câu trả lời soạn sẵn.
 *
 * Trả về: `{ errCode: 0, answer, source, model }`.
 */
const chat = async (message, history) => {
    const text = String(message || '').trim();
    if (!text) {
        return { errCode: 1, errMessage: 'Missing message!' };
    }

    try {
        const result = await callLLM(text, history);
        return {
            errCode: 0,
            answer: result.answer,
            source: 'ai',
            model: result.model,
        };
    } catch (e) {
        // Không log key; chỉ log mã lỗi để chẩn đoán.
        console.log('>>> AI CHAT FALLBACK:', e.code || '', '-', e.message);

        const prepared = findPreparedAnswer(text) || findPreparedAnswerFromHistory(history);
        if (prepared) {
            return {
                errCode: 0,
                answer: prepared.answer,
                source: 'fallback',
                model: 'prepared-qa',
            };
        }

        return {
            errCode: 0,
            ...getGenericFallback(),
            model: 'prepared-qa',
        };
    }
};

module.exports = {
    chat,
    PREPARED_QA,
};
