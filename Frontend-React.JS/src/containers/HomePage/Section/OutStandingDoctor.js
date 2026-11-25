import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import * as actions from '../../../store/actions'
import { withRouter } from 'react-router-dom';
import './OutStandingDoctor.scss'

class OutStandingDoctor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arrDoctors: [],
            isLoading: true,
        }
    }

    componentDidUpdate(prevProps, prevState, snaptshot) {
        if (prevProps.topDoctorsRedux !== this.props.topDoctorsRedux) {
            this.setState({
                arrDoctors: this.props.topDoctorsRedux,
                isLoading: false,
            })
        }
    }

    async componentDidMount() {
        // Chờ lấy xong danh sách bác sĩ rồi tắt khung xương
        await this.props.loadTopDoctors()
        this.setState({ isLoading: false })
    }

    handleViewDetailDoctor = (doctor) => {
        if (this.props.history) {
            this.props.history.push(`/detail-doctor/${doctor.id}`)
        }
    }

    handleViewAllDoctor = () => {
        if (this.props.history) {
            this.props.history.push(`/all-doctor`)
        }
    }

    render() {
        let arrDoctors = this.state.arrDoctors
        let isLoadingState = this.state.isLoading
        return (
            <div className='section-share section-outstanding-doctor'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>{'Bác sĩ nổi bật tuần qua'}</span>
                        <button className='btn-section' onClick={() => this.handleViewAllDoctor()}>
                            {'Xem thêm'}
                        </button>
                    </div>
                    <div className='section-body'>
                        {/* Hiển thị khung xương khi đang tải dữ liệu */}
                        {isLoadingState === true && (!arrDoctors || arrDoctors.length === 0) ?
                            <div className='hc-section-skeleton'>
                                {[1, 2, 3, 4].map(item => (
                                    <div className='hc-skeleton-card' key={item}>
                                        <div className='hc-skeleton' style={{ height: '128px', width: '128px', borderRadius: '50%', margin: '0 auto 14px' }}></div>
                                        <div className='hc-skeleton' style={{ height: '16px', width: '80%', margin: '0 auto 10px' }}></div>
                                        <div className='hc-skeleton' style={{ height: '14px', width: '55%', margin: '0 auto' }}></div>
                                    </div>
                                ))}
                            </div>
                            :
                            <Slider {...this.props.settings}>
                                {arrDoctors && arrDoctors.length > 0
                                    && arrDoctors.map((item, index) => {
                                        // Backend trả về ảnh dạng data-URI nên dùng trực tiếp
                                        let imgSrc = item.image ? item.image : ''

                                        let nameVi = `${item.positionData.valueVi}, ${item.lastName} ${item.firstName}`

                                        return (
                                            <div className='section-customize'
                                                key={index}
                                                onClick={() => this.handleViewDetailDoctor(item)}
                                            >
                                                <div className='customize-border'>
                                                    <div className='outer-bg'>
                                                        <div className='bg-image section-outstanding-doctor'
                                                            style={{backgroundImage: `url(${imgSrc})`}}
                                                        />
                                                    </div>
                                                    <div className='position text-center name-dortor'>
                                                        <div>{nameVi}</div>
                                                        <div><b>{ item.Doctor_Info.Specialty.name }</b></div>
                                                    </div>
                                                </div>

                                            </div>
                                        )
                                    })
                                }
                            </Slider>
                        }
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        topDoctorsRedux: state.admin.topDoctors,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadTopDoctors: () => dispatch(actions.fetchTopDoctor()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OutStandingDoctor));
