import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorSchedule.scss'
import { getScheduleDoctorByDateService } from '../../../services/userService'
import moment from 'moment';
import BookingModal from './Modal/BookingModal';

class DoctorSchedule extends Component {
    constructor(props) {
        super(props)
        this.state = {
            allDays: [],
            allAvailableTime: [],
            isOpenModalBooking: false,
            dataScheduleTimeModal: {},
        }
    }

    async componentDidMount() {
        let allDays = this.getArrDays()
        this.setState({
            allDays: allDays,
        })
        if (this.props.doctorIdFromParent) {

            let res = await getScheduleDoctorByDateService(this.props.doctorIdFromParent, allDays[0].value)
            this.setState({
                allAvailableTime: res.data ? res.data : []
            })
        }
    }

    async componentDidUpdate(prevProps, prevState) {
                if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
            let allDays = this.getArrDays()
            let res = await getScheduleDoctorByDateService(this.props.doctorIdFromParent, allDays[0].value)
            this.setState({
                allAvailableTime: res.data ? res.data : []
            })
        }
    }

    /** Tạo mảng 7 ngày kế tiếp (bắt đầu từ hôm nay) để hiển thị thanh chọn ngày */
    getArrDays = () => {
        let arrDays = []
            for (let i = 0; i < 7; i++){
                let object = {}
                if (i === 0) {
                    let labelViNew = moment(new Date()).format('DD/MM')
                    let today = `Hôm nay - ${labelViNew}`
                    object.label = today
                }
                else {
                    let labelVi = moment(new Date()).add(i, 'days').format('dddd - DD/MM') 
                    object.label = this.capitalizeFirstLetter(labelVi)
                }

                object.value = moment(new Date()).add(i, 'days').startOf('day').valueOf()
                arrDays.push(object)
        }
        return arrDays
    }

    handleOnchangeSelect = async (event) => {
        if (this.props.doctorIdFromParent && this.props.doctorIdFromParent !== -1) {
            let doctorId = this.props.doctorIdFromParent
            let date = event.target.value
            let res = await getScheduleDoctorByDateService(doctorId, date)

            if (res && res.errCode === 0) {
                this.setState({
                   allAvailableTime: res.data ? res.data : []
               })
            }
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    handleClickScheduleTime = (time) => {
        this.setState({
            isOpenModalBooking: true,
            dataScheduleTimeModal: time
        })
    }

    closeBookingModal = () => {
        this.setState({
            isOpenModalBooking: false
        })
    }

    render() {
        let { allDays, allAvailableTime, isOpenModalBooking, dataScheduleTimeModal } = this.state
        
        return (
            <>
                <div className='doctor-schedule-container'>
                    <div className='all-schedule'>
                        <select onChange={(event) => this.handleOnchangeSelect(event)}>
                            {allDays && allDays.length > 0 && 
                                allDays.map((item, index) => {
                                    return <option key={index} value={item.value}>{item.label}</option>
                                })
                            }
                        </select>
                    </div>
                    <div className='all-available-time'>
                        <div className='text-calendar'>
                            <i className="far fa-calendar"><span>{'Lịch khám'}</span></i>
                        </div>
                        <div className='time-content'>
                            {allAvailableTime && allAvailableTime.length > 0 ? 
                                <>
                                    <div className='time-content-btns'>
                                        {allAvailableTime.map((item, index) => {
                                            let timeDisplay = item.timeTypeData.valueVi
                                            return (
                                                <button key={index}
                                                    className={'btn-vi'}
                                                    onClick={() => this.handleClickScheduleTime(item)}
                                                >{timeDisplay}</button>
                                            )
                                        })}
                                    </div>
                                    <div className='book-free'>
                                        <span>{'Chọn'} <i class="far fa-hand-point-up"></i> {'và đặt (miễn phí)'}</span>
                                    </div>
                                </>
                                :
                                <div className='no-schedule'>{'Không có lịch khám trong thời gian này, vui lòng chọn thời gian khác!'}</div>
                                
                            }
                        </div>
                    </div>
                </div>
                <BookingModal
                    isOpenModal={isOpenModalBooking}
                    closeBookingModal={this.closeBookingModal} 
                    dataTime={dataScheduleTimeModal}
                />
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

export default connect(mapStateToProps, mapDispatchToProps)(DoctorSchedule);
