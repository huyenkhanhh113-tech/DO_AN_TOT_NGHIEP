import React, { Component, createRef } from 'react';
import { postAIChatService } from '../../services/aiChatService';
import './AIChatBox.scss';

/**
 * Danh sách câu hỏi sức khỏe soạn sẵn.
 * Bấm vào chip -> gửi nguyên câu hỏi tới backend -> AI trả lời ngắn gọn.
 *
 * ⚠️ Danh sách này trùng với PREPARED_QA trong
 * `NodeJS/src/services/aiChatService.js`. Nếu sửa câu hỏi, sửa cả 2 nơi.
 */
const QUICK_QUESTIONS = [
    'Đặt lịch khám như thế nào?',
    'Cần chuẩn bị gì khi đi khám?',
    'Sốt cao nên xử lý ra sao?',
    'Huyết áp bao nhiêu là cao?',
    'Đau đầu kéo dài có nguy hiểm?',
    'Cảm cúm kéo dài có sao không?',
    'Tiêu chảy nên ăn gì?',
    'Đau dạ dày nên làm gì?',
    'Khám sức khỏe định kỳ bao lâu một lần?',
    'Tiêm chủng cho trẻ ở đâu?',
    'Có nhận bảo hiểm y tế không?',
    'Liên hệ bác sĩ bằng cách nào?',
];

let messageId = 0;
const nextId = () => {
    messageId += 1;
    return `msg-${messageId}`;
};

/**
 * Chatbox AI tư vấn sức khỏe — hiển thị ở góc trái dưới toàn bộ website.
 *
 * Luồng:
 *   1. Khách bấm nút tròn -> mở panel, hiện lời chào + chip câu hỏi gợi ý.
 *   2. Bấm chip hoặc nhập câu hỏi -> gọi `postAIChatService()`.
 *   3. Backend trả `answer` (AI hoặc bộ soạn sẵn) -> hiện bong bóng trả lời.
 *
 * Không chứa key AI; key nằm ở backend (`NodeJS/.env`).
 */
class AIChatBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            input: '',
            isTyping: false,
            messages: [],
        };
        this.messagesEndRef = createRef();
        this.inputRef = createRef();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.messages.length !== prevState.messages.length || this.state.isTyping !== prevState.isTyping) {
            this.scrollToBottom();
        }
        if (this.state.isOpen && !prevState.isOpen) {
            this.focusInput();
        }
    }

    scrollToBottom = () => {
        if (this.messagesEndRef.current) {
            this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    focusInput = () => {
        setTimeout(() => {
            if (this.inputRef.current) this.inputRef.current.focus();
        }, 120);
    };

    toggleChat = () => {
        this.setState((prev) => {
            const isOpen = !prev.isOpen;
            const messages = prev.messages.length
                ? prev.messages
                : [{
                    id: nextId(),
                    role: 'assistant',
                    content: 'Xin chào, mình là trợ lý sức khỏe của HealthyCare. Bạn cần hỏi gì hôm nay?',
                }];
            return { isOpen, messages };
        });
    };

    closeChat = () => {
        this.setState({ isOpen: false });
    };

    handleInputChange = (event) => {
        this.setState({ input: event.target.value });
    };

    handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSend();
        }
    };

    handleQuickQuestion = (question) => {
        if (this.state.isTyping) return;
        this.sendMessage(question);
    };

    handleSend = () => {
        const text = this.state.input.trim();
        if (!text || this.state.isTyping) return;
        this.setState({ input: '' });
        this.sendMessage(text);
    };

    /**
     * Gửi tin nhắn lên backend và thêm câu trả lời vào khung chat.
     * Nếu API lỗi, hiện thông báo thân thiện thay vì im lặng.
     */
    sendMessage = async (text) => {
        const userMessage = { id: nextId(), role: 'user', content: text };
        const history = this.state.messages
            .filter((item) => item.role === 'user' || item.role === 'assistant')
            .map((item) => ({ role: item.role, content: item.content }));

        this.setState((prev) => ({
            messages: [...prev.messages, userMessage],
            isTyping: true,
        }));

        try {
            const res = await postAIChatService({ message: text, history });
            const answer = res && res.errCode === 0 && res.answer
                ? res.answer
                : 'Xin lỗi, mình chưa lấy được câu trả lời. Bạn thử lại hoặc gọi hotline để được hỗ trợ nhé.';

            this.setState((prev) => ({
                messages: [...prev.messages, { id: nextId(), role: 'assistant', content: answer }],
                isTyping: false,
            }));
        } catch (e) {
            this.setState((prev) => ({
                messages: [...prev.messages, {
                    id: nextId(),
                    role: 'assistant',
                    content: 'Không kết nối được máy chủ tư vấn. Bạn kiểm tra mạng rồi thử lại, hoặc gọi hotline trên thanh Hỗ trợ nhé.',
                }],
                isTyping: false,
            }));
        }
    };

    render() {
        const { isOpen, messages, input, isTyping } = this.state;

        return (
            <div className={`ai-chat ${isOpen ? 'ai-chat--open' : ''}`}>
                {isOpen && (
                    <section className='ai-chat__panel' aria-label='Chatbox tư vấn sức khỏe'>
                        <header className='ai-chat__header'>
                            <div className='ai-chat__avatar'>
                                <i className='fas fa-user-md' aria-hidden='true'></i>
                            </div>
                            <div className='ai-chat__heading'>
                                <h3>Trợ lý sức khỏe AI</h3>
                                <p><span className='ai-chat__online-dot'></span>HealthyCare · trả lời trong vài giây</p>
                            </div>
                            <button
                                type='button'
                                className='ai-chat__close'
                                onClick={this.closeChat}
                                aria-label='Đóng chatbox'
                            >
                                <i className='fas fa-times' aria-hidden='true'></i>
                            </button>
                        </header>

                        <div className='ai-chat__body'>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`ai-chat__row ai-chat__row--${message.role}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className='ai-chat__bot-avatar'>
                                            <i className='fas fa-robot' aria-hidden='true'></i>
                                        </div>
                                    )}
                                    <div className={`ai-chat__bubble ai-chat__bubble--${message.role}`}>
                                        {message.content}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className='ai-chat__row ai-chat__row--assistant'>
                                    <div className='ai-chat__bot-avatar'>
                                        <i className='fas fa-robot' aria-hidden='true'></i>
                                    </div>
                                    <div className='ai-chat__bubble ai-chat__bubble--assistant ai-chat__typing'>
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={this.messagesEndRef} />
                        </div>

                        <div className='ai-chat__quick'>
                            <span className='ai-chat__quick-label'>Câu hỏi gợi ý</span>
                            <div className='ai-chat__quick-list'>
                                {QUICK_QUESTIONS.map((question) => (
                                    <button
                                        key={question}
                                        type='button'
                                        className='ai-chat__chip'
                                        onClick={() => this.handleQuickQuestion(question)}
                                        disabled={isTyping}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='ai-chat__input'>
                            <textarea
                                ref={this.inputRef}
                                rows={1}
                                value={input}
                                onChange={this.handleInputChange}
                                onKeyDown={this.handleKeyDown}
                                placeholder='Nhập câu hỏi về sức khỏe...'
                                aria-label='Nhập câu hỏi'
                            />
                            <button
                                type='button'
                                className='ai-chat__send'
                                onClick={this.handleSend}
                                disabled={!input.trim() || isTyping}
                                aria-label='Gửi câu hỏi'
                            >
                                <i className='fas fa-paper-plane' aria-hidden='true'></i>
                            </button>
                        </div>

                        <p className='ai-chat__note'>
                            Thông tin chỉ mang tính tham khảo, không thay thế chẩn đoán của bác sĩ.
                        </p>
                    </section>
                )}

                <button
                    type='button'
                    className='ai-chat__toggle'
                    onClick={this.toggleChat}
                    aria-label={isOpen ? 'Thu nhỏ chatbox' : 'Mở chatbox tư vấn sức khỏe'}
                >
                    <i className={`fas ${isOpen ? 'fa-chevron-down' : 'fa-comment-dots'}`} aria-hidden='true'></i>
                    {!isOpen && <span className='ai-chat__ping'></span>}
                </button>
            </div>
        );
    }
}

export default AIChatBox;
