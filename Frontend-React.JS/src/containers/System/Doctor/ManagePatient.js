import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManagePatient.scss'
import DatePicker from '../../../components/Input/DatePicker'
import { getListPatientForDoctorService, sendRemedyService, getAllCodeService, cancelPatientService } from '../../../services/userService';
import moment from 'moment';
import RemedyModal from './RemedyModal';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

class ManagePatient extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentDate: moment(new Date()).startOf('day').valueOf(),
            dataPatient: [],
            isOpenRemedyModal: false,
            dataModal: {},
            isShowLoading: false,
            listStatus: []
        }
    }

    async componentDidMount() {
        await this.getDataPatient()
    }

    getDataPatient = async () => {
        let { user } = this.props
        let { currentDate } = this.state
        let formatedDate = new Date(currentDate).getTime()
        let res = await getListPatientForDoctorService({
            doctorId: user.id,
            date: formatedDate,
            statusId: 'ALL'
        })

        let resStatus = await getAllCodeService('STATUS')

            if (res && res.errCode === 0 && resStatus && resStatus.errCode === 0) {

                let dataStatus = resStatus.data

                if (dataStatus && dataStatus.length > 0) {
                    dataStatus.unshift({
                        createdAt: null,
                        keyMap: 'ALL',
                        type: "STATUS",
                        valueEn: "All",
                        valueVi: 'Tất cả'
                    })
                }

                this.setState({
                    dataPatient: res.data,
                    listStatus: dataStatus ? dataStatus : []
                })
            }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0],
        },async () => {
            await this.getDataPatient()
        })
    }

    handleBtnConfirm = (item) => {
        let data = {
            doctorId: item.doctorId,
            patientId: item.patientId,
            patientEmail: item.patientData.email,
            patientName: item.patientData.firstName,
            timeType: item.timeType
        }
        this.setState({
            isOpenRemedyModal: true,
            dataModal: data
        })
    }

    handleBtnCancel = async (item) => {
        let res = await cancelPatientService({
            doctorId: item.doctorId,
            patientId: item.patientId,
        })
        if (res && res.errCode === 0) {
            toast.success('Đã huỷ lịch hẹn!')
            await this.getDataPatient()
        } else {
            toast.error('Huỷ lịch hẹn thất bại!')
        }
    }

    closeRemedyModal = () => {
        this.setState({
            isOpenRemedyModal: false,
            dataModal: {}
        })
    }

    sendRemedy = async (dataChild) => {
        let { dataModal } = this.state
        this.setState({
            isShowLoading: true
        })

        let res = await sendRemedyService({
            email: dataChild.email,
            // Gửi mảng ảnh (nhiều ảnh) + nội dung nhận xét/dặn dò của bác sĩ.
            imageBase64Array: dataChild.imagesBase64,
            doctorNote: dataChild.doctorNote,
            doctorId: dataModal.doctorId,
            patientId: dataModal.patientId,
            timeType: dataModal.timeType,
            language: 'vi',
            patientName: dataModal.patientName
        })
        if (res && res.errCode === 0) {
            this.setState({
                isShowLoading: false
            })
            toast.success('Đã gửi kết quả khám và hoá đơn cho bệnh nhân!')
            this.closeRemedyModal()
            await this.getDataPatient()
        } else {
            this.setState({
                isShowLoading: false
            })
            // Hiển thị lỗi cụ thể từ server (ví dụ: không gửi được email) thay vì thông báo chung
            toast.error(res && res.errMessage ? res.errMessage : 'Gửi kết quả khám thất bại!')
        }
    }

    handleOnChangeSelect = async (event) => {
        let { user } = this.props
        let { currentDate } = this.state
        let formatedDate = new Date(currentDate).getTime()
        let res = await getListPatientForDoctorService({
                doctorId: user.id,
                date: formatedDate,
                statusId: event.target.value
            })
            
        if (res && res.errCode === 0) {
            let data = res.data
            this.setState({
                dataPatient: data
            })
        }
    }

    render() {
        let { dataPatient, isOpenRemedyModal, dataModal, listStatus } = this.state
        return (
            <>
                <LoadingOverlay
                    active={this.state.isShowLoading}
                    spinner
                    text='Loading...'
                >
                    <div className='manage-patient-container'>
                        <div className='m-p-title'>
                            {'Quản lý bệnh nhân khám bệnh'}
                        </div>
                        <div className='manage-patient-body row'>
                            <div className='col-4 form-group'>
                                <label>{'Chọn ngày khám'}</label>
                                <DatePicker 
                                    onChange={this.handleOnchangeDatePicker}
                                    className='form-control'
                                    value={this.state.currentDate}
                                />
                            </div>
                            <div className='col-2 form-group select-cus'>
                                <label>{'Chọn trạng thái'}</label>
                                <select onChange={(event) => this.handleOnChangeSelect(event)}>
                                    { listStatus && listStatus.length > 0 &&
                                        listStatus.map((item, index) => {
                                            return (
                                                <option key={index} value={item.keyMap}>
                                                    {item.valueVi}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                            <div className='col-12 table-manage-patient'>
                                <table id="customers">
                                    <tbody>
                                        <tr>
                                            <th>{'STT'}</th>
                                            <th>Email</th>
                                            <th>{'Thời gian'}</th>
                                            <th>{'Họ tên'}</th>
                                            <th>{'Giới tính'}</th>
                                            <th>{'Địa chỉ'}</th>
                                            <th>{'Trạng thái'}</th>
                                            <th>{'Hành động'}</th>
                                        </tr>
                                        { dataPatient && dataPatient.length > 0 ? 
                                            dataPatient.map((item, index) => {
                                                let time = item.timeTypeDataPatient.valueVi
                                                let gender = item.patientData.genderData.valueVi
                                                let statusCheck = item.statusTypeDataPatient.valueVi
                                                return (
                                                    <tr key={index}>
                                                        <td>{ index + 1 }</td>
                                                        <td>{ item.patientData.email}</td>
                                                        <td>{ time }</td>
                                                        <td>{ item.patientData.firstName}</td>
                                                        <td>{ gender }</td>
                                                        <td>{item.patientData.address}</td>
                                                        <td>{ statusCheck }</td>
                                                        <td>
                                                            { item.statusId && item.statusId === 'S1'  &&
                                                                <button
                                                                    className='btn btn-danger ml-3'
                                                                    onClick={() => this.handleBtnCancel(item)}
                                                                >{'Hủy'}
                                                                </button>
                                                            }
                                                            { item.statusId && item.statusId === 'S2'  &&
                                                                <button
                                                                    className='btn btn-info ml-3'
                                                                    onClick={() => this.handleBtnConfirm(item)}
                                                                >{'Xác nhận'}
                                                                </button>
                                                            }
                                                            { item.statusId && item.statusId === 'S3'  &&
                                                                <div className='row-text'>{'Đã gửi phiếu khám'}</div>
                                                            }
                                                            { item.statusId && item.statusId === 'S4'  &&
                                                                <div className='row-text'>{'Lịch hẹn đã hủy'}</div>
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            })

                                            : <tr></tr>
                                        }
                                    </tbody>    
                                </table>
                            </div>
                        </div>
                    </div>
                    <RemedyModal
                        isOpenRemedyModal={isOpenRemedyModal}
                        dataModal={dataModal}
                        closeRemedyModal={this.closeRemedyModal}
                        sendRemedy={this.sendRemedy}
                    />
                </LoadingOverlay>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {    
        user: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePatient);
