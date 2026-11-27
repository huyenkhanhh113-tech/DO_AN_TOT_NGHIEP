import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import './ManageHomepage.scss';
import {
    getHomepageSettingsService,
    updateHomepageSettingsService,
    getAllServiceItemsService,
    createServiceItemService,
    updateServiceItemService,
    deleteServiceItemService,
} from '../../../services/userService';
import ConfirmDialog from '../../../components/ConfirmDialog';

/**
 * Danh sách icon Font Awesome phổ biến để chọn trực quan.
 * Người dùng vẫn có thể gõ tay class khác vào ô nhập liệu.
 */
const ICON_PRESETS = [
    'fas fa-hospital',
    'fas fa-hospital-alt',
    'fas fa-user-md',
    'fas fa-stethoscope',
    'fas fa-heartbeat',
    'fas fa-tooth',
    'fas fa-vial',
    'fas fa-microscope',
    'fas fa-mobile-alt',
    'fas fa-universal-access',
    'fas fa-baby',
    'fas fa-eye',
    'fas fa-brain',
    'fas fa-lungs',
    'fas fa-pills',
    'fas fa-syringe',
    'fas fa-x-ray',
    'fas fa-ambulance',
    'fas fa-first-aid',
    'fas fa-heart',
];

// Giá trị mặc định cho form cấu hình banner (8 trường)
const EMPTY_BANNER = {
    badgeVi: '',
    badgeEn: '',
    titleVi: '',
    titleEn: '',
    searchPlaceholderVi: '',
    searchPlaceholderEn: '',
    searchButtonVi: '',
    searchButtonEn: '',
};

// Giá trị mặc định cho form ô dịch vụ
const EMPTY_ITEM = {
    nameVi: '',
    nameEn: '',
    iconClass: 'fas fa-hospital',
    link: '',
    sortOrder: 1,
    isActive: 1,
};

