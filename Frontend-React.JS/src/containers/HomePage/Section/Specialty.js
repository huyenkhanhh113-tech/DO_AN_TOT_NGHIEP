import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import { getAllSpecialtyService } from '../../../services/userService'
import './Specialty.scss'
import { withRouter } from 'react-router-dom';

class Specialty extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSpecialty: [],
            isLoading: true,
        }
    }

    async componentDidMount() {
        let res = await getAllSpecialtyService()
        if (res && res.errCode === 0) {
            this.setState({
                dataSpecialty: res.data ? res.data : [],
                isLoading: false,
            })
        } else {
            this.setState({ isLoading: false })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    handleViewSpecialty = (specialty) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${specialty.id}`)
        }
    }

    handleViewAllSpecialty = () => {
        if (this.props.history) {
            this.props.history.push(`/all-specialty`)
        }
    }

    render() {
        let { dataSpecialty, isLoading } = this.state
        return (
            <div className='section-share section-specialty'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>{'Chuyên khoa phổ biến'}</span>
                        <button className='btn-section' onClick={() => this.handleViewAllSpecialty()}>
                            {'Xem thêm'}
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
                                { dataSpecialty && dataSpecialty.length > 0 &&
                                    dataSpecialty.map((item, index) => {
                                        return (
                                            <div className='section-customize specialty-child' key={index}
                                                onClick={() => this.handleViewSpecialty(item)}
                                            >
                                                <div className='bg-image section-specialty'
                                                    style={{backgroundImage: `url(${item.image})`}}
                                                >
                                                    {/* Lớp phủ hiện khi hover */}
                                                    <span className='hc-card-overlay'>
                                                        <i className='fas fa-arrow-right'></i>
                                                    </span>
                                                </div>
                                                <div className='specialty-name'>{item.name}</div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Specialty));
