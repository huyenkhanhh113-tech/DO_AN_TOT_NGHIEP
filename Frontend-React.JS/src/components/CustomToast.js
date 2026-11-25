import React, { Component, Fragment } from 'react';

import CustomScrollBar from '../components/CustomScrollbars';

import './CustomToast.scss';

/**
 * CustomToast - Nội dung tuỳ biến cho thông báo (toast) ở góc màn hình.
 *
 * Props:
 *  - title   : string       - tiêu đề thông báo (đã là chuỗi tiếng Việt)
 *  - message : string|array - nội dung; nếu là mảng thì hiển thị trong khung cuộn
 *  - time    : Date         - thời điểm hiện thông báo (hiển thị giờ:phút:giây)
 *
 * Trước đây component này nhận `titleId`/`messageId` (khoá dịch) rồi tra qua
 * react-intl. Nay đã bỏ cơ chế đa ngôn ngữ nên nhận thẳng chuỗi văn bản.
 */
class CustomToast extends Component {

    /**
     * Định dạng thời gian hiển thị theo kiểu Việt Nam (HH:MM:SS).
     *
     * - Ai gọi: `render()` của component này (hiển thị mốc thời gian trên toast).
     * - Bảng: không truy cập DB.
     * - Trả về: **chuỗi** giờ phút giây theo locale `vi-VN`; trả `''` nếu
     *   giá trị thời gian không hợp lệ.
     *
     * Trước đây dùng `<FormattedTime>` của react-intl; nay thay bằng
     * `toLocaleTimeString('vi-VN')` sau khi bỏ cơ chế đa ngôn ngữ.
     */
    formatTime = (time) => {
        try {
            return new Date(time).toLocaleTimeString('vi-VN');
        } catch (e) {
            return '';
        }
    }

    render() {
        const { title, message, time } = this.props;
        return (
            <Fragment>
                <div className="custom-toast">
                    <div className="toast-title">
                        {time && (
                            <span className="date">{this.formatTime(time)}</span>
                        )}
                        <i className="fa fa-fw fa-exclamation-triangle" />
                        {title}
                    </div>
                    {
                        // Nếu message là mảng (nhiều dòng lỗi) thì cho vào khung cuộn
                        (message && typeof message === 'object') ?
                            <CustomScrollBar autoHeight={true} autoHeightMin={50} autoHeightMax={100}>
                                {
                                    message.map((msg, index) => {
                                        return (
                                            <Fragment key={index}>
                                                <div className="toast-content">{msg}</div>
                                            </Fragment>
                                        )
                                    })
                                }
                            </CustomScrollBar> :
                            <div className="toast-content">
                                {message ? message : null}
                            </div>
                    }
                </div>
            </Fragment>
        );
    }
}

/** Nút đóng (dấu X) ở góc phải của toast */
export class CustomToastCloseButton extends Component {

    render() {
        return (
            <button type="button" className="toast-close" onClick={this.props.closeToast}>
                <i className="fa fa-fw fa-times-circle" />
            </button>
        );
    }
}

export default CustomToast;
