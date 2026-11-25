import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeHeader.scss';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { fetchSearchSpecialty } from '../../store/actions/adminActions';
// API cấu hình hero trang chủ — chỉ đọc, không sửa service
import { getHomepageSettingsService, getAllServiceItemsService } from '../../services/userService';
import ServiceIcons from './ServiceIcons';

class HomeHeader extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // Cấu hình hero đọc từ API; null = chưa có => render dùng giá trị i18n mặc định
            homepageSettings: null,
            // Danh sách ô dịch vụ đọc từ API; rỗng => ServiceIcons tự fallback về 6 ô mặc định
            serviceItems: []
        }
        // Tham chiếu tới ô input để lấy giá trị khi bấm nút "Tìm kiếm"
        this.searchInputRef = React.createRef()
    }

    /**
     * Tải cấu hình hero + danh sách ô dịch vụ song song khi component mount.
     * Bọc try/catch: nếu backend tắt / API lỗi thì giữ state rỗng để trang chủ
     * vẫn hiển thị bình thường bằng giá trị mặc định (i18n) — không được vỡ trang.
     */
    componentDidMount() {
        this.fetchHomepageData()
    }

    fetchHomepageData = async () => {
        try {
            const [settingsRes, itemsRes] = await Promise.all([
                getHomepageSettingsService(),
                getAllServiceItemsService()
            ])

            // Chỉ nhận dữ liệu khi errCode === 0 và đúng kiểu; còn lại coi như không có
            const settings = (settingsRes && settingsRes.errCode === 0 && settingsRes.data) ? settingsRes.data : null
            const items = (itemsRes && itemsRes.errCode === 0 && Array.isArray(itemsRes.data)) ? itemsRes.data : []

            this.setState({ homepageSettings: settings, serviceItems: items })
        } catch (error) {
            // Backend chưa chạy hoặc lỗi mạng: fallback an toàn, không throw ra ngoài
            console.log('HomeHeader: Không tải được cấu hình trang chủ, dùng giá trị mặc định.', error)
            this.setState({ homepageSettings: null, serviceItems: [] })
        }
    }

    /**
     * Lấy giá trị tiếng Việt từ cấu hình API (ưu tiên field Vi, fallback sang En).
     * Trả về chuỗi rỗng nếu API chưa có để nơi gọi tự dùng giá trị mặc định.
     */
    getLocalizedValue = (fieldVi, fieldEn) => {
        const settings = this.state.homepageSettings || {}
        const primary = settings[fieldVi]
        const secondary = settings[fieldEn]
        return primary || secondary || ''
    }

    handleReturnToHome = () => {
        if (this.props.history) {
            this.props.history.push(`/home`)
        }
    }

    handleViewAllClinic = () => {
        if (this.props.history) {
            this.props.history.push(`/all-clinic`)
        }
    }

    handleViewAllSpecialty = () => {
        if (this.props.history) {
            this.props.history.push(`/all-specialty`)
        }
    }

    handleViewSearchSpecialty = () => {
        if (this.props.history) {
            this.props.history.push(`/search-specialty`)
        }
    }

    handleViewAllDoctor = () => {
        if (this.props.history) {
            this.props.history.push(`/all-doctor`)
        }
    }

    handleViewAllHandbook = () => {
        if (this.props.history) {
            this.props.history.push(`/all-handbook`)
        }
    }

    handleOnKeyDown = async (event) => {
        if (event.key === 'Enter') {
            this.props.fetchSearchSpecialty(event.target.value)
            this.handleViewSearchSpecialty()
        }
    }

    /**
     * Bấm nút "Tìm kiếm" màu cam: giữ đúng hành vi của handleOnKeyDown
     * (gọi fetchSearchSpecialty rồi điều hướng sang trang tìm kiếm chuyên khoa).
     */
    handleSearchButtonClick = () => {
        const value = this.searchInputRef.current ? this.searchInputRef.current.value : ''
        this.props.fetchSearchSpecialty(value)
        this.handleViewSearchSpecialty()
    }

    render() {
        // Nội dung hero: ưu tiên lấy từ API, thiếu thì dùng giá trị mặc định bên dưới
        const badgeText = this.getLocalizedValue('badgeVi', 'badgeEn')
        const titleText = this.getLocalizedValue('titleVi', 'titleEn')
        const searchPlaceholder = this.getLocalizedValue('searchPlaceholderVi', 'searchPlaceholderEn') || 'Tìm chuyên khoa khám bệnh'
        const searchButtonText = this.getLocalizedValue('searchButtonVi', 'searchButtonEn') || 'Tìm kiếm'

        return (
            <>
                <div className='home-header-container'>
                    <div className='home-header-content'>
                        <div className='left-content'>
                            <i class="fas fa-home" onClick={() => this.handleReturnToHome()}></i>
                            <div className='header-logo'
                            onClick={() => this.handleReturnToHome()}
                            ></div>
                        </div>
                        <div className='center-content'>
                            <div className='child-content' onClick={() => this.handleViewAllSpecialty()}>
                                <div><b>{'Chuyên khoa'}</b></div>
                                <div className='subs-title'>{'Tìm bác sĩ theo chuyên khoa'}</div>
                            </div>
                            <div className='child-content' onClick={() => this.handleViewAllClinic()}>
                                <div><b>{'Cơ sở y tế'}</b></div>
                                <div className='subs-title'>{'Chọn bệnh viện phòng khám'}</div>
                            </div>
                            <div className='child-content' onClick={() => this.handleViewAllDoctor()}>
                                <div><b>{'Bác sĩ'}</b></div>
                                <div className='subs-title'>{'Chọn bác sĩ giỏi'}</div>
                            </div>
                            <div className='child-content' onClick={() => this.handleViewAllHandbook()}>
                                <div><b>{'Cẩm nang'}</b></div>
                                <div className='subs-title'>{'Cẩm nang hữu ích'}</div>
                            </div>
                        </div>
                        <div className='right-content'>
                            <div className='support'>
                                {/* Chỉ dùng để hiện tooltip: không có đích điều hướng nên dùng button thay vì link */}
                                <button type="button" className="support-btn" data-for='question' data-tip="React-tooltip">
                                    <i className="fas fa-question-circle"></i>{'Hỗ trợ'}
                                </button>
                                <ReactTooltip id='question' place="bottom" type="dark" effect="float">
                                    <p>{'Cần hỗ trợ, click ở đây!'}</p>
                                </ReactTooltip>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.isShowBanner === true &&
                    <div className='home-header-banner'>
                        {/* Lớp trang trí tạo chiều sâu: các blob mờ + lưới chấm chuyển động nhẹ */}
                        <div className='hero-decor' aria-hidden='true'>
                            <span className='blob blob-1'></span>
                            <span className='blob blob-2'></span>
                            <span className='blob blob-3'></span>
                            <span className='dot-grid'></span>
                        </div>
                        <div className='content-up'>
                            {/* Badge dạng pill phía trên tiêu đề */}
                            <div className='title1'>
                                {badgeText ? badgeText : 'NỀN TẢNG Y TẾ'}
                            </div>
                            <div className='title2'>
                                {titleText ? titleText : 'CHĂM SÓC SỨC KHỎE TOÀN DIỆN'}
                            </div>
                            <div className='search'>
                                <i className="fas fa-search"></i>
                                <input
                                    ref={this.searchInputRef}
                                    type='text'
                                    placeholder={searchPlaceholder}
                                    onKeyDown={(event) => this.handleOnKeyDown(event)}
                                />
                                <button
                                    type='button'
                                    className='search-btn'
                                    onClick={() => this.handleSearchButtonClick()}
                                >
                                    {searchButtonText}
                                </button>
                            </div>
                        </div>
                        <div className='content-down'>
                            {/* Khối 6 ô dịch vụ động: dữ liệu từ API, fallback về i18n khi lỗi */}
                            <ServiceIcons items={this.state.serviceItems} />
                        </div>
                    </div>
                }
            </>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        dataSpecialty: state.admin.dataSpecialty
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchSearchSpecialty: (nameInput) => dispatch(fetchSearchSpecialty(nameInput))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeHeader));
