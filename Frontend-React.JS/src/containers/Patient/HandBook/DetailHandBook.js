import React, { Component } from 'react';
import { connect } from "react-redux";
import './DetailHandBook.scss'
import HomeHeader from '../../HomePage/HomeHeader';
import {getDetailHandbookByIdService} from '../../../services/userService'
import _ from 'lodash';

class DetailHandBook extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataDetailHandbook: {},
        }
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id

            let res = await getDetailHandbookByIdService({
                id: id,
            })
       
            if (res && res.errCode === 0) {
                let data = res.data

                this.setState({
                    dataDetailHandbook: data,
                })
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
            }

    render() {
        let { dataDetailHandbook } = this.state
        return (
            <div className='detail-handbook-container'>
                <HomeHeader />
                <div className='desc-handbook'>
                        {dataDetailHandbook && !_.isEmpty(dataDetailHandbook) &&
                            <>
                                <div className='content-handbook'>
                                    <div className='content-head'>
                                        <div className='name-head'>{dataDetailHandbook.name}</div>
                                    </div>
                                    <div dangerouslySetInnerHTML={{ __html: dataDetailHandbook.descriptionHTML }}></div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailHandBook);
