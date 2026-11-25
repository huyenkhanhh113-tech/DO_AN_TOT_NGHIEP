import React, { Component } from 'react';
import { connect } from "react-redux";
import './SearchSpecialty.scss'
import HomeHeader from '../../HomePage/HomeHeader';
import { fetchSearchSpecialty } from '../../../store/actions/adminActions';

class SearchSpecialty extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    async componentDidMount() {

    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    handleViewSpecialty = (specialty) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${specialty.id}`)
        }
    }

    handleOnKeyDown = async (event) => {
        if (event.key === 'Enter') {
            this.props.fetchSearchSpecialty(event.target.value)
        }
    }

    render() {
        let { dataSpecialty } = this.props

        return (
            <>
                <HomeHeader/>
                <div className='doctor-search-specialty-container'>
                    <div className='body-search-specialty'>
                        <div className='content-search-specialty'>
                            <div>{'Danh sách các chuyên khoa theo tên tìm kiếm'}</div>
                            <div className='search'>
                                <i className="fas fa-search"></i>
                                <input type='text' placeholder='Search ...' onKeyDown={(event) => this.handleOnKeyDown(event)}/>
                            </div>
                        </div>
                        {dataSpecialty && dataSpecialty.length > 0 ?
                            dataSpecialty.map((item, index) => {
                                    return (
                                        <div className='item-search-specialty' key={index}
                                            onClick={() => this.handleViewSpecialty(item)}
                                        >
                                            <div className='left-search-specialty'
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            >
                                            </div>
                                            <div className='right-search-specialty'>
                                                {item.name}
                                            </div>
                                        </div>
                                    )
                            })
                            :
                            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: '600', color: '#666', padding: '30px' }}>
                                {'Không có dữ liệu chuyên khoa!'}
                            </div>
                        }
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {    
        dataSpecialty: state.admin.dataSpecialty
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchSearchSpecialty: (nameInput) => dispatch(fetchSearchSpecialty(nameInput))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchSpecialty);
