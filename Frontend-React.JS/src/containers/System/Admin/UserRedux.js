import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CRUD_ACTIONS, CommonUtils } from "../../../utils";
import * as actions from '../../../store/actions'
import './UserRedux.scss'
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // Chỉ cần import một lần duy nhất trong toàn ứng dụng
import TableManageUser from './TableManageUser';

class UserRedux extends Component {
    constructor(props) {
        super(props)
        this.state = { 
            genderAll: [],
            positionArr: [],
            roleArr: [],
            previewImgURL: '',
            isOpen: false,

            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            gender: '',
            position: '',
            role: '',
            avatar: '',
            userEditId: '',

            action: '',
        }
    }

    async componentDidMount() {
        this.props.getGenderStart();
        this.props.getPositionStart();
        this.props.getRoleStart();
    }

    componentDidUpdate(prevProps, prevState, snaptshot) {
        // Vòng đời: render -> didUpdate
        if (prevProps.genderRedux !== this.props.genderRedux) {
            let arrGenders = this.props.genderRedux
            this.setState({
                genderAll: arrGenders,
                gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : ''
            })
        }

        if (prevProps.roleRedux !== this.props.roleRedux) {
            let arrRoles = this.props.roleRedux
            this.setState({
                roleArr: arrRoles,
                role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : '',
            })
        }

        if (prevProps.positionRedux !== this.props.positionRedux) {
            let arrPositions = this.props.positionRedux
            this.setState({
                positionArr: arrPositions,
                position: arrPositions && arrPositions.length > 0 ? arrPositions[0].keyMap : '',
            })
        }

        if (prevProps.listUsers !== this.props.listUsers) {
            let arrGenders = this.props.genderRedux
            let arrRoles = this.props.roleRedux
            let arrPositions = this.props.positionRedux

            this.setState({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                address: '',
                gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : '',
                position: arrPositions && arrPositions.length > 0 ? arrPositions[0].keyMap : '',
                role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : '',
                avatar: '',
                action: CRUD_ACTIONS.CREATE,
                previewImgURL: ''
            })
        }
    }

    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file)
            let objectURL = URL.createObjectURL(file)
            this.setState({
                previewImgURL: objectURL,
                avatar: base64
            })
        }
        
    }

    openPreviewImage = () => {
        if (!this.state.previewImgURL) return;

        this.setState({
            isOpen: true
        })
    }

    handleSaveUser = () => {
        let isValid = this.checkValidateInput()
        if (isValid === false) return;

        let {action} = this.state
        if (action === CRUD_ACTIONS.CREATE) {
            // Kích hoạt redux tạo người dùng mới
            this.props.createNewUser({
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                address: this.state.address,
                phonenumber: this.state.phoneNumber,
                gender: this.state.gender,
                roleId: this.state.role,
                positionId: this.state.position,
                avatar: this.state.avatar
            })
        }

        if(action === CRUD_ACTIONS.EDIT){
            // Kích hoạt redux cập nhật người dùng
            this.props.editUser({
                id: this.state.userEditId,
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                address: this.state.address,
                phonenumber: this.state.phoneNumber,
                gender: this.state.gender,
                roleId: this.state.role,
                positionId: this.state.position,
                avatar: this.state.avatar
            })
        }
        
    }

    checkValidateInput = () => {
        let isValid = true
        let arrCheck = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'address',]
        for (let i = 0; i < arrCheck.length; i++){
            if (!this.state[arrCheck[i]]) {
                isValid = false
                alert('Missing required parameter: ' + arrCheck[i])
                break
            }
        }
        return isValid
    }

    onChangeInput = (event, id) => {
        let copyState = { ...this.state }
        copyState[id] = event.target.value

        this.setState({
            ...copyState
        })
    }

    handleEditUserFromParent = (user) => {
        // Backend trả về ảnh dạng data-URI nên dùng trực tiếp
        let imgSrc = user.image ? user.image : '';

        this.setState({
                email: user.email,
                password: 'secrethehe',
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phonenumber,
                address: user.address,
                gender: user.gender,
                position: user.positionId,
                role: user.roleId,
                avatar: '',
                previewImgURL: imgSrc,
                action: CRUD_ACTIONS.EDIT,
                userEditId: user.id
            })
    }

    render() {
        let genderData = this.state.genderAll;
        let roleData = this.state.roleArr;
        let positionData = this.state.positionArr;


        let {email, password, firstName, lastName, phoneNumber, address, gender, position, role} = this.state

        return (
            <div className='user-redux-container'>
                <div className='title'>
                    {'Quản lý người dùng'} 
                </div>
                <div className="user-redux-body" >
                    <div className='container'>
                        <div className='row'>
                            <div className='col-12 my-4'><strong>{'Thêm mới người dùng'}</strong></div>
                            <div className='row col-12 my-2'>
                                <div className='col-3'>
                                    <label>{'Email'}</label>
                                    <input className='form-control' type='email'
                                        value={email}
                                        onChange={(event) => { this.onChangeInput(event, 'email') }}
                                        disabled={this.state.action === CRUD_ACTIONS.EDIT ? true : false}
                                    />
                                </div>
                                <div className='col-3'>
                                    <label>{'Mật khẩu'}</label>
                                    <input className='form-control' type='password'
                                        value={password}
                                        onChange={(event) => { this.onChangeInput(event, 'password') }}
                                        disabled={this.state.action === CRUD_ACTIONS.EDIT ? true : false}
                                    />
                                </div>
                                <div className='col-3'>
                                    <label>{'Tên'}</label>
                                    <input className='form-control' type='text'
                                        value={firstName}
                                        onChange={(event) => {this.onChangeInput(event, 'firstName')}}
                                    />
                                </div>
                                <div className='col-3'>
                                    <label>{'Họ'}</label>
                                    <input className='form-control' type='text'
                                        value={lastName}
                                        onChange={(event) => {this.onChangeInput(event, 'lastName')}}
                                    />
                                </div>
                            </div>
                            <div className='row col-12 my-2'>
                                <div className='col-3'>
                                    <label>{'Số điện thoại'}</label>
                                    <input className='form-control' type='text'
                                        value={phoneNumber}
                                        onChange={(event) => {this.onChangeInput(event, 'phoneNumber')}}
                                    />
                                </div>
                                <div className='col-9'>
                                    <label>{'Địa chỉ'}</label>
                                    <input className='form-control' type='text'
                                        value={address}
                                        onChange={(event) => {this.onChangeInput(event, 'address')}}
                                    />
                                </div>
                            </div>
                            <div className='row col-12 my-2'>
                                <div className='col-3'>
                                    <label>{'Giới tính'}</label>
                                    <select className="form-control"
                                        onChange={(event) => { this.onChangeInput(event, 'gender') }}
                                        value={gender}
                                    >
                                        {genderData && genderData.length > 0 &&
                                            genderData.map((item, index) => {
                                                return (
                                                    <option key={index} value={item.keyMap}>
                                                        {item.valueVi}
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <div className='col-3'>
                                    <label>{'Vai trò'}</label>
                                    <select className="form-control"
                                        onChange={(event) => { this.onChangeInput(event, 'role') }}
                                        value={role}
                                    >
                                        {roleData && roleData.length > 0 &&
                                            roleData.map((item, index) => {
                                                return (
                                                    <option key={index} value={item.keyMap}>
                                                        {item.valueVi}
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <div className='col-3'>
                                    <label>{'Chức danh'}</label>
                                    <select className="form-control"
                                        onChange={(event) => { this.onChangeInput(event, 'position') }}
                                        value={position}
                                    >
                                        {positionData && positionData.length > 0 &&
                                            positionData.map((item, index) => {
                                                return (
                                                    <option key={index} value={item.keyMap}>
                                                        {item.valueVi}
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                                <div className='col-3'>
                                    <label>{'Ảnh'}</label>
                                    <div className='preview-img-container'>
                                        <input id='previewImg' type='file' hidden
                                            onChange={(event) => this.handleOnChangeImage(event)}
                                        />
                                        <label className='label-upload' htmlFor='previewImg'>{'Tải ảnh lên'}<i class="fas fa-upload"></i></label>
                                        <div className='preview-image'
                                            style={{ backgroundImage: `url(${this.state.previewImgURL})` }}
                                            onClick={() => this.openPreviewImage()}
                                        ></div>   
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 mb-3'>
                                <button className={this.state.action === CRUD_ACTIONS.EDIT ? "btn btn-warning" : "btn btn-primary"}
                                    onClick={() => this.handleSaveUser()}
                                >
                                    {this.state.action === CRUD_ACTIONS.EDIT ? 'Lưu chỉnh sửa'
                                        : 'Lưu người dùng'}    
                                </button>
                            </div>
                            <div className='col-12 mb-5'>
                                <TableManageUser
                                    handleEditUserFromParent={this.handleEditUserFromParent}
                                    action={this.state.action}
                                />
                            </div>  
                        </div>
                    </div>
                </div>
                
                
                {this.state.isOpen === true &&
                    <Lightbox
                        mainSrc={this.state.previewImgURL}
                        onCloseRequest={() => this.setState({ isOpen: false })}
                    />
                }
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        genderRedux: state.admin.genders,
        isLoadingGender: state.admin.isLoadingGender,
        roleRedux: state.admin.roles,
        positionRedux: state.admin.positions,
        listUsers: state.admin.users,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getGenderStart: () => dispatch(actions.fetchGenderStart()),
        getPositionStart: () => dispatch(actions.fetchPositionStart()),
        getRoleStart: () => dispatch(actions.fetchRoleStart()),
        createNewUser: (data) => dispatch(actions.fetchCreateNewUser(data)),
        editUser: (data) => dispatch(actions.fetchEditUser(data)),
        fetchUserRedux: () => dispatch(actions.fetchAllUserStart()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserRedux);
