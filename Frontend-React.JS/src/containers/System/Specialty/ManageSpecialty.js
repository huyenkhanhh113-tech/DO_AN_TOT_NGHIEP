import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSpecialty.scss'
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { CommonUtils } from "../../../utils";
import {
    createNewSpecialtyService,
    getAllSpecialtyService,
    editSpecialtyService,
    deleteSpecialtyService,
} from '../../../services/userService'
import { toast } from 'react-toastify'
import ConfirmDialog from '../../../components/ConfirmDialog';

const mdParser = new MarkdownIt(/* Tuỳ chọn của Markdown-it */);

/**
 * Cắt gọn mô tả để hiển thị trên card danh sách.
 * Loại bỏ thẻ HTML + ký hiệu markdown, gộp khoảng trắng và giới hạn độ dài.
 */
const stripDescription = (text) => {
    if (!text) return ''
    const plain = String(text)
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')   // bỏ ảnh markdown
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // link markdown -> giữ chữ
        .replace(/<[^>]*>/g, ' ')                // bỏ thẻ HTML
        .replace(/[#*_>`~]/g, ' ')               // bỏ ký hiệu markdown phổ biến
        .replace(/\s+/g, ' ')
        .trim()
    return plain.length > 140 ? plain.slice(0, 140) + '...' : plain
}

class ManageSpecialty extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // Dữ liệu form thêm mới / chỉnh sửa
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            previewImg: '',
            // id đang chỉnh sửa; rỗng = chế độ thêm mới
            editingId: '',
            // Danh sách chuyên khoa + trạng thái tải
            list: [],
            loadingList: false,
            // Hộp thoại xác nhận xoá
            isConfirmOpen: false,
            itemToDelete: null,
        }
        this.fileInputRef = React.createRef()
    }

    componentDidMount() {
        this.fetchList()
    }

    // Tải toàn bộ danh sách chuyên khoa từ API
    fetchList = async () => {
        this.setState({ loadingList: true })
        try {
            const res = await getAllSpecialtyService()
            const list = (res && res.errCode === 0 && Array.isArray(res.data)) ? res.data : []
            this.setState({ list, loadingList: false })
        } catch (error) {
            this.setState({ list: [], loadingList: false })
            toast.error('Không tải được dữ liệu!')
        }
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            descriptionMarkdown: text,
            descriptionHTML: html
        })
    }

    handleOnChangeInput = (event, id) => {
        let stateCopy = { ...this.state }
        stateCopy[id] = event.target.value
        this.setState({
            ...stateCopy
        })
    }

    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file)
            let objectURL = URL.createObjectURL(file)
            this.setState({
                imageBase64: base64,
                previewImg: objectURL,
            })
        }
    }

    // Đưa form về trạng thái thêm mới và xoá ảnh đang xem trước
    resetForm = () => {
        if (this.fileInputRef.current) {
            this.fileInputRef.current.value = ''
        }
        this.setState({
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            previewImg: '',
            editingId: '',
        })
    }

    handleSaveSpecialty = async () => {
        if (!this.state.name || !this.state.name.trim()) {
            toast.error('Vui lòng nhập tên chuyên khoa!')
            return
        }

        // Khi sửa: imageBase64 rỗng => backend giữ ảnh cũ
        const payload = {
            name: this.state.name,
            imageBase64: this.state.imageBase64,
            descriptionHTML: this.state.descriptionHTML,
            descriptionMarkdown: this.state.descriptionMarkdown,
        }

        try {
            let res
            if (this.state.editingId) {
                res = await editSpecialtyService({ id: this.state.editingId, ...payload })
            } else {
                res = await createNewSpecialtyService(payload)
            }

            if (res && res.errCode === 0) {
                toast.success(this.state.editingId ? 'Cập nhật chuyên khoa thành công!' : 'Thêm mới chuyên khoa thành công!')
                this.resetForm()
                this.fetchList()
            } else {
                toast.error('Lưu chuyên khoa thất bại!')
            }
        } catch (error) {
            toast.error('Lưu chuyên khoa thất bại!')
        }
    }

    // Đổ dữ liệu bản ghi vào form và cuộn lên đầu trang
    handleEditItem = (item) => {
        this.setState({
            name: item.name || '',
            imageBase64: '',
            descriptionHTML: item.descriptionHTML || '',
            descriptionMarkdown: item.descriptionMarkdown || '',
            previewImg: item.image || '',
            editingId: item.id,
        })
        if (window.scrollTo) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    handleDeleteClick = (item) => {
        this.setState({ isConfirmOpen: true, itemToDelete: item })
    }

    handleCancelDelete = () => {
        this.setState({ isConfirmOpen: false, itemToDelete: null })
    }

    // Xoá chuyên khoa: errCode === 3 nghĩa là còn ràng buộc (còn bác sĩ) -> hiện errMessage
    handleConfirmDelete = async () => {
        const { itemToDelete } = this.state
        this.setState({ isConfirmOpen: false, itemToDelete: null })
        if (!itemToDelete || !itemToDelete.id) return

        try {
            const res = await deleteSpecialtyService(itemToDelete.id)
            if (res && res.errCode === 0) {
                toast.success('Xoá chuyên khoa thành công!')
                this.fetchList()
            } else {
                const msg = (res && res.errMessage)
                    ? res.errMessage
                    : 'Xoá chuyên khoa thất bại!'
                toast.error(msg)
            }
        } catch (error) {
            toast.error('Xoá chuyên khoa thất bại!')
        }
    }

    render() {
        const { editingId, loadingList, list } = this.state
        const isEditing = !!editingId

        return (
            <div className='manage-specialty-container'>
                <div className='ms-title'>
                    {'Quản lý chuyên khoa'}
                </div>

                {/* KHU VỰC 1: FORM THÊM MỚI / CHỈNH SỬA */}
                <div className='form-area'>
                    <div className='form-area__header'>
                        <span className={'form-area__badge' + (isEditing ? ' is-edit' : '')}>
                            {isEditing
                                ? 'Chỉnh sửa chuyên khoa'
                                : 'Thêm mới chuyên khoa'}
                        </span>
                        {isEditing && (
                            <button
                                type='button'
                                className='btn btn-outline-secondary btn-cancel-edit'
                                onClick={this.resetForm}
                            >
                                <i className="fas fa-times"></i> {'Huỷ chỉnh sửa'}
                            </button>
                        )}
                    </div>

                    <div className='add-new-specialty row'>
                        <div className='col-md-6 form-group'>
                            <label>{'Tên chuyên khoa'}</label>
                            <input className='form-control' type='text' value={this.state.name}
                                onChange={(event) => this.handleOnChangeInput(event, 'name')}
                            />
                        </div>
                        <div className='col-md-6 form-group'>
                            <label>{'Ảnh chuyên khoa'}</label>
                            <div className='image-field'>
                                <input className='form-control-file' type='file' ref={this.fileInputRef}
                                    onChange={(event) => this.handleOnChangeImage(event)}
                                />
                                {this.state.previewImg && (
                                    <div className='image-field__preview'>
                                        <span className='image-field__label'>
                                            {isEditing ? 'Ảnh hiện tại' : 'Ảnh xem trước'}
                                        </span>
                                        <div className='thumb' style={{ backgroundImage: `url(${this.state.previewImg})` }}></div>
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <small className='form-hint'>{'Không chọn ảnh mới sẽ giữ nguyên ảnh hiện tại.'}</small>
                            )}
                        </div>
                        <div className='col-12'>
                            <label>{'Mô tả'}</label>
                            <MdEditor style={{ height: '400px' }}
                                renderHTML={text => mdParser.render(text)}
                                onChange={this.handleEditorChange}
                                value={this.state.descriptionMarkdown}
                            />
                        </div>
                        <div className='col-12'>
                            <button
                                className={isEditing ? 'btn btn-warning mt-3 btn-save-specialty' : 'btn btn-primary mt-3 btn-save-specialty'}
                                onClick={() => this.handleSaveSpecialty()}
                            >
                                {isEditing
                                    ? 'Lưu thay đổi'
                                    : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* KHU VỰC 2: DANH SÁCH CHUYÊN KHOA */}
                <div className='list-area'>
                    <div className='list-area__header'>
                        {'Danh sách chuyên khoa'}
                        <span className='list-area__count'>{list.length}</span>
                    </div>

                    {loadingList ? (
                        <div className='state-box'>
                            <i className="fas fa-spinner fa-spin"></i>
                            {'Đang tải dữ liệu...'}
                        </div>
                    ) : list.length === 0 ? (
                        <div className='state-box'>
                            <i className="fas fa-inbox"></i>
                            {'Chưa có dữ liệu'}
                        </div>
                    ) : (
                        <div className='item-grid'>
                            {list.map((item, index) => (
                                <div className='item-card' key={item.id || index}>
                                    <div className='item-card__thumb'
                                        style={{ backgroundImage: item.image ? `url(${item.image})` : 'none' }}
                                    >
                                        {!item.image && <i className="fas fa-image"></i>}
                                    </div>
                                    <div className='item-card__body'>
                                        <div className='item-card__name'>{item.name}</div>
                                        <div className='item-card__desc'>
                                            {stripDescription(item.descriptionMarkdown || item.descriptionHTML)}
                                        </div>
                                    </div>
                                    <div className='item-card__actions'>
                                        <button type='button' className='btn-action btn-action--edit'
                                            onClick={() => this.handleEditItem(item)}
                                        >
                                            <i className="fas fa-pencil-alt"></i> {'Sửa'}
                                        </button>
                                        <button type='button' className='btn-action btn-action--delete'
                                            onClick={() => this.handleDeleteClick(item)}
                                        >
                                            <i className="fas fa-trash-alt"></i> {'Xoá'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Hộp thoại xác nhận xoá: nội dung có cụm "Bạn có muốn xóa" */}
                <ConfirmDialog
                    isOpen={this.state.isConfirmOpen}
                    variant='danger'
                    title="Bạn có muốn xóa?"
                    message={`Bạn có muốn xóa "${this.state.itemToDelete ? this.state.itemToDelete.name : ''}"? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    onConfirm={this.handleConfirmDelete}
                    onCancel={this.handleCancelDelete}
                />
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty);
