import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import { getAllHandbookService } from '../../../services/userService'
import './HandBook.scss'
import { withRouter } from 'react-router-dom';

class HandBook extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataHandbook: [],
            isLoading: true,
        }
    }

    async componentDidMount() {
        let res = await getAllHandbookService()
        if (res && res.errCode === 0) {
            this.setState({
                dataHandbook: res.data ? res.data : [],
                isLoading: false,
            })
        } else {
            this.setState({ isLoading: false })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    handleViewHandbook = (handbook) => {
        if (this.props.history) {
            this.props.history.push(`/detail-handbook/${handbook.id}`)
        }
    }

    handleViewAllHandbook = () => {
        if (this.props.history) {
            this.props.history.push(`/all-handbook`)
        }
    }

    render() {
        let { dataHandbook, isLoading } = this.state
        return (
            <div className='section-share section-handbook'>
                <div className='section-container'>
                    <div className='section-header'>
                        <span className='title-section'>{'Cẩm nang'}</span>
                        <button className='btn-section' onClick={() => this.handleViewAllHandbook()}>
                            {'Xem thêm bài viết'}
                        </button>
                    </div>
                    <div className='section-body'>
                        {/* Hiển thị khung xương khi đang tải dữ liệu */}
                        {isLoading === true ?
                            <div className='hc-section-skeleton'>
                                {[1, 2, 3, 4].map(item => (
                                    <div className='hc-skeleton-card' key={item}>
                                        <div className='hc-skeleton' style={{ height: '190px' }}></div>
                                        <div className='hc-skeleton' style={{ height: '16px', width: '90%' }}></div>
                                    </div>
                                ))}
                            </div>
                            :
                            <Slider {...this.props.settings}>
                                { dataHandbook && dataHandbook.length > 0 &&
                                    dataHandbook.map((item, index) => {
                                        return (
                                            <div className='section-customize handbook-child' key={index}
                                                onClick={() => this.handleViewHandbook(item)}
                                            >
                                                <div className='bg-image section-handbook'
                                                    style={{backgroundImage: `url(${item.image})`}}
                                                >
                                                    <span className='hc-card-overlay'>
                                                        <i className='fas fa-arrow-right'></i>
                                                    </span>
                                                </div>
                                                <div className='handbook-name'>
                                                    <p>{item.name}</p>
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
        // Chỗ chèn thêm dữ liệu
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HandBook));
