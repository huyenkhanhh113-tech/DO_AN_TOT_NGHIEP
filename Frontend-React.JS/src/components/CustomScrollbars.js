import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import './CustomScrollbars.scss';

/**
 * Thanh cuộn tuỳ biến (bọc `react-custom-scrollbars`) dùng chung.
 *
 * Được dùng ở: `Navigator` (menu dọc bên trái), `CustomToast` (khung nội dung
 * lỗi nhiều dòng) và một số trang cần vùng cuộn có giao diện đồng bộ.
 */
class CustomScrollbars extends Component {

    // Tham chiếu tới component Scrollbars con để gọi các API cuộn của nó.
    ref = React.createRef();

    /**
     * Lấy vị trí cuộn ngang hiện tại (px).
     *
     * - Ai gọi: component cha thông qua `ref` (nếu cần).
     * - Gọi tiếp: `scrollbars.getScrollLeft()` của react-custom-scrollbars.
     * - Trả về: **số** — khoảng cách đã cuộn theo trục ngang.
     */
    getScrollLeft =()=>{
        const scrollbars = this.ref.current;
        return scrollbars.getScrollLeft();
    }

    /**
     * Lấy vị trí cuộn dọc hiện tại (px).
     *
     * - Ai gọi: component cha thông qua `ref` (nếu cần).
     * - Gọi tiếp: `scrollbars.getScrollTop()`.
     * - Trả về: **số** — khoảng cách đã cuộn theo trục dọc.
     */
    getScrollTop =()=>{
        const scrollbars = this.ref.current;
        return scrollbars.getScrollTop();
    }

    /**
     * Cuộn xuống tận đáy vùng nội dung.
     *
     * - Ai gọi: component cha khi cần (ví dụ tự cuộn xuống cuối danh sách).
     * - Gọi tiếp: `getScrollHeight()` rồi `scrollTo()`.
     * - Trả về: không trả dữ liệu.
     */
    scrollToBottom = () => {
        if (!this.ref || !this.ref.current) {
            return;
        }
        const scrollbars = this.ref.current;
        const targetScrollTop = scrollbars.getScrollHeight();
        this.scrollTo(targetScrollTop);
    };

    /**
     * Cuộn mượt tới vị trí `targetTop` theo hiệu ứng chia 30 bước.
     *
     * - Ai gọi: `scrollToBottom()` (trong cùng lớp).
     * - Gọi tiếp: `scrollbars.scrollTop()` lặp 30 lần (mỗi bước 20ms),
     *   hoặc chạy liền nếu prop `quickScroll === true`.
     * - Trả về: không trả dữ liệu.
     *
     * Đây là hiệu ứng "ease" đơn giản: mỗi bước đi 1/30 quãng đường còn lại.
     */
    scrollTo = (targetTop) => {
        const { quickScroll } = this.props;
        if (!this.ref || !this.ref.current) {
            return;
        }
        const scrollbars = this.ref.current;
        const originalTop = scrollbars.getScrollTop();
        let iteration = 0;

        const scroll = () => {
            iteration++;
            if (iteration > 30) {
                return;
            }
            scrollbars.scrollTop(originalTop + (targetTop - originalTop) / 30 * iteration);

            if (quickScroll && quickScroll === true) {
                scroll();
            } else {
                setTimeout(() => {
                    scroll();
                }, 20);
            }
        };

        scroll();
    };

    /**
     * Render thanh rãnh cuộn ngang (phần nền của thanh cuộn).
     *
     * - Ai gọi: `render()` truyền vào prop `renderTrackHorizontal`.
     * - Trả về: JSX `<div className="track-horizontal" />`.
     */
    renderTrackHorizontal = (props) => {
        return (
            <div {...props} className="track-horizontal" />
        );
    };

    /**
     * Render thanh rãnh cuộn dọc.
     *
     * - Ai gọi: `render()` truyền vào prop `renderTrackVertical`.
     * - Trả về: JSX `<div className="track-vertical" />`.
     */
    renderTrackVertical = (props) => {
        return (
            <div {...props} className="track-vertical" />
        );
    };

    /**
     * Render con trượt (thumb) của thanh cuộn ngang.
     *
     * - Ai gọi: `render()` truyền vào prop `renderThumbHorizontal`.
     * - Trả về: JSX `<div className="thumb-horizontal" />`.
     */
    renderThumbHorizontal = (props) => {
        return (
            <div {...props} className="thumb-horizontal" />
        );
    };

    /**
     * Render con trượt (thumb) của thanh cuộn dọc.
     *
     * - Ai gọi: `render()` truyền vào prop `renderThumbVertical`.
     * - Trả về: JSX `<div className="thumb-vertical" />`.
     */
    renderThumbVertical = (props) => {
        return (
            <div {...props} className="thumb-vertical" />
        );
    };

    /**
     * Render "rỗng" để TẮT một chiều cuộn.
     *
     * - Ai gọi: `render()` khi prop `disableHorizontalScroll` hoặc
     *   `disableVerticalScroll` được bật.
     * - Trả về: JSX `<div />` (không vẽ thanh cuộn).
     */
    renderNone = (props) => {
        return (
            <div />
        );
    };

    /**
     * Render vùng cuộn, gắn thanh cuộn tuỳ biến và xử lý bật/tắt từng chiều.
     *
     * - Ai gọi: React tự gọi khi component cần vẽ.
     * - Trả về: JSX `<Scrollbars>` chứa `children`.
     *
     * Props: `disableHorizontalScroll`, `disableVerticalScroll`, `quickScroll`,
     * `className` + mọi prop khác được truyền tiếp xuống `Scrollbars`.
     */
    render() {
        const { className, disableVerticalScroll, disableHorizontalScroll, children,...otherProps } = this.props;
        return (
            <Scrollbars
                ref={this.ref}
                autoHide={true}
                autoHideTimeout={200}
                hideTracksWhenNotNeeded={true}
                className={className ? className + ' custom-scrollbar' : 'custom-scrollbar'}
                {...otherProps}
                renderTrackHorizontal={disableHorizontalScroll ? this.renderNone : this.renderTrackHorizontal}
                renderTrackVertical={disableVerticalScroll ? this.renderNone : this.renderTrackVertical}
                renderThumbHorizontal={disableHorizontalScroll ? this.renderNone : this.renderThumbHorizontal}
                renderThumbVertical={disableVerticalScroll ? this.renderNone : this.renderThumbVertical}
            >
                {children}
            </Scrollbars>
        );
    }
}

export default CustomScrollbars;
