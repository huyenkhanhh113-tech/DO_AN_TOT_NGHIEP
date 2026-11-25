import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './ServiceIcons.scss';

/**
 * Danh sách 6 ô dịch vụ MẶC ĐỊNH (fallback).
 * Chỉ dùng khi API lỗi / backend chưa chạy / trả về mảng rỗng.
 * Giữ nguyên hành vi cũ: icon + key i18n có sẵn (banner.child1..child6)
 * và bổ sung đường dẫn điều hướng hợp lý cho từng ô.
 */
const FALLBACK_ITEMS = [
    { id: 'fallback-1', label: 'Khám chuyên khoa', iconClass: 'fas fa-hospital', link: '/all-specialty', sortOrder: 1, isActive: 1 },
    { id: 'fallback-2', label: 'Khám từ xa', iconClass: 'fas fa-mobile-alt', link: '/all-doctor', sortOrder: 2, isActive: 1 },
    { id: 'fallback-3', label: 'Khám tổng quát', iconClass: 'fas fa-hospital-alt', link: '/all-clinic', sortOrder: 3, isActive: 1 },
    { id: 'fallback-4', label: 'Xét nghiệm y học', iconClass: 'fas fa-vial', link: '/all-clinic', sortOrder: 4, isActive: 1 },
    { id: 'fallback-5', label: 'Sức khỏe tinh thần', iconClass: 'fas fa-universal-access', link: '/all-specialty', sortOrder: 5, isActive: 1 },
    { id: 'fallback-6', label: 'Khám nha khoa', iconClass: 'fas fa-user-md', link: '/all-doctor', sortOrder: 6, isActive: 1 }
];

/**
 * ServiceIcons - Khối 6 ô dịch vụ nằm dưới banner trang chủ.
 * Dữ liệu lấy động từ API (props.items); nếu không có thì tự fallback về i18n.
 */
class ServiceIcons extends Component {
    /**
     * Lọc các ô đang hoạt động (isActive khác 0) và sắp xếp theo sortOrder tăng dần.
     * Trả về mảng rỗng nếu đầu vào không hợp lệ để phía render quyết định fallback.
     */
    getVisibleItems = (items) => {
        if (!Array.isArray(items) || items.length === 0) {
            return [];
        }
        return items
            .filter((item) => item && Number(item.isActive) !== 0)
            .slice()
            .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    };

    // Điều hướng tới đường dẫn nội bộ của ô dịch vụ (chỉ khi có link hợp lệ)
    handleClickItem = (link) => {
        if (link && this.props.history) {
            this.props.history.push(link);
        }
    };

    render() {
        const { items } = this.props;

        // Ưu tiên dữ liệu động từ API; nếu rỗng thì dùng danh sách mặc định
        let visibleItems = this.getVisibleItems(items);
        let isFallback = false;
        if (visibleItems.length === 0) {
            isFallback = true;
            visibleItems = this.getVisibleItems(FALLBACK_ITEMS);
        }

        return (
            <div className='service-icons'>
                <div className='options'>
                    {visibleItems.map((item, index) => {
                        // Nội dung chữ: fallback dùng nhãn có sẵn, dữ liệu API dùng tên tiếng Việt
                        const apiLabel = item.nameVi || item.nameEn;

                        return (
                            <div
                                className='option-child'
                                key={item.id || index}
                                // Stagger: mỗi ô trễ thêm 80ms để xuất hiện lần lượt
                                style={{ animationDelay: `${index * 0.08}s` }}
                                onClick={() => this.handleClickItem(item.link)}
                            >
                                <div className='icon-child'>
                                    <i className={item.iconClass || 'fas fa-hospital'}></i>
                                </div>
                                <div className='text-child'>
                                    {isFallback
                                        ? item.label
                                        : apiLabel}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default withRouter(ServiceIcons);
