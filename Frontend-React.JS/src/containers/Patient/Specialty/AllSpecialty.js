import React, { Component } from 'react';
import { connect } from "react-redux";
import './AllSpecialty.scss'
import HomeHeader from '../../HomePage/HomeHeader';
import { getAllSpecialtyService } from '../../../services/userService'

class AllSpecialty extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSpecialty: [],
        }
    }

    async componentDidMount() {
        let res = await getAllSpecialtyService()
        if (res && res.errCode === 0) {
            this.setState({
                dataSpecialty: res.data ? res.data : []
            })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    handleViewSpecialty = (specialty) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${specialty.id}`)
        }
    }

    render() {
        let { dataSpecialty } = this.state
        return (
            <>
                <HomeHeader/>
                <div className='doctor-all-specialty-container'>
                    <div className='body-all-specialty'>
                        <div className='content-all-specialty'>
                            {'Danh sách các chuyên khoa phổ biến'}
                        </div>
                        {dataSpecialty && dataSpecialty.length > 0 &&
                                dataSpecialty.map((item, index) => {
                                    return (
                                        <div className='item-all-specialty' key={index}
                                            onClick={() => this.handleViewSpecialty(item)}
                                        >
                                            <div className='left-all-specialty'
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            >
                                            </div>
                                            <div className='right-all-specialty'>
                                                {item.name}
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
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AllSpecialty);
