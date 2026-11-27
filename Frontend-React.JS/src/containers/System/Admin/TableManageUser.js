import React, { Component } from 'react';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from '../../../store/actions'
import ConfirmDialog from '../../../components/ConfirmDialog';

class TableManageUser extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userRedux: [],
            // Trạng thái mở hộp thoại xác nhận xoá + người dùng đang chờ xoá
            isConfirmOpen: false,
            userToDelete: null,
        }
    }

    componentDidMount() {
        this.props.fetchUserRedux()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.listUsers !== this.props.listUsers) {
            this.setState({
                userRedux: this.props.listUsers
            })
        }
    }

    // Mở hộp thoại xác nhận trước khi xoá (KHÔNG dùng hộp thoại mặc định của trình duyệt)
    handleDeleteUser = (user) => {
        this.setState({
            isConfirmOpen: true,
            userToDelete: user,
        })
    }

    // Người dùng bấm "Huỷ" / Esc / bấm ra ngoài => không làm gì
    handleCancelDelete = () => {
        this.setState({
            isConfirmOpen: false,
            userToDelete: null,
        })
    }

    // Chỉ khi bấm "Xóa" mới thực hiện xoá qua redux (redux gọi deleteUserService + toast + tải lại)
    handleConfirmDelete = () => {
        const { userToDelete } = this.state
        if (userToDelete && userToDelete.id) {
            this.props.deleteUserRedux(userToDelete.id)
        }
        this.setState({
            isConfirmOpen: false,
            userToDelete: null,
        })
    }

    handleEditUser = (user) => {
        this.props.handleEditUserFromParent(user)
    }

    // Tên hiển thị của người dùng trong hộp thoại xác nhận: ưu tiên họ tên, rồi email
    getUserDisplayName = (user) => {
        if (!user) return ''
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        return fullName || user.email || ''
    }

    render() {
        let arrUsers = this.state.userRedux
        return (
            <>
                <table id='TableManageUser'>
                        <tbody>
                            <tr>
                                <th>{'Email'}</th>
                                <th>{'Tên'}</th>
                                <th>{'Họ'}</th>
                                <th>{'Địa chỉ'}</th>
                                <th>{'Số điện thoại'}</th>
                                <th>{'Hành động'}</th>
                            </tr>
                            {arrUsers && arrUsers.length > 0 && 
                                arrUsers.map((item, index) => {
                                    return (
                                        <tr key={item.id || index}>
                                            <td>{item.email}</td>
                                            <td>{item.firstName}</td>
                                            <td>{item.lastName}</td>
                                            <td>{item.address}</td>
                                            <td>{item.phonenumber}</td>
                                            <td>
                                                    <button className='btn-edit'
                                                    title={'Sửa'}
                                                    onClick={() => this.handleEditUser(item)}    
                                                    ><i className="fas fa-pencil-alt"></i></button>

                                                    <button className='btn-delete'
                                                    title={'Xoá'}
                                                    onClick={() => this.handleDeleteUser(item)}
                                                    ><i className="fas fa-trash-alt"></i></button>
                                            </td>
                                        </tr>
                                    )
                                })    
                            }                    
                        </tbody>    
                </table>

                {/* Hộp thoại xác nhận xoá người dùng: nội dung có cụm "Bạn có muốn xóa" */}
                <ConfirmDialog
                    isOpen={this.state.isConfirmOpen}
                    variant='danger'
                    title="Bạn có muốn xóa?"
                    message={`Bạn có muốn xóa người dùng "${this.getUserDisplayName(this.state.userToDelete)}"? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    onConfirm={this.handleConfirmDelete}
                    onCancel={this.handleCancelDelete}
                />
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        listUsers: state.admin.users
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchUserRedux: () => dispatch(actions.fetchAllUserStart()),
        deleteUserRedux: (id) => dispatch(actions.fetchDeleteUser(id))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
