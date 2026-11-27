import React, { Component } from 'react';
import { connect } from 'react-redux';
import './ManageDoctor.scss';
import { CRUD_ACTIONS } from "../../../utils";
import * as actions from '../../../store/actions'
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import Select from 'react-select';
import { getDetailDoctorInfoService } from '../../../services/userService';

const mdParser = new MarkdownIt(/* Tuỳ chọn của Markdown-it */);

class ManageDoctor extends Component {

    constructor(props) {
        super(props)
        this.state = {
            // Lưu vào bảng markdown
            contentMarkdown: '',
            contentHTML: '',
            selectedOption: '',
            description: '',
            listDoctors: [],
            hasOldData: false,

            // Lưu vào bảng doctor_info
            listPrice: [],
            listPayment: [],
            listProvince: [],
            listClinic: [],
            listSpecialty: [],

            selectedPrice: '',
            selectedPayment: '',
            selectedProvince: '',
            selectedClinic: '',
            selectedSpecialty: '',
            nameClinic: '',
            addressClinic: '',
            note: '',
            clinicId: '',
            specialtyId: '',
        }
    }

    componentDidMount() {
        this.props.fetchGetAllDoctors()
        this.props.getRequiredDoctorInfo()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allDoctors !== this.props.allDoctors) {
            let dataSelect = this.buildDataInputSelect(this.props.allDoctors, 'USERS')
            let { resPayment, resPrice, resProvince, resSpecialty, resClinic } = this.props.allRequiredDoctorInfo
            
            let dataSelectPrice = this.buildDataInputSelect(resPrice, 'PRICE')
            let dataSelectPayment = this.buildDataInputSelect(resPayment, 'PAYMENT')
            let dataSelectProvince = this.buildDataInputSelect(resProvince, 'PROVINCE')
            let dataSelectSpecialty = this.buildDataInputSelect(resSpecialty, 'SPECIALTY')
            let dataSelectClinic = this.buildDataInputSelect(resClinic, 'CLINIC')
            this.setState({
                listDoctors: dataSelect,
                listPrice: dataSelectPrice,
                listPayment: dataSelectPayment,
                listProvince: dataSelectProvince,
                listSpecialty: dataSelectSpecialty,
                listClinic: dataSelectClinic
            })
        }
        
