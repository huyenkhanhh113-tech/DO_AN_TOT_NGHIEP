import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorExtraInfo.scss'
import { getExtraInfoDoctorByIdService } from '../../../services/userService'
import NumberFormat from 'react-number-format';

class DoctorExtraInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isShowDetailInfo: false,
            extraInfo: {}
        }
    }

    async componentDidMount() {
        if (this.props.doctorIdFromParent) {
            let res = await getExtraInfoDoctorByIdService(this.props.doctorIdFromParent)
            if (res && res.errCode === 0) {
                this.setState({
                    extraInfo: res.data
                })
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        
        if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
            let res = await getExtraInfoDoctorByIdService(this.props.doctorIdFromParent)
            if (res && res.errCode === 0) {
                this.setState({
                    extraInfo: res.data
                })
            }
        }
    }

    showHideDetailInfo = (status) => {
        this.setState({
            isShowDetailInfo: status
        })
    }

    render() {
        let { isShowDetailInfo, extraInfo } = this.state
        return (
            <div className='doctor-extra-info-container'>
                <div className='content-up'>
                    <div className='text-address'>{'Địa chỉ khám'}</div>
                    <div className='name-clinic'>
                        {extraInfo && extraInfo.nameClinic ? extraInfo.nameClinic : ''}
                    </div>
                    <div className='detail-address'>
                        {extraInfo && extraInfo.addressClinic ? extraInfo.addressClinic : ''}
                    </div>
                </div>
                <div className='content-down'>
                    {isShowDetailInfo === false
                        ?
                        <div className='short-info'>
                            {'Giá khám: '}
                            {extraInfo && extraInfo.priceTypeData &&
                                <NumberFormat
                                    className='currency'
                                    value={ extraInfo.priceTypeData.valueVi }
                                    displayType='text'
                                    thousandSeparator={true}
                                    suffix='VNĐ'
                                />
                            }
                            <span className='detail' onClick={() => this.showHideDetailInfo(true)}>
                                {'Xem chi tiết'}
                            </span>
                        </div>
                        :
                        <>
                            <div className='title-price'>{'Giá khám: '}</div>
                            <div className='detail-info'>
                                <div className='price'>
                                    <span className='left'>{'Giá khám: '}</span>
                                    <span className='right'>
                                        {extraInfo && extraInfo.priceTypeData &&
                                            <NumberFormat
                                                className='currency'
                                                value={ extraInfo.priceTypeData.valueVi }
                                                displayType='text'
                                                thousandSeparator={true}
                                                suffix='VNĐ'
                                            />
                                        }
                                    </span>
                                </div>
                                <div className='note'>
                                    {extraInfo && extraInfo.note ? extraInfo.note : ''}
                                </div>
                            </div>
                            <div className='payment'>
                                {'Người bệnh có thể thanh toán chi phí bằng hình thức: '}
                                {extraInfo && extraInfo.paymentTypeData
                                    ? extraInfo.paymentTypeData.valueVi
                                    : ''}
                            </div>
                            <div className='hide-price'>
                                <span onClick={() => this.showHideDetailInfo(false)}>
                                {'Ẩn bảng giá'}
                                </span>
                            </div>
                        </>
                    }
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DoctorExtraInfo);
