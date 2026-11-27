import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSchedule.scss'
import Select from 'react-select';
import { saveScheduleDoctorsService, getBookedScheduleByDoctorDateService } from '../../../services/userService';
import * as actions from '../../../store/actions'
import DatePicker from '../../../components/Input/DatePicker'
import { toast } from 'react-toastify';
import _ from 'lodash';
import moment from 'moment';


class ManageSchedule extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listDoctors: [],
            selectedDoctor: {},
            currentDate: '',
            rangeTime: [],
            // Danh sách timeType đã có lịch (đã lưu) trong ngày đang chọn
            bookedTimeTypes: [],
            isShowBookedOnly: false,
        }
    }

    componentDidMount() {
        this.props.fetchGetAllDoctors()
        this.props.fetchGetAllScheduleTime()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allDoctors !== this.props.allDoctors) {
            let dataSelect = this.buildDataInputSelect(this.props.allDoctors)
            this.setState({
                listDoctors: dataSelect
            })
        }
        if (prevProps.allSchedule !== this.props.allSchedule) {
            let data = this.props.allSchedule
            if (data && data.length > 0) {
                data = data.map(item => ({ ...item, isSelected: false }))
            }

            this.setState({
                rangeTime: data
            })
        }

        // Khi đổi bác sĩ hoặc đổi ngày -> tải lại danh sách khung giờ đã có lịch
        if (prevState.selectedDoctor !== this.state.selectedDoctor ||
            prevState.currentDate !== this.state.currentDate) {
            this.loadBookedTimeTypes()
        }
    }

    buildDataInputSelect = (inputData) => {
        let res = []
        if (inputData && inputData.length > 0) {
            inputData.forEach(item => {
                let object = {}
                let labelVi = `${item.lastName} ${item.firstName}`
                object.label = labelVi
                object.value = item.id
                res.push(object)
            })
        }
        return res
    }

    /**
     * Tải danh sách khung giờ ĐÃ CÓ LỊCH của bác sĩ trong ngày đang chọn.
     * Dữ liệu đọc trực tiếp từ bảng Schedule nên luôn đồng bộ giữa
     * tài khoản admin và tài khoản bác sĩ.
     */
    loadBookedTimeTypes = async () => {
        let { selectedDoctor, currentDate } = this.state

        if (!selectedDoctor || _.isEmpty(selectedDoctor) || !currentDate) {
            this.setState({ bookedTimeTypes: [] })
            return
        }

        let dateNumber = new Date(currentDate).getTime()

        let res = await getBookedScheduleByDoctorDateService(selectedDoctor.value, dateNumber)
        if (res && res.errCode === 0) {
            this.setState({
                bookedTimeTypes: res.bookedTimeTypes && res.bookedTimeTypes.length > 0
                    ? res.bookedTimeTypes
                    : []
            })
        } else {
            this.setState({ bookedTimeTypes: [] })
        }
    }

    handleChangeSelect = async (selectedOption) => {
        this.setState({ selectedDoctor: selectedOption })
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        })
    }

    handleClickBtnTime = (time) => {
        let { rangeTime } = this.state
        if (rangeTime && rangeTime.length > 0) {
            rangeTime = rangeTime.map(item => {
                if (item.id === time.id) item.isSelected = !item.isSelected
                return item
            })
            this.setState({
                rangeTime: rangeTime
            })
        }
    }

    // Bật/tắt chế độ chỉ xem các khung giờ đã có lịch
    toggleShowBookedOnly = () => {
        this.setState({
            isShowBookedOnly: !this.state.isShowBookedOnly
        })
    }

    // Gỡ chọn tất cả các khung giờ đang được chọn
    clearSelectedTime = () => {
        let { rangeTime } = this.state
        if (rangeTime && rangeTime.length > 0) {
            rangeTime = rangeTime.map(item => ({ ...item, isSelected: false }))
            this.setState({ rangeTime: rangeTime })
        }
    }

    handleSaveSchedule = async () => {
        let { rangeTime, selectedDoctor, currentDate } = this.state
        let res = []
        if (!currentDate) {
            toast.error("Vui lòng chọn ngày khám!")
            return
        }
        if (selectedDoctor && _.isEmpty(selectedDoctor)) {
            toast.error("Vui lòng chọn bác sĩ!")
            return
        }

        let formatedDate = new Date(currentDate).getTime()

        if (rangeTime && rangeTime.length > 0) {
            let selectedTime = rangeTime.filter(item => item.isSelected === true)
            if (selectedTime && selectedTime.length > 0) {
                selectedTime.forEach(schedule => {
                    let obj = {}
                    obj.doctorId = selectedDoctor.value
                    obj.date = formatedDate
                    obj.timeType = schedule.keyMap
                    res.push(obj)
                })
            } else {
                toast.error("Vui lòng chọn ít nhất một khung giờ!")
                return
            }
        }

        let resultData = await saveScheduleDoctorsService({
            arrSchedule: res,
            doctorId: selectedDoctor.value,
            formatedDate: formatedDate
        })
        if (resultData && resultData.errCode === 0) {
            toast.success("Lưu kế hoạch khám bệnh thành công!")
            // Sau khi lưu, nạp lại các khung giờ đã có lịch để tô nền xanh
            this.setState({
                rangeTime: rangeTime.map(item => ({ ...item, isSelected: false }))
            }, () => this.loadBookedTimeTypes())
        } else {
            toast.error("Lưu kế hoạch khám bệnh thất bại!")
        }
    }

    render() {
        let { rangeTime, bookedTimeTypes, isShowBookedOnly } = this.state
        let yesterday = new Date(new Date().setDate(new Date().getDate()-1));

        // Lọc danh sách khung giờ hiển thị theo chế độ "chỉ xem đã đặt"
        let displayRangeTime = rangeTime && rangeTime.length > 0 ? rangeTime : []
        if (isShowBookedOnly) {
            displayRangeTime = displayRangeTime.filter(item => bookedTimeTypes.includes(item.keyMap))
        }

        return (
            <div className='manage-schedule-container'>
                <div className='m-s-title'>
                    {'Quản lý kế hoạch khám bệnh của bác sĩ'}
                </div>
                <div className='container'>
                    <div className='row'>
                        <div className='col-6 form-group'>
                            <label>{'Chọn bác sĩ'}</label>
                            <Select
                                value={this.state.selectedDoctor}
                                onChange={this.handleChangeSelect}
                                options={this.state.listDoctors}
                                placeholder="Chọn bác sĩ..."
                            />
                        </div>
                        <div className='col-6 form-group'>
                            <label>{'Chọn ngày'}</label>
                            <DatePicker 
                                onChange={this.handleOnchangeDatePicker}
                                className='form-control'
                                value={this.state.currentDate}
                                minDate={yesterday}
                            />
                        </div>

                        {/* Chú thích màu + bộ lọc */}
                        <div className='col-12 schedule-legend'>
                            <div className='legend-items'>
                                <span className='legend-item'>
                                    <span className='dot dot-booked'></span>
                                    {'Đã có lịch khám'}
                                </span>
                                <span className='legend-item'>
                                    <span className='dot dot-free'></span>
                                    {'Chưa được chọn'}
                                </span>
                                <span className='legend-item'>
                                    <span className='dot dot-selected'></span>
                                    {'Đang chọn để lưu'}
                                </span>
                            </div>
                            <button
                                type='button'
                                className={isShowBookedOnly
                                    ? 'btn btn-filter-booked active'
                                    : 'btn btn-filter-booked'}
                                onClick={this.toggleShowBookedOnly}
                            >
                                <i className="fas fa-filter"></i>
                                {'Chỉ hiện khung giờ đã đặt'}
                            </button>
                        </div>

                        <div className='col-12 pick-hour-container'>
                            {displayRangeTime && displayRangeTime.length > 0 &&
                                displayRangeTime.map((item, index) => {
                                    // Khung giờ đã có lịch (đã lưu) -> nền xanh
                                    let isBooked = bookedTimeTypes.includes(item.keyMap)
                                    let isSelected = item.isSelected === true
                                    let className = 'btn btn-schedule'
                                    if (isSelected) {
                                        className += ' selected'
                                    } else if (isBooked) {
                                        className += ' booked'
                                    }
                                    return (
                                        <button className={className}
                                            key={index}
                                            onClick={() => this.handleClickBtnTime(item)}
                                            title={isBooked
                                                ? 'Khung giờ này đã có lịch khám'
                                                : 'Khung giờ này chưa được chọn'}
                                        >
                                            {item.valueVi}
                                            {isBooked &&
                                                <span className='booked-mark'>
                                                    <i className="fas fa-check-circle"></i>
                                                </span>
                                            }
                                        </button>
                                    )
                                })
                            }
                            {displayRangeTime.length === 0 &&
                                <div className='empty-schedule-note'>
                                    {'Không có khung giờ nào phù hợp với bộ lọc hiện tại.'}
                                </div>
                            }
                        </div>

                        <div className='col-12 schedule-summary'>
                            {this.state.selectedDoctor && !_.isEmpty(this.state.selectedDoctor) &&
                                this.state.currentDate &&
                                <span className='summary-text'>
                                    <i className="fas fa-calendar-check"></i>
                                    {`Đã có ${bookedTimeTypes.length} khung giờ được chọn cho `}
                                    <b>{this.state.selectedDoctor.label}</b>
                                    {' - '}
                                    <b>{moment(new Date(this.state.currentDate)).format('DD/MM/YYYY')}</b>
                                </span>
                            }
                        </div>

                        <div className='col-12 action-buttons'>
                            <button className='btn btn-primary my-3'
                                onClick={() => this.handleSaveSchedule()}
                            >
                                {'Lưu thông tin'}
                            </button>
                            <button className='btn btn-outline-secondary my-3'
                                onClick={() => this.clearSelectedTime()}
                            >
                                {'Bỏ chọn'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        allDoctors: state.admin.allDoctors,
        allSchedule: state.admin.allSchedule,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchGetAllDoctors: () => dispatch(actions.fetchGetAllDoctors()),
        fetchGetAllScheduleTime: () => dispatch(actions.fetchGetAllScheduleTime()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
