import React, { Component } from 'react';
import { connect } from "react-redux";
import { postVerifyBookingService } from '../../services/userService'
import HomeHeader from '../HomePage/HomeHeader';
import "./VerifyEmail.scss"

class VerifyEmail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            statusVerify: false,
            errCode: 0
        }
    }

    async componentDidMount() {
        if (this.props.location !== this.props.location.search) {
            let urlParams = new URLSearchParams(this.props.location.search)
            let token = urlParams.get('token')
            let doctorId = urlParams.get('doctorId')
            let res = await postVerifyBookingService({
                token: token,
                doctorId: doctorId
            })
            if (res && res.errCode === 0) {
                this.setState({
                    statusVerify: true,
                    errCode: res.errCode
                })
            } else {
                this.setState({
                    statusVerify: true,
                    errCode: res && res.errCode ? res.errCode : -1
                })
            }
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        
    }

    render() {
        let {statusVerify, errCode} = this.state
        return (
            <>
                <HomeHeader />
                <div className='verify-container'>
                    { statusVerify === false ? <div>Loading data...</div>
                        :
                        <div>
                            { +errCode === 0 ? <div className='verify-img-success'></div>
                                : <div className='verify-img-err'></div>
                            }
                        </div>
                    }
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

export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmail);