        if (prevProps.allRequiredDoctorInfo !== this.props.allRequiredDoctorInfo) {
            let dataSelect = this.buildDataInputSelect(this.props.allDoctors, 'USERS')
            let { resPayment, resPrice, resProvince, resSpecialty, resClinic } = this.props.allRequiredDoctorInfo
            
            let dataSelectPrice = this.buildDataInputSelect(resPrice, 'PRICE')
            let dataSelectPayment = this.buildDataInputSelect(resPayment, 'PAYMENT')
            let dataSelectProvince = this.buildDataInputSelect(resProvince, 'PROVINCE')
            let dataSelectSpecialty = this.buildDataInputSelect(resSpecialty, 'SPECIALTY')
            let dataSelectClinic = this.buildDataInputSelect(resClinic, 'CLINIC')
            this.setState({
                listDoctors: dataSelect,
                listPrice: dataSelectPrice,
                listPayment: dataSelectPayment,
                listProvince: dataSelectProvince,
                listSpecialty: dataSelectSpecialty,
                listClinic: dataSelectClinic
            })
        }

            }

    // Hoàn tất!
    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentMarkdown: text,
            contentHTML: html
        })
    }

    handleSaveContentMarkdown = () => {
        let { hasOldData } = this.state

        this.props.fetchSaveInfoDoctors({
            contentHTML: this.state.contentHTML,
            contentMarkdown: this.state.contentMarkdown,
            description: this.state.description,
            doctorId: this.state.selectedOption.value,
            action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,

            selectedPrice: this.state.selectedPrice.value,
            selectedPayment: this.state.selectedPayment.value,
            selectedProvince: this.state.selectedProvince.value,
            nameClinic: this.state.nameClinic,
            addressClinic: this.state.addressClinic,
            note: this.state.note,
            clinicId: this.state.selectedClinic && this.state.selectedClinic.value ? this.state.selectedClinic.value : '',
            specialtyId: this.state.selectedSpecialty.value
        })

        this.setState({
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                hasOldData: false,
                addressClinic: '',
                nameClinic: '',
                note: '',
                selectedPayment: '',
                selectedPrice: '',
                selectedProvince: '',
                selectedSpecialty: '',
                selectedClinic: '',
                selectedOption: ''
        }) 
    }

    handleChangeSelect = async (selectedOption) => {
        this.setState({ selectedOption })
        let { listPayment, listPrice, listProvince, listSpecialty, listClinic } = this.state
        
        let res = await getDetailDoctorInfoService(selectedOption.value)
        if (res && res.errCode === 0 && res.data && res.data.Markdown) {
            let markdownValue = res.data.Markdown

            let addressClinic = '', nameClinic = '', note = '', paymentId = '', priceId = '', provinceId = '',
            selectedPayment = '', selectedPrice = '', selectedProvince = '', specialtyId = '', selectedSpecialty = '',
            clinicId = '', selectedClinic = ''
            
            if (res.data.Doctor_Info) {
                addressClinic = res.data.Doctor_Info.addressClinic
                nameClinic = res.data.Doctor_Info.nameClinic
                note = res.data.Doctor_Info.note

                paymentId = res.data.Doctor_Info.paymentId
                priceId = res.data.Doctor_Info.priceId
                provinceId = res.data.Doctor_Info.provinceId
                specialtyId = res.data.Doctor_Info.specialtyId
                clinicId = res.data.Doctor_Info.clinicId

                selectedPayment = listPayment.find(item => {
                    return item && item.value === paymentId
                })
                selectedPrice = listPrice.find(item => {
                    return item && item.value === priceId
                })
                selectedProvince = listProvince.find(item => {
                    return item && item.value === provinceId
                })
                selectedSpecialty = listSpecialty.find(item => {
                    return item && item.value === specialtyId
                })
                selectedClinic = listClinic.find(item => {
                    return item && item.value === clinicId
                })
            }

            this.setState({
                contentHTML: markdownValue.contentHTML,
                contentMarkdown: markdownValue.contentMarkdown,
                description: markdownValue.description,
                hasOldData: true,
                addressClinic: addressClinic,
                nameClinic: nameClinic,
                note: note,
                selectedPayment: selectedPayment,
                selectedPrice: selectedPrice,
                selectedProvince: selectedProvince,
                selectedSpecialty: selectedSpecialty,
                selectedClinic: selectedClinic
            }) 

        } else {
            this.setState({
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                hasOldData: false,
                addressClinic: '',
                nameClinic: '',
                note: '',
                selectedPayment: '',
                selectedPrice: '',
                selectedProvince: '',
                selectedSpecialty: '',
                selectedClinic: ''
            }) 
        }
    }

    handleChangeSelectDoctorInfo = async (selectedOption, name) => {
        let stateName = name.name
        let stateCopy = { ...this.state }
        stateCopy[stateName] = selectedOption
        this.setState({
            ...stateCopy
        })
    }

    handleOnChangeText = (event, id) => {
        let stateCopy = { ...this.state }
        stateCopy[id] = event.target.value
        this.setState({
            ...stateCopy
        })
    }

    buildDataInputSelect = (inputData, type) => {
        let res = []
        if (inputData && inputData.length > 0) {
            if (type === 'USERS') {
                inputData.forEach(item => {
                    let object = {}
                    let labelVi = `${item.lastName} ${item.firstName}` 
                    object.label = labelVi
                    object.value = item.id
                    res.push(object)
                })
            }
            if (type === 'PRICE') {
                inputData.forEach(item => {
                    let object = {}
                    let labelVi = `${item.valueVi}`
                    object.label = labelVi
                    object.value = item.keyMap
                    res.push(object)
                })
            }
            if (type === 'PAYMENT' || type === 'PROVINCE') {
                inputData.forEach(item => {
                    let object = {}
                    let labelVi = `${item.valueVi}`
                    object.label = labelVi
                    object.value = item.keyMap
                    res.push(object)
                })
            }
            if (type === 'SPECIALTY') {
                inputData.forEach(item => {
                    let object = {}
                    object.label = item.name
                    object.value = item.id
                    res.push(object)
                })
            }
            if (type === 'CLINIC') {
                inputData.forEach(item => {
                    let object = {}
                    object.label = item.name
                    object.value = item.id
                    res.push(object)
                })
            }
        }
        return res
    }

    // Vòng đời component
    // Thứ tự chạy: 1. Chạy constructor -> khởi tạo state
    // 2. Did mount (cập nhật state)
    // 3. Render
    render() {
        let { hasOldData } = this.state
        return (
            <div className='manage-doctor-container'>
                <div className='manage-doctor-title'>{'Thêm thông tin bác sĩ'}</div>
                <div className='more-info'>
                    <div className='content-left form-group'>
                        <label>{'Chọn bác sĩ'}</label>
                        <Select
                            value={this.state.selectedOption}
                            onChange={this.handleChangeSelect}
                            options={this.state.listDoctors}
                            placeholder="Chọn bác sĩ"
                        />
                    </div>
                    <div className='content-right'>
                        <label>{'Thông tin giới thiệu'}</label>
                        <textarea className='form-control' 
                            onChange={(event) => this.handleOnChangeText(event, 'description')}
                            value={this.state.description}
                        >
                        </textarea>
                    </div>
                </div>
                <div className='more-info-extra row'>
                    <div className='col-4 form-group'>
                        <label>{'Giá khám bệnh'}</label>
                        <Select
                            value={this.state.selectedPrice}
                            onChange={this.handleChangeSelectDoctorInfo}
                            options={this.state.listPrice}
                            placeholder="Giá khám bệnh"
                            name="selectedPrice"
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label>{'Phương thức thanh toán'}</label>
                        <Select
                            value={this.state.selectedPayment}
                            onChange={this.handleChangeSelectDoctorInfo}
                            options={this.state.listPayment}
                            placeholder="Phương thức thanh toán"
                            name="selectedPayment"
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label>{'Tỉnh thành'}</label>
                        <Select
                            value={this.state.selectedProvince}
                            onChange={this.handleChangeSelectDoctorInfo}
                            options={this.state.listProvince}
                            placeholder="Tỉnh thành"
                            name="selectedProvince"
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label>{'Tên phòng khám'}</label>
                        <input className='form-control' 
                            onChange={(event) => this.handleOnChangeText(event, 'nameClinic')}
                            value={this.state.nameClinic}
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label>{'Địa chỉ phòng khám'}</label>
                        <input className='form-control' 
                            onChange={(event) => this.handleOnChangeText(event, 'addressClinic')}
                            value={this.state.addressClinic}
                        />
                    </div>
                    <div className='col-4 form-group'>
                        <label>{'Ghi chú'}</label>
                        <input className='form-control' 
                            onChange={(event) => this.handleOnChangeText(event, 'note')}
                            value={this.state.note}
                        />
                    </div>
                    <div className='col-6 form-group'>
                        <label>{'Chọn chuyên khoa'}</label>
                        <Select
                            value={this.state.selectedSpecialty}
                            onChange={this.handleChangeSelectDoctorInfo}
                            options={this.state.listSpecialty}
                            placeholder="Chọn chuyên khoa"
                            name="selectedSpecialty"
                        />
                    </div>
                    <div className='col-6 form-group'>
                        <label>{'Chọn phòng khám'}</label>
                        <Select
                            value={this.state.selectedClinic}
                            onChange={this.handleChangeSelectDoctorInfo}
                            options={this.state.listClinic}
                            placeholder="Chọn phòng khám"
                            name="selectedClinic"
                        />
                    </div>
                </div>
                <div className='manage-doctor-editor'>
                    <MdEditor style={{ height: '400px' }}
                        renderHTML={text => mdParser.render(text)}
                        onChange={this.handleEditorChange}
                        value={this.state.contentMarkdown}
                    />
                </div>
                <button className={hasOldData === true ? "btn btn-warning my-3" : "btn btn-primary my-3"}
                    onClick={() => this.handleSaveContentMarkdown()}
                >
                    {hasOldData === true ? 'Lưu chỉnh sửa'
                                        : 'Lưu thông tin'}   
                </button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        allDoctors: state.admin.allDoctors,
        allRequiredDoctorInfo: state.admin.allRequiredDoctorInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchGetAllDoctors: () => dispatch(actions.fetchGetAllDoctors()),
        getRequiredDoctorInfo: () => dispatch(actions.getRequiredDoctorInfo()),
        fetchSaveInfoDoctors: (data) => dispatch(actions.fetchSaveInfoDoctors(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
