import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import { getAllClinicService } from '../../../services/userService'
import { withRouter } from 'react-router-dom';
import './MedicalFacility.scss'

class MedicalFacility extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataClinics: [],
            isLoading: true,
        }
    }

    async componentDidMount() {
        let res = await getAllClinicService()
        if (res && res.errCode === 0) {
            this.setState({
                dataClinics: res.data ? res.data : [],
                isLoading: false,
            })
        } else {
            this.setState({ isLoading: false })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
            }

    handleViewClinic = (clinic) => {
        if (this.props.history) {
            this.props.history.push(`/detail-clinic/${clinic.id}`)
        }
    }

    handleViewAllClinic = () => {
        if (this.props.history) {
            this.props.history.push(`/all-clinic`)
        }
    }


    render() {
        let { dataClinics, isLoading } = this.state
        return (
            <div className='section-share section-medical-facility'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>{'Cơ sở y tế nổi bật'}</span>
                        <button className='btn-section' onClick={() => this.handleViewAllClinic()}
                        >{'Xem thêm'}
                        </button>
                    </div>
                    <div className='section-body'>
                        {/* Hiển thị khung xương khi đang tải dữ liệu */}
                        {isLoading === true ?
                            <div className='hc-section-skeleton'>
                                {[1, 2, 3, 4].map(item => (
                                    <div className='hc-skeleton-card' key={item}>
                                        <div className='hc-skeleton' style={{ height: '200px' }}></div>
                                        <div className='hc-skeleton' style={{ height: '16px', width: '70%' }}></div>
                                    </div>
                                ))}
                            </div>
                            :
                            <Slider {...this.props.settings}>
                                {dataClinics && dataClinics.length > 0 &&
                                    dataClinics.map((item, index) => {
                                        return (
                                            <div className='section-customize' key={index}
                                                onClick={() => this.handleViewClinic(item)}
                                            >
                                                <div className='bg-image section-medical-facility'
                                                    style={{backgroundImage: `url(${item.image})`}}
                                                >
                                                    <span className='hc-card-overlay'>
                                                        <i className='fas fa-arrow-right'></i>
                                                    </span>
                                                </div>
                                                <div className='name-medical'>{item.name}</div>
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
        // Chỗ chèn thêm dữ liệu
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MedicalFacility));
