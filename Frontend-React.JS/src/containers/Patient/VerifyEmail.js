import React, { Component } from 'react';
import { connect } from "react-redux";
import { postVerifyBookingService } from '../../services/userService'
import HomeHeader from '../HomePage/HomeHeader';
import verifySuccessImg from '../../assets/verify-success.png';
import verifyErrorImg from '../../assets/verify-error.png';
import "./VerifyEmail.scss"

/**
 * Trang xác nhận lịch khám khi khách bấm link trong email (/verify-booking).
 *
 * - Đọc `token` + `doctorId` từ query string.
 * - Gọi `postVerifyBookingService()` -> backend chuyển lịch S1 -> S2.
 * - Thành công: hiện ảnh `assets/verify-success.png`.
 * - Thất bại : hiện ảnh `assets/verify-error.png` kèm lý do.
 *
 * Lưu ý: ảnh được `import` để webpack đóng gói thành `/static/media/...`.
 * Trước đây ảnh khai báo bằng `background-image: url('../../assets/...')`
 * trong SCSS nhưng không được webpack rewrite -> trình duyệt tải `/assets/...`
 * -> 404 -> trang trắng dù đã xác nhận thành công.
 */
class VerifyEmail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            statusVerify: false,
            errCode: 0,
            errorMessage: ''
        }
    }

    async componentDidMount() {
        const search = this.props.location ? this.props.location.search : ''
        const urlParams = new URLSearchParams(search)
        const token = urlParams.get('token')
        const doctorId = urlParams.get('doctorId')

        if (!token || !doctorId) {
            this.setState({
                statusVerify: true,
                errCode: 2,
                errorMessage: 'Đường link xác nhận không hợp lệ (thiếu token hoặc doctorId).'
            })
            return
        }

        try {
            const res = await postVerifyBookingService({ token, doctorId })
            if (res && res.errCode === 0) {
                this.setState({ statusVerify: true, errCode: 0, errorMessage: '' })
            } else {
                this.setState({
                    statusVerify: true,
                    errCode: res && res.errCode ? res.errCode : -1,
                    errorMessage: (res && res.errMessage) || 'Không xác nhận được lịch khám.'
                })
            }
        } catch (e) {
            // Mất kết nối backend / CORS: phải thoát trạng thái loading,
            // nếu không trang sẽ kẹt ở "Loading data..." mãi mãi.
            this.setState({
                statusVerify: true,
                errCode: -1,
                errorMessage: 'Không kết nối được máy chủ. Vui lòng thử lại sau.'
            })
        }
    }

    render() {
        const { statusVerify, errCode, errorMessage } = this.state
        return (
            <>
                <HomeHeader />
                <div className='verify-container'>
                    {statusVerify === false ?
                        <div className='verify-loading'>Đang xác nhận lịch khám...</div>
                        :
                        <div className='verify-result'>
                            {+errCode === 0 ?
                                <img
                                    className='verify-img-success'
                                    src={verifySuccessImg}
                                    alt='Xác nhận lịch khám thành công'
                                />
                                :
                                <>
                                    <img
                                        className='verify-img-err'
                                        src={verifyErrorImg}
                                        alt='Xác nhận lịch khám thất bại'
                                    />
                                    {errorMessage && <p className='verify-message'>{errorMessage}</p>}
                                </>
                            }
                        </div>
                    }
                </div>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
