import React, { Component } from 'react';
import './ConfirmDialog.scss';

/**
 * ConfirmDialog - Hộp thoại xác nhận dùng chung toàn ứng dụng.
 *
 * Thay thế hoàn toàn hộp thoại xác nhận mặc định của trình duyệt: có overlay mờ,
 * hộp thoại bo góc + đổ bóng theo design system ($hc-*), hiệu ứng fade + scale,
 * đóng bằng phím Esc hoặc bấm ra ngoài overlay.
 *
 * Props:
 *  - isOpen      : boolean  - hiển thị hay ẩn hộp thoại
 *  - title       : node     - tiêu đề (thường là chuỗi tiếng Việt)
 *  - message     : node     - nội dung mô tả (node hoặc chuỗi)
 *  - confirmText : node     - chữ trên nút xác nhận (mặc định: "Đồng ý")
 *  - cancelText  : node     - chữ trên nút huỷ (mặc định: "Hủy")
 *  - onConfirm   : function - gọi khi bấm nút xác nhận
 *  - onCancel    : function - gọi khi bấm huỷ / Esc / bấm ra ngoài
 *  - variant     : 'danger' | 'primary' - kiểu màu của nút xác nhận
 */
class ConfirmDialog extends Component {
    /**
     * Gắn listener bàn phím ở cấp `document` để bắt được phím Esc.
     *
     * - Ai gọi: React tự gọi khi component được mount.
     * - Gọi tiếp: `document.addEventListener('keydown', ...)`.
     * - Trả về: không trả dữ liệu.
     */
    componentDidMount() {
        // Lắng nghe bàn phím ở cấp document để bắt phím Esc
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Gỡ listener bàn phím khi component bị unmount (tránh rò rỉ bộ nhớ).
     *
     * - Ai gọi: React tự gọi khi component bị unmount.
     * - Trả về: không trả dữ liệu.
     */
    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Đóng hộp thoại khi người dùng bấm phím Esc.
     *
     * - Ai gọi: sự kiện `keydown` trên `document` (đã đăng ký ở `componentDidMount`).
     * - Gọi tiếp: `handleCancel()` -> `props.onCancel()`.
     * - Trả về: không trả dữ liệu.
     */
    handleKeyDown = (event) => {
        if (!this.props.isOpen) return;
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.preventDefault();
            this.handleCancel();
        }
    }

    /**
     * Đóng hộp thoại khi bấm ra vùng overlay (bên ngoài khung hội thoại).
     *
     * - Ai gọi: sự kiện `onClick` của thẻ overlay trong `render()`.
     * - Gọi tiếp: `handleCancel()` nếu đúng là click vào overlay (không phải nội dung).
     * - Trả về: không trả dữ liệu.
     */
    handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            this.handleCancel();
        }
    }

    /**
     * Gọi callback huỷ do component cha truyền vào.
     *
     * - Ai gọi: `handleKeyDown()`, `handleOverlayClick()`, nút "Hủy" trong `render()`.
     * - Gọi tiếp: `props.onCancel()` (nếu là function).
     * - Trả về: không trả dữ liệu.
     *
     * Nơi dùng: `ManageHomepage`, `TableManageUser`, `ManageClinic`,
     * `ManageSpecialty`, `ManageHandBook` — mỗi nơi truyền `onCancel` để đóng dialog.
     */
    handleCancel = () => {
        if (typeof this.props.onCancel === 'function') {
            this.props.onCancel();
        }
    }

    /**
     * Gọi callback xác nhận do component cha truyền vào.
     *
     * - Ai gọi: nút xác nhận trong `render()`.
     * - Gọi tiếp: `props.onConfirm()` (nếu là function).
     * - Trả về: không trả dữ liệu.
     *
     * Nơi dùng: 5 trang quản trị nêu trên — `onConfirm` thường là hàm xoá
     * bản ghi rồi đóng dialog và tải lại danh sách.
     */
    handleConfirm = () => {
        if (typeof this.props.onConfirm === 'function') {
            this.props.onConfirm();
        }
    }

    render() {
        const { isOpen, title, message, confirmText, cancelText, variant } = this.props;

        // Không render gì khi hộp thoại đang đóng
        if (!isOpen) return null;

        // variant='danger' => nút xác nhận màu đỏ cảnh báo
        const isDanger = variant === 'danger';
        const confirmClass = 'hc-confirm__btn hc-confirm__btn--confirm' + (isDanger ? ' is-danger' : ' is-primary');

        return (
            <div
                className='hc-confirm-overlay'
                role='presentation'
                onClick={this.handleOverlayClick}
            >
                <div
                    className='hc-confirm'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='hc-confirm-title'
                >
                    <div className={'hc-confirm__icon ' + (isDanger ? 'is-danger' : 'is-primary')}>
                        <i className={isDanger ? 'fas fa-exclamation-triangle' : 'fas fa-question-circle'}></i>
                    </div>

                    <h3 className='hc-confirm__title' id='hc-confirm-title'>
                        {title ? title : 'Xác nhận'}
                    </h3>

                    {message ? (
                        <div className='hc-confirm__message'>{message}</div>
                    ) : null}

                    <div className='hc-confirm__actions'>
                        <button
                            type='button'
                            className='hc-confirm__btn hc-confirm__btn--cancel'
                            onClick={this.handleCancel}
                        >
                            {cancelText ? cancelText : 'Hủy'}
                        </button>
                        <button
                            type='button'
                            className={confirmClass}
                            onClick={this.handleConfirm}
                        >
                            {confirmText ? confirmText : 'Đồng ý'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConfirmDialog;
