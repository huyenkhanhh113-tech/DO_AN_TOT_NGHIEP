import React, { Component } from 'react';
import { connect } from "react-redux";
import './DetailClinic.scss'
import HomeHeader from '../../HomePage/HomeHeader';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfo from '../Doctor/DoctorExtraInfo';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import { getDetailClinicByIdService } from '../../../services/userService'
import _ from 'lodash';

class DetailClinic extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arrDoctorId: [],
            dataDetailClinic: {},
        }
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id

            let res = await getDetailClinicByIdService({
                id: id,
            })

            
            if (res && res.errCode === 0) {
                let data = res.data
                let arrDoctorId = []

                if (data && !_.isEmpty(res.data)) {
                    let arr = data.doctorClinic
                    if (arr && arr.length > 0) {
                        arr.forEach(item => {
                            arrDoctorId.push(item.doctorId)
                        })  
                    }
                }

                this.setState({
                    dataDetailClinic: res.data,
                    arrDoctorId: arrDoctorId,
                })
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
            }

    render() {
        let { arrDoctorId, dataDetailClinic } = this.state
        return (
            <div className='detail-clinic-container'>
                <HomeHeader />
                <div className='desc-clinic'>
                        {dataDetailClinic && !_.isEmpty(dataDetailClinic) &&
                            <>
                                <div className='content-clinic'>
                                    <div className='content-head'>
                                        <div className='name-head'>{dataDetailClinic.name}</div>
                                        <div className='address-head'>{dataDetailClinic.address}</div>
                                    </div>
                                    <div dangerouslySetInnerHTML={{ __html: dataDetailClinic.descriptionHTML }}></div>
                                </div>
                            </>
                        }
                </div>
                <div className='detail-clinic-body'>
                    { arrDoctorId && arrDoctorId.length > 0 &&
                        arrDoctorId.map((item, index) => {
                            return (
                                <div className='each-doctor' key={index}>
                                    <div className='dt-content-left'>
                                        <div className='profile-doctor'>
                                            <ProfileDoctor
                                                doctorId={item}
                                                isShowDescDoctor={true}
                                                isShowLinkDetail={true}
                                                isShowPrice={false}
                                            />
                                        </div>
                                    </div>
                                    <div className='dt-content-right'>
                                        <div className='doctor-schedule'>
                                            <DoctorSchedule
                                                doctorIdFromParent={item} 
                                            />
                                        </div>
                                        <div className='doctor-extra-info'>
                                            <DoctorExtraInfo
                                                doctorIdFromParent={item}   
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailClinic);
