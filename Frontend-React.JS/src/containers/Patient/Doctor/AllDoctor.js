import React, { Component } from 'react';
import { connect } from "react-redux";
import './AllDoctor.scss'
import HomeHeader from '../../HomePage/HomeHeader';
import * as actions from '../../../store/actions'

class AllDoctor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            arrDoctors: [],
        }
    }

    componentDidUpdate(prevProps, prevState, snaptshot) {
        if (prevProps.topDoctorsRedux !== this.props.topDoctorsRedux) {
            this.setState({
                arrDoctors: this.props.topDoctorsRedux
            })
        }
    }

    componentDidMount() {
        this.props.loadTopDoctors()
    }

    handleViewDetailDoctor = (doctor) => {
        if (this.props.history) {
            this.props.history.push(`/detail-doctor/${doctor.id}`)
        }
    }

    render() {
        let { arrDoctors } = this.state
        return (
            <>
                <HomeHeader/>
                <div className='doctor-all-doctor-container'>
                    <div className='body-all-doctor'>
                        <div className='content-all-doctor'>
                            {'Danh sách bác sĩ nổi bật'}
                        </div>
                        {arrDoctors && arrDoctors.length > 0 &&
                                arrDoctors.map((item, index) => {
                                    // Backend trả về ảnh dạng data-URI nên dùng trực tiếp
                                    let imgSrc = item.image ? item.image : ''

                                    let nameVi = `${item.positionData.valueVi}, ${item.lastName} ${item.firstName}`

                                    return (
                                        <div className='item-all-doctor' key={index}
                                            onClick={() => this.handleViewDetailDoctor(item)}
                                        >
                                            <div className='left-all-doctor'
                                                style={{ backgroundImage: `url(${imgSrc})` }}
                                            >
                                            </div>
                                            <div className='right-all-doctor'>
                                                <div className='doctor-name'>{nameVi}</div>
                                                <div className='doctor-specialty'>{item.Doctor_Info.Specialty.name}</div>
                                                <div className='doctor-clinic'>{item.Doctor_Info.nameClinic}</div>
                                            </div>
                                            <i className='fas fa-chevron-right arrow-right'></i>
                                        </div>
                                    )
                                })
                            }
                    </div>
                </div>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(AllDoctor);
