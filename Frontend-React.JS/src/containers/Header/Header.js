import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from "../../store/actions";
import Navigator from '../../components/Navigator';
import { adminMenu, doctorMenu } from './menuApp';
import './Header.scss';
import { USER_ROLE } from '../../utils';
import _ from 'lodash';

/**
 * Header của khu vực quản trị (/system/*).
 *
 * Gồm 2 phần:
 *  - Thanh menu dọc (Navigator) bên trái: menu thay đổi theo vai trò người dùng.
 *  - Góc phải: lời chào + nút đăng xuất.
 *
 * Trước đây góc phải còn có 2 nút VN/EN để đổi ngôn ngữ; nay đã bỏ vì
 * giao diện chỉ dùng tiếng Việt.
 */
class Header extends Component {
    constructor(props) {
        super(props)

        this.state = {
            menuApp: [],
        }
    }

    /**
     * Chọn menu tương ứng với vai trò của người đang đăng nhập.
     *  - Quản trị viên (R1) -> adminMenu
     *  - Bác sĩ (R2)        -> doctorMenu
     */
    componentDidMount() {
        let { userInfo } = this.props
        let menu = []

        if (userInfo && !_.isEmpty(userInfo)) {
            let role = userInfo.roleId
            if (role === USER_ROLE.ADMIN) {
                menu = adminMenu
            }
            else if (role === USER_ROLE.DOCTOR) {
                menu = doctorMenu
            } 
        }
        this.setState({
            menuApp: menu
        })
    }

    render() {
        const { processLogout, userInfo } = this.props;

        return (
            <div className="header-container">
                {/* Thanh navigator (menu dọc bên trái) */}
                <div className="header-tabs-container">
                    <Navigator menus={this.state.menuApp} />
                </div>

                <div className='languages'>
                    <span className='welcome'>{'Xin chào'}, {userInfo && userInfo.firstName ? userInfo.firstName : ""}!</span>

                    {/* Nút đăng xuất */}
                    <div className="btn btn-logout" onClick={processLogout} title='Đăng xuất'>
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