class ManageHomepage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // (a) Cấu hình banner đầu trang
            banner: { ...EMPTY_BANNER },
            loadingBanner: false,
            savingBanner: false,

            // (b) Danh sách ô dịch vụ dưới banner
            items: [],
            loadingItems: false,
            itemForm: { ...EMPTY_ITEM },
            editingItemId: '',
            isItemConfirmOpen: false,
            itemToDelete: null,
        }
        // Tham chiếu khu vực form ô dịch vụ để cuộn tới khi bấm "Sửa"
        this.serviceFormRef = React.createRef()
    }

    componentDidMount() {
        this.fetchBannerSettings()
        this.fetchServiceItems()
    }

    // ==========================================================
    // (a) CẤU HÌNH BANNER ĐẦU TRANG
    // ==========================================================
    fetchBannerSettings = async () => {
        this.setState({ loadingBanner: true })
        try {
            const res = await getHomepageSettingsService()
            const data = (res && res.errCode === 0 && res.data) ? res.data : {}
            this.setState({
                banner: {
                    badgeVi: data.badgeVi || '',
                    badgeEn: data.badgeEn || '',
                    titleVi: data.titleVi || '',
                    titleEn: data.titleEn || '',
                    searchPlaceholderVi: data.searchPlaceholderVi || '',
                    searchPlaceholderEn: data.searchPlaceholderEn || '',
                    searchButtonVi: data.searchButtonVi || '',
                    searchButtonEn: data.searchButtonEn || '',
                },
                loadingBanner: false,
            })
        } catch (error) {
            this.setState({ loadingBanner: false })
            toast.error('Không tải được dữ liệu trang chủ!')
        }
    }

    handleBannerChange = (event, field) => {
        this.setState({
            banner: {
                ...this.state.banner,
                [field]: event.target.value,
            }
        })
    }

    handleSaveBanner = async () => {
        this.setState({ savingBanner: true })
        try {
            const res = await updateHomepageSettingsService({ ...this.state.banner })
            if (res && res.errCode === 0) {
                toast.success('Lưu nội dung banner thành công!')
            } else {
                toast.error('Lưu nội dung banner thất bại!')
            }
        } catch (error) {
            toast.error('Lưu nội dung banner thất bại!')
        }
        this.setState({ savingBanner: false })
    }

    // ==========================================================
    // (b) Ô DỊCH VỤ DƯỚI BANNER
    // ==========================================================
    fetchServiceItems = async () => {
        this.setState({ loadingItems: true })
        try {
            const res = await getAllServiceItemsService()
            const items = (res && res.errCode === 0 && Array.isArray(res.data)) ? res.data : []
            this.setState({ items, loadingItems: false })
        } catch (error) {
            this.setState({ items: [], loadingItems: false })
            toast.error('Không tải được dữ liệu trang chủ!')
        }
    }

    handleItemChange = (event, field) => {
        const value = field === 'isActive'
            ? (event.target.checked ? 1 : 0)
            : event.target.value
        this.setState({
            itemForm: {
                ...this.state.itemForm,
                [field]: value,
            }
        })
    }

    // Chọn icon từ lưới icon trực quan
    handlePickIcon = (iconClass) => {
        this.setState({
            itemForm: { ...this.state.itemForm, iconClass }
        })
    }

    resetItemForm = () => {
        this.setState({
            itemForm: { ...EMPTY_ITEM },
            editingItemId: '',
        })
    }

    handleSaveItem = async () => {
        const { itemForm, editingItemId } = this.state
        if (!itemForm.nameVi || !itemForm.nameVi.trim()) {
            toast.error('Vui lòng nhập tên ô dịch vụ!')
            return
        }

        const payload = {
            nameVi: itemForm.nameVi,
            nameEn: itemForm.nameEn,
            iconClass: itemForm.iconClass,
            link: itemForm.link,
            sortOrder: Number(itemForm.sortOrder) || 0,
            isActive: Number(itemForm.isActive) ? 1 : 0,
        }

        try {
            let res
            if (editingItemId) {
                res = await updateServiceItemService({ id: editingItemId, ...payload })
            } else {
                res = await createServiceItemService(payload)
            }

            if (res && res.errCode === 0) {
                toast.success(editingItemId ? 'Cập nhật ô dịch vụ thành công!' : 'Thêm ô dịch vụ thành công!')
                this.resetItemForm()
                this.fetchServiceItems()
            } else {
                toast.error('Lưu ô dịch vụ thất bại!')
            }
        } catch (error) {
            toast.error('Lưu ô dịch vụ thất bại!')
        }
    }

    handleEditItem = (item) => {
        this.setState({
            itemForm: {
                nameVi: item.nameVi || '',
                nameEn: item.nameEn || '',
                iconClass: item.iconClass || 'fas fa-hospital',
                link: item.link || '',
                sortOrder: item.sortOrder || 1,
                isActive: Number(item.isActive) ? 1 : 0,
            },
            editingItemId: item.id,
        })
        if (this.serviceFormRef.current && this.serviceFormRef.current.scrollIntoView) {
            this.serviceFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    // Bật/tắt nhanh isActive ngay trên card
    handleToggleActive = async (item) => {
        const nextActive = Number(item.isActive) !== 0 ? 0 : 1
        try {
            const res = await updateServiceItemService({
                id: item.id,
                nameVi: item.nameVi,
                nameEn: item.nameEn,
                iconClass: item.iconClass,
                link: item.link,
                sortOrder: item.sortOrder,
                isActive: nextActive,
            })
            if (res && res.errCode === 0) {
                this.fetchServiceItems()
            } else {
                toast.error('Đổi trạng thái ô dịch vụ thất bại!')
            }
        } catch (error) {
            toast.error('Đổi trạng thái ô dịch vụ thất bại!')
        }
    }

    handleDeleteItemClick = (item) => {
        this.setState({ isItemConfirmOpen: true, itemToDelete: item })
    }

    handleCancelDeleteItem = () => {
        this.setState({ isItemConfirmOpen: false, itemToDelete: null })
    }

    handleConfirmDeleteItem = async () => {
        const { itemToDelete } = this.state
        this.setState({ isItemConfirmOpen: false, itemToDelete: null })
        if (!itemToDelete || !itemToDelete.id) return

        try {
            const res = await deleteServiceItemService(itemToDelete.id)
            if (res && res.errCode === 0) {
                toast.success('Xoá ô dịch vụ thành công!')
                this.fetchServiceItems()
            } else {
                const msg = (res && res.errMessage)
                    ? res.errMessage
                    : 'Xoá ô dịch vụ thất bại!'
                toast.error(msg)
            }
        } catch (error) {
            toast.error('Xoá ô dịch vụ thất bại!')
        }
    }

    // Lấy danh sách ô dịch vụ đang bật, sắp xếp theo sortOrder (dùng cho preview)
    getVisibleItems = () => {
        return this.state.items
            .filter((item) => item && Number(item.isActive) !== 0)
            .slice()
            .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    }

    render() {
        const { banner, items, itemForm, editingItemId } = this.state
        const isEditingItem = !!editingItemId
        const visiblePreviewItems = this.getVisibleItems()

        // Giá trị hiển thị trên preview: ưu tiên nội dung đang gõ, rỗng thì dùng i18n mặc định
        const previewBadge = banner.badgeVi || banner.badgeEn
        const previewTitle = banner.titleVi || banner.titleEn
        const previewPlaceholder = banner.searchPlaceholderVi || banner.searchPlaceholderEn
        const previewButton = banner.searchButtonVi || banner.searchButtonEn

        return (
            <div className='manage-homepage-container'>
                <div className='mh-title'>
                    {'Quản lý khu vực trang chủ'}
                </div>

                {/* ============================================================
                    PHẦN A: NỘI DUNG BANNER ĐẦU TRANG (form + live preview)
                   ============================================================ */}
                <section className='mh-section'>
                    <div className='mh-section__head'>
                        <h2 className='mh-section__title'>
                            <i className="fas fa-bullhorn"></i>
                            {'Nội dung banner đầu trang'}
                        </h2>
                        <p className='mh-section__desc'>
                            {'Chỉnh sửa nội dung hiển thị trên banner trang chủ, có xem trước trực tiếp bên cạnh.'}
                        </p>
                    </div>

                    <div className='row mh-banner-row'>
                        {/* Cột form nhập liệu */}
                        <div className='col-lg-6'>
                            <div className='mh-form-card'>
                                {this.state.loadingBanner ? (
                                    <div className='state-box'>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        {'Đang tải dữ liệu...'}
                                    </div>
                                ) : (
                                    <>
                                        {/* badge */}
                                        <div className='row'>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Dòng nhỏ trên tiêu đề'} ({'Tiếng Việt'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.badgeVi}
                                                    onChange={(event) => this.handleBannerChange(event, 'badgeVi')}
                                                />
                                            </div>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Dòng nhỏ trên tiêu đề'} ({'Tiếng Anh'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.badgeEn}
                                                    onChange={(event) => this.handleBannerChange(event, 'badgeEn')}
                                                />
                                            </div>
                                        </div>

                                        {/* title */}
                                        <div className='row'>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Tiêu đề lớn'} ({'Tiếng Việt'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.titleVi}
                                                    onChange={(event) => this.handleBannerChange(event, 'titleVi')}
                                                />
                                            </div>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Tiêu đề lớn'} ({'Tiếng Anh'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.titleEn}
                                                    onChange={(event) => this.handleBannerChange(event, 'titleEn')}
                                                />
                                            </div>
                                        </div>

                                        {/* search placeholder */}
                                        <div className='row'>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Chữ gợi ý trong ô tìm kiếm'} ({'Tiếng Việt'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.searchPlaceholderVi}
                                                    onChange={(event) => this.handleBannerChange(event, 'searchPlaceholderVi')}
                                                />
                                            </div>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Chữ gợi ý trong ô tìm kiếm'} ({'Tiếng Anh'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.searchPlaceholderEn}
                                                    onChange={(event) => this.handleBannerChange(event, 'searchPlaceholderEn')}
                                                />
                                            </div>
                                        </div>

                                        {/* search button */}
                                        <div className='row'>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Chữ trên nút tìm kiếm'} ({'Tiếng Việt'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.searchButtonVi}
                                                    onChange={(event) => this.handleBannerChange(event, 'searchButtonVi')}
                                                />
                                            </div>
                                            <div className='col-md-6 form-group'>
                                                <label>
                                                    {'Chữ trên nút tìm kiếm'} ({'Tiếng Anh'})
                                                </label>
                                                <input className='form-control' type='text' value={banner.searchButtonEn}
                                                    onChange={(event) => this.handleBannerChange(event, 'searchButtonEn')}
                                                />
                                            </div>
                                        </div>

                                        <button type='button' className='btn btn-primary mh-save-btn'
                                            disabled={this.state.savingBanner}
                                            onClick={this.handleSaveBanner}
                                        >
                                            <i className="fas fa-save"></i> {'Lưu thay đổi'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Cột live preview: điểm nhấn thị giác của trang */}
                        <div className='col-lg-6'>
                            <div className='mh-preview-card'>
                                <div className='mh-preview-card__head'>
                                    <span className='mh-preview-card__dot'></span>
                                    {'Xem trước trực tiếp'}
                                </div>
                                <div className='mh-banner-preview'>
                                    <div className='mh-banner-preview__decor' aria-hidden='true'></div>
                                    <div className='mh-banner-preview__badge'>
                                        {previewBadge ? previewBadge : 'NỀN TẢNG Y TẾ'}
                                    </div>
                                    <div className='mh-banner-preview__title'>
                                        {previewTitle ? previewTitle : 'CHĂM SÓC SỨC KHỎE TOÀN DIỆN'}
                                    </div>
                                    <div className='mh-banner-preview__search'>
                                        <i className="fas fa-search"></i>
                                        <span className='mh-banner-preview__placeholder'>
                                            {previewPlaceholder
                                                ? previewPlaceholder
                                                : 'Tìm chuyên khoa khám bệnh...'}
                                        </span>
                                        <span className='mh-banner-preview__btn'>
                                            {previewButton
                                                ? previewButton
                                                : 'Tìm kiếm'}
                                        </span>
                                    </div>
                                </div>
                                <p className='mh-preview-card__hint'>
                                    <i className="fas fa-lightbulb"></i> {'Thay đổi hiển thị ngay khi bạn nhập.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================================
                    PHẦN B: CÁC Ô DỊCH VỤ DƯỚI BANNER (CRUD)
                   ============================================================ */}
                <section className='mh-section' ref={this.serviceFormRef}>
                    <div className='mh-section__head'>
                        <h2 className='mh-section__title'>
                            <i className="fas fa-th-large"></i>
                            {'Các ô dịch vụ dưới banner'}
                        </h2>
                        <p className='mh-section__desc'>
                            {'Quản lý danh sách ô dịch vụ hiển thị bên dưới banner trang chủ.'}
                        </p>
                    </div>

                    {/* Form thêm mới / chỉnh sửa ô dịch vụ */}
                    <div className='mh-form-card'>
                        <div className='mh-form-card__header'>
                            <span className={'mh-form-card__badge' + (isEditingItem ? ' is-edit' : '')}>
                                {isEditingItem
                                    ? 'Chỉnh sửa ô dịch vụ'
                                    : 'Thêm ô dịch vụ'}
                            </span>
                            {isEditingItem && (
                                <button type='button' className='btn btn-outline-secondary btn-cancel-edit'
                                    onClick={this.resetItemForm}
                                >
                                    <i className="fas fa-times"></i> {'Huỷ chỉnh sửa'}
                                </button>
                            )}
                        </div>

                        <div className='row'>
                            <div className='col-md-4 form-group'>
                                <label>{'Tên (Tiếng Việt)'}</label>
                                <input className='form-control' type='text' value={itemForm.nameVi}
                                    onChange={(event) => this.handleItemChange(event, 'nameVi')}
                                />
                            </div>
                            <div className='col-md-4 form-group'>
                                <label>{'Tên (Tiếng Anh)'}</label>
                                <input className='form-control' type='text' value={itemForm.nameEn}
                                    onChange={(event) => this.handleItemChange(event, 'nameEn')}
                                />
                            </div>
                            <div className='col-md-4 form-group'>
                                <label>{'Đường dẫn liên kết'}</label>
                                <input className='form-control' type='text' value={itemForm.link}
                                    onChange={(event) => this.handleItemChange(event, 'link')}
                                />
                            </div>
                            <div className='col-md-4 form-group'>
                                <label>{'Thứ tự hiển thị'}</label>
                                <input className='form-control' type='number' value={itemForm.sortOrder}
                                    onChange={(event) => this.handleItemChange(event, 'sortOrder')}
                                />
                            </div>
                            <div className='col-md-4 form-group'>
                                <label>{'Icon (class Font Awesome)'}</label>
                                <div className='mh-icon-input'>
                                    <span className='mh-icon-input__preview'>
                                        <i className={itemForm.iconClass || 'fas fa-hospital'}></i>
                                    </span>
                                    <input className='form-control' type='text' value={itemForm.iconClass}
                                        onChange={(event) => this.handleItemChange(event, 'iconClass')}
                                    />
                                </div>
                            </div>
                            <div className='col-md-4 form-group mh-active-field'>
                                <label>{'Trạng thái hoạt động'}</label>
                                <label className='mh-switch'>
                                    <input type='checkbox' checked={Number(itemForm.isActive) !== 0}
                                        onChange={(event) => this.handleItemChange(event, 'isActive')}
                                    />
                                    <span className='mh-switch__slider'></span>
                                    <span className='mh-switch__text'>
                                        {Number(itemForm.isActive) !== 0
                                            ? 'Đang bật'
                                            : 'Đang tắt'}
                                    </span>
                                </label>
                            </div>

                            {/* Lưới chọn icon trực quan */}
                            <div className='col-12 form-group'>
                                <label>{'Chọn icon trực quan'}</label>
                                <div className='mh-icon-picker'>
                                    {ICON_PRESETS.map((icon) => (
                                        <button
                                            type='button'
                                            key={icon}
                                            className={'mh-icon-picker__item' + (itemForm.iconClass === icon ? ' is-active' : '')}
                                            title={icon}
                                            onClick={() => this.handlePickIcon(icon)}
                                        >
                                            <i className={icon}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button type='button'
                            className={isEditingItem ? 'btn btn-warning mh-save-btn' : 'btn btn-primary mh-save-btn'}
                            onClick={this.handleSaveItem}
                        >
                            {isEditingItem
                                ? <><i className="fas fa-save"></i> {'Lưu thay đổi'}</>
                                : <><i className="fas fa-plus"></i> {'Thêm ô dịch vụ'}</>}
                        </button>
                    </div>

                    {/* Live preview khối ô tròn giống trang chủ */}
                    <div className='mh-preview-card mh-preview-card--service'>
                        <div className='mh-preview-card__head'>
                            <span className='mh-preview-card__dot'></span>
                            {'Xem trước khối ô dịch vụ'}
                        </div>
                        <div className='mh-service-preview'>
                            {visiblePreviewItems.length === 0 ? (
                                <div className='mh-service-preview__empty'>
                                    {'Chưa có dữ liệu'}
                                </div>
                            ) : (
                                <div className='mh-service-preview__options'>
                                    {visiblePreviewItems.map((item, index) => {
                                        const label = item.nameVi || item.nameEn
                                        return (
                                            <div className='mh-service-preview__item' key={item.id || index}>
                                                <div className='mh-service-preview__icon'>
                                                    <i className={item.iconClass || 'fas fa-hospital'}></i>
                                                </div>
                                                <div className='mh-service-preview__text'>{label}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Danh sách card các ô dịch vụ */}
                    <div className='mh-list'>
                        <div className='mh-list__header'>
                            {'Danh sách ô dịch vụ'}
                            <span className='mh-list__count'>{items.length}</span>
                        </div>

                        {this.state.loadingItems ? (
                            <div className='state-box'>
                                <i className="fas fa-spinner fa-spin"></i>
                                {'Đang tải dữ liệu...'}
                            </div>
                        ) : items.length === 0 ? (
                            <div className='state-box'>
                                <i className="fas fa-inbox"></i>
                                {'Chưa có dữ liệu'}
                            </div>
                        ) : (
                            <div className='mh-item-grid'>
                                {items.map((item, index) => {
                                    const isOn = Number(item.isActive) !== 0
                                    const label = item.nameVi || item.nameEn
                                    return (
                                        <div className={'mh-item-card' + (isOn ? '' : ' is-off')} key={item.id || index}>
                                            <div className='mh-item-card__top'>
                                                <span className='mh-item-card__icon'>
                                                    <i className={item.iconClass || 'fas fa-hospital'}></i>
                                                </span>
                                                <button type='button'
                                                    className={'mh-item-card__status' + (isOn ? ' is-on' : ' is-off')}
                                                    onClick={() => this.handleToggleActive(item)}
                                                    title={isOn ? 'Đang bật' : 'Đang tắt'}
                                                >
                                                    <i className={isOn ? 'fas fa-toggle-on' : 'fas fa-toggle-off'}></i>
                                                </button>
                                            </div>
                                            <div className='mh-item-card__name'>{label}</div>
                                            <div className='mh-item-card__meta'>
                                                <span className='mh-item-card__order'>#{item.sortOrder}</span>
                                                {item.link && <span className='mh-item-card__link'>{item.link}</span>}
                                            </div>
                                            <div className='mh-item-card__actions'>
                                                <button type='button' className='btn-action btn-action--edit'
                                                    onClick={() => this.handleEditItem(item)}
                                                >
                                                    <i className="fas fa-pencil-alt"></i> {'Sửa'}
                                                </button>
                                                <button type='button' className='btn-action btn-action--delete'
                                                    onClick={() => this.handleDeleteItemClick(item)}
                                                >
                                                    <i className="fas fa-trash-alt"></i> {'Xoá'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Hộp thoại xác nhận xoá ô dịch vụ: nội dung có cụm "Bạn có muốn xóa" */}
                <ConfirmDialog
                    isOpen={this.state.isItemConfirmOpen}
                    variant='danger'
                    title="Bạn có muốn xóa?"
                    message={`Bạn có muốn xóa "${this.state.itemToDelete ? (this.state.itemToDelete.nameVi || this.state.itemToDelete.nameEn) : ''}"? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    onConfirm={this.handleConfirmDeleteItem}
                    onCancel={this.handleCancelDeleteItem}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageHomepage);
