import React, { Component } from 'react';
import { connect } from "react-redux";
import './BookingModal.scss'
import { Modal } from 'reactstrap';
import ProfileDoctor from '../ProfileDoctor';
import _ from 'lodash';
import DatePicker from '../../../../components/Input/DatePicker'
import * as actions from '../../../../store/actions'
import Select from "react-select"
import { postPatientBookingService } from '../../../../services/userService'
import { toast } from 'react-toastify';
import moment from 'moment';
import LoadingOverlay from 'react-loading-overlay';

class BookingModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullName: '',
            phoneNumber: '',
            email: '',
            address: '',
            reason: '',
            birthday: '',
            selectedGender: '',
            doctorId: '',
            genders: '',
            timeType: '',
            // Kênh xác nhận lịch khám khách hàng chọn: 'email' hoặc 'zalo'
            confirmChannel: 'email',
            // Số điện thoại Zalo (chỉ cần khi chọn kênh Zalo)
            zaloPhone: '',
            isShowLoading: false
        }
    }

    async componentDidMount() {
        this.props.getGenders()
    }

    buildDataGender = (data) => {
        let result = []
        if (data && data.length > 0) {
            data.forEach(item => {
                let object = {}
                object.label = item.valueVi
                object.value = item.keyMap
                result.push(object)
            })
        }
        return result
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
                if (this.props.genders !== prevProps.genders) {
            this.setState({
                genders: this.buildDataGender(this.props.genders)
            })
        }
        if (this.props.dataTime !== prevProps.dataTime) {
            if (this.props.dataTime && !_.isEmpty(this.props.dataTime)) {
                let doctorIdData = this.props.dataTime.doctorId
                let timeType = this.props.dataTime.timeType
                this.setState({
                    doctorId: doctorIdData,
                    timeType: timeType
                })
            }
        }
    }

    handleOnChangeInput = (event, id) => {
        let valueInput = event.target.value
        let stateCopy = { ...this.state }
        stateCopy[id] = valueInput
        this.setState({
            ...stateCopy
        })
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({
            birthday: date[0]
        })
    }

    /** Ghép chuỗi "khung giờ - ngày khám" (tiếng Việt) để hiển thị và gửi vào nội dung xác nhận */
    buildTimeBooking = (dataTime) => {
        if (dataTime && !_.isEmpty(dataTime)) {
            let time = dataTime.timeTypeData.valueVi
            let date = moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
            return `${ time } - ${ date }`
        }
        return ''
    }

    /** Ghép tên bác sĩ theo thứ tự Việt Nam: "Họ và tên" */
    buildDoctorName = (dataTime) => {
        if (dataTime && !_.isEmpty(dataTime)) {
            let name = `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}`
            return `${name}`
        }
        return ''
    }

    handleChangeSelect = async (selectedOption) => {
        this.setState({ selectedGender: selectedOption })
    }

    // Chọn kênh nhận xác nhận lịch khám (email hoặc zalo)
    handleSelectChannel = (channel) => {
        this.setState({ confirmChannel: channel })
    }

    /**
     * Xử lý khi khách bấm nút "Xác nhận" trên modal đặt lịch.
     *
     * Các bước:
     *  1. Kiểm tra dữ liệu bắt buộc (đã chọn giới tính; nếu chọn kênh Zalo thì phải có SĐT Zalo).
     *  2. Gom dữ liệu form + thông tin bác sĩ/khung giờ đã chọn thành payload.
     *  3. Gọi API POST /api/patient-book-appointment.
     *  4. Nếu thành công:
     *      - Kênh Zalo  -> mở link Zalo để khách nhận tin xác nhận.
     *      - Kênh Email -> báo khách kiểm tra hộp thư.
     */
    handleConfirmBooking = async () => {
        // Kiểm tra dữ liệu bắt buộc
        if (!this.state.selectedGender || !this.state.selectedGender.value) {
            toast.error('Vui lòng chọn giới tính!')
            return
        }
        if (this.state.confirmChannel === 'zalo' && !this.state.zaloPhone.trim()) {
            toast.error('Vui lòng nhập số điện thoại Zalo để nhận xác nhận!')
            return
        }

        let date = new Date(this.state.birthday).getTime()
        let timeString = this.buildTimeBooking(this.props.dataTime)
        let doctorName = this.buildDoctorName(this.props.dataTime)
        this.setState({
            isShowLoading: true
        })

        try {
            let res = await postPatientBookingService({
                fullName: this.state.fullName,
                phoneNumber: this.state.phoneNumber,
                email: this.state.email,
                address: this.state.address,
                reason: this.state.reason,
                date: this.props.dataTime.date,
                birthday: date,
                selectedGender: this.state.selectedGender.value,
                doctorId: this.state.doctorId,
                timeType: this.state.timeType,
                language: 'vi',
                timeString: timeString,
                doctorName: doctorName,
                // Kênh xác nhận khách hàng chọn
                confirmChannel: this.state.confirmChannel,
                contactPhone: this.state.confirmChannel === 'zalo'
                    ? this.state.zaloPhone
                    : this.state.phoneNumber
            })

            if (res && res.errCode === 0) {
                // Nếu chọn Zalo, mở link Zalo để khách nhận tin xác nhận
                if (res.confirmChannel === 'zalo' && res.zaloLink) {
                    window.open(res.zaloLink, '_blank')
                    toast.success('Đặt lịch thành công! Vui lòng xác nhận qua Zalo.')
                } else if (res.confirmChannel === 'email' && res.emailPending) {
                    // Lịch đã lưu, mail đang gửi nền — không bắt khách chờ SMTP.
                    toast.success('Đặt lịch thành công! Email xác nhận đang được gửi, vui lòng kiểm tra hộp thư.')
                } else if (res.confirmChannel === 'email' && res.emailSent === false) {
                    // Lịch đã lưu thành công nhưng KHÔNG gửi được mail -> phải báo rõ cho khách,
                    // tránh việc khách ngồi chờ mail mà không biết là mail đã lỗi.
                    toast.warn('Đặt lịch thành công nhưng CHƯA gửi được email xác nhận. '
                        + 'Vui lòng liên hệ hotline để được hỗ trợ.')
                } else {
                    toast.success('Đặt lịch thành công! Vui lòng kiểm tra email để xác nhận.')
                }

                this.props.closeBookingModal()
            } else {
                toast.error(res && res.errMessage ? res.errMessage : 'Booking a new appointment error!')
            }
        } catch (e) {
            // Trước đây không có catch: nếu API lỗi/timeout thì overlay Loading treo vĩnh viễn.
            toast.error('Không kết nối được máy chủ đặt lịch. Vui lòng kiểm tra mạng và thử lại.')
        } finally {
            this.setState({
                isShowLoading: false
            })
        }
    }

    render() {
        let { isOpenModal, closeBookingModal, dataTime } = this.props
        let doctorIdData = ''
        if (dataTime && !_.isEmpty(dataTime)) {
            doctorIdData = dataTime.doctorId
        }
        return (
            <LoadingOverlay
                    active={this.state.isShowLoading}
                    spinner
                    text='Loading...'
            >
                <Modal
                    isOpen={isOpenModal}
                    className={'booking-modal-container'}
                    size='lg'
                    centered
                >
                <div className='booking-modal-content'>
                    <div className='booking-modal-header'>
                        <span className='left'>{'Thông tin đặt lịch khám bệnh'}</span>
                        <span className='right'
                            onClick={closeBookingModal}
                        ><i className="fas fa-times"></i></span>
                    </div>
                    <div className='booking-modal-body'>
                        <div className='doctor-info'>
                            <ProfileDoctor
                                doctorId={doctorIdData}
                                isShowDescDoctor={false}
                                dataTime={dataTime}
                                isShowLinkDetail={false}
                                isShowPrice={true}
                            />
                        </div>
                        <div className='row'>
                            <div className='col-6 form-group'>
                                <label>{'Họ và tên'}</label>
                                <input className='form-control'
                                    value={this.state.fullName}
                                    onChange={(event) => this.handleOnChangeInput(event, 'fullName')}
                                />
                            </div>
                            <div className='col-6 form-group'>
                                <label>{'Số điện thoại'}</label>
                                <input className='form-control'
                                    value={this.state.phoneNumber}
                                    onChange={(event) => this.handleOnChangeInput(event, 'phoneNumber')}
                                />
                            </div>
                            <div className='col-6 form-group'>
                                <label>{'Địa chỉ email'}</label>
                                <input className='form-control'
                                    value={this.state.email}
                                    onChange={(event) => this.handleOnChangeInput(event, 'email')}
                                />
                            </div>
                            <div className='col-6 form-group'>
                                <label>{'Địa chỉ liên lạc'}</label>
                                <input className='form-control'
                                    value={this.state.address}
                                    onChange={(event) => this.handleOnChangeInput(event, 'address')}
                                />
                            </div>
                            <div className='col-12 form-group'>
                                <label>{'Lý do khám'}</label>
                                <input className='form-control'
                                    value={this.state.reason}
                                    onChange={(event) => this.handleOnChangeInput(event, 'reason')}
                                />
                            </div>
                            <div className='col-6 form-group'>
                                <label>{'Ngày sinh'}</label>
                                <DatePicker
                                    onChange={this.handleOnchangeDatePicker}
                                    className='form-control'
                                    value={this.state.birthday}
                                />
                            </div>
                            <div className='col-6 form-group'>
                                <label>{'Giới tính'}</label>
                                <Select
                                    value={this.state.selectedGender}
                                    onChange={this.handleChangeSelect}
                                    options={this.state.genders}
                                />
                            </div>

                            {/* Chọn kênh nhận xác nhận lịch khám */}
                            <div className='col-12 form-group confirm-channel-group'>
                                <label>
                                    {'Chọn kênh nhận xác nhận lịch khám'}
                                </label>
                                <div className='confirm-channel-options'>
                                    <div
                                        className={this.state.confirmChannel === 'email'
                                            ? 'channel-card active'
                                            : 'channel-card'}
                                        onClick={() => this.handleSelectChannel('email')}
                                    >
                                        <i className="fas fa-envelope"></i>
                                        <div className='channel-text'>
                                            <span className='channel-title'>
                                                {'Gửi về Email'}
                                            </span>
                                            <span className='channel-desc'>
                                                {'Nhận link xác nhận qua hộp thư email'}
                                            </span>
                                        </div>
                                        <span className='channel-check'><i className="fas fa-check"></i></span>
                                    </div>

                                    <div
                                        className={this.state.confirmChannel === 'zalo'
                                            ? 'channel-card active'
                                            : 'channel-card'}
                                        onClick={() => this.handleSelectChannel('zalo')}
                                    >
                                        <i className="fas fa-comment-dots"></i>
                                        <div className='channel-text'>
                                            <span className='channel-title'>
                                                {'Gửi về Zalo'}
                                            </span>
                                            <span className='channel-desc'>
                                                {'Nhận tin nhắn xác nhận qua Zalo'}
                                            </span>
                                        </div>
                                        <span className='channel-check'><i className="fas fa-check"></i></span>
                                    </div>
                                </div>
                            </div>

                            {/* Ô nhập số điện thoại Zalo: chỉ hiện khi chọn kênh Zalo */}
                            {this.state.confirmChannel === 'zalo' &&
                                <div className='col-12 form-group'>
                                    <label>
                                        {'Số điện thoại Zalo nhận xác nhận'}
                                    </label>
                                    <input className='form-control'
                                        placeholder='0987 654 321'
                                        value={this.state.zaloPhone}
                                        onChange={(event) => this.handleOnChangeInput(event, 'zaloPhone')}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                    <div className='booking-modal-footer'>
                        <button className='btn btn-primary btn-booking-confirm'
                            onClick={() => this.handleConfirmBooking()}
                        >{'Xác nhận'}
                        </button>
                        <button className='btn btn-danger btn-booking-cancel'
                            onClick={closeBookingModal}
                        >{'Hủy'}
                        </button>
                    </div>
                </div>
                </Modal>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {    
        genders: state.admin.genders,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getGenders: () => dispatch(actions.fetchGenderStart()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
