import React, { Component } from 'react';
import { connect } from "react-redux";
import './RemedyModal.scss'
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { CommonUtils } from '../../../utils';
import { toast } from 'react-toastify';

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB / ảnh

/**
 * Modal bác sĩ gửi KẾT QUẢ KHÁM cho bệnh nhân.
 *
 * - Chọn được NHIỀU ảnh (tối đa 8, mỗi ảnh <= 4 MB), xem trước và xoá từng ảnh.
 * - Nhập "Nhận xét và dặn dò" — nội dung này được chèn vào body email.
 * - Bấm Gửi -> `ManagePatient.sendRemedy()` -> POST /api/send-remedy
 *   -> `doctorService.sendRemedyService()` -> `emailService.sendAttachment()`.
 *
 * State gửi lên cha:
 *   { email, imagesBase64: string[], doctorNote: string }
 */
class RemedyModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            imagesBase64: [],
            doctorNote: ''
        }
    }

    async componentDidMount() {
        this.resetForm()
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        const justOpened = this.props.isOpenRemedyModal && !prevProps.isOpenRemedyModal
        const changedPatient = this.props.dataModal !== prevProps.dataModal
        if (justOpened || changedPatient) {
            this.resetForm()
        }
    }

    /**
     * Nạp lại email bệnh nhân và xoá ảnh/ghi chú của lần gửi trước.
     */
    resetForm = () => {
        if (this.props.dataModal) {
            this.setState({
                email: this.props.dataModal.patientEmail || '',
                imagesBase64: [],
                doctorNote: ''
            })
        }
    }

    handleOnchangeEmail = (event) => {
        this.setState({
            email: event.target.value,
        })
    }

    handleOnChangeNote = (event) => {
        this.setState({
            doctorNote: event.target.value,
        })
    }

    /**
     * Chọn nhiều ảnh cùng lúc. Ảnh được đọc sang base64 để gửi kèm email.
     * Reset `event.target.value` để có thể chọn lại đúng file vừa xoá.
     */
    handleOnChangeImage = async (event) => {
        const files = Array.from(event.target.files || [])
        event.target.value = ''
        if (!files.length) return

        const invalidType = files.find((file) => !file.type || !file.type.startsWith('image/'))
        if (invalidType) {
            toast.error(`File "${invalidType.name}" không phải ảnh. Chỉ nhận JPG, PNG, WEBP...`)
            return
        }

        const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE)
        if (tooLarge) {
            toast.error(`Ảnh "${tooLarge.name}" vượt quá 4 MB. Vui lòng chọn ảnh nhỏ hơn.`)
            return
        }

        if (this.state.imagesBase64.length + files.length > MAX_IMAGES) {
            toast.error(`Chỉ được gửi tối đa ${MAX_IMAGES} ảnh mỗi lần.`)
            return
        }

        try {
            const base64List = await Promise.all(files.map((file) => CommonUtils.getBase64(file)))
            this.setState((prev) => ({
                imagesBase64: [...prev.imagesBase64, ...base64List]
            }))
        } catch (e) {
            toast.error('Không đọc được ảnh. Vui lòng thử lại.')
        }
    }

    handleRemoveImage = (index) => {
        this.setState((prev) => ({
            imagesBase64: prev.imagesBase64.filter((_, i) => i !== index)
        }))
    }

    handleSendRemedy = () => {
        if (!this.state.imagesBase64.length) {
            toast.error('Vui lòng chọn ít nhất 1 ảnh kết quả khám/hóa đơn.')
            return
        }
        this.props.sendRemedy(this.state)
    }

    render() {
        let { isOpenRemedyModal, closeRemedyModal } = this.props
        const { imagesBase64, doctorNote } = this.state

        return (
            <Modal
                isOpen={isOpenRemedyModal}
                className={'booking-modal-container'}
                size='lg'
                centered
                toggle={closeRemedyModal}
            >
                <div className="modal-header">
                    <h5 className="modal-title">{'Gửi kết quả khám bệnh'}</h5>
                    <button type="button" className="close" aria-label="Close" onClick={closeRemedyModal}>
                        <span aria-hidden="true">x</span>
                    </button>
                </div>
                <ModalBody>
                    <div className='row'>
                        <div className='col-md-6 form-group'>
                            <label>{'Email bệnh nhân'}</label>
                            <input className='form-control' type='email' value={this.state.email}
                                onChange={(event) => this.handleOnchangeEmail(event)}
                            />
                        </div>
                        <div className='col-md-6 form-group'>
                            <label>
                                {'Chọn ảnh kết quả / hóa đơn '}
                                <span className='remedy-count'>({imagesBase64.length}/{MAX_IMAGES})</span>
                            </label>
                            <input className='form-control-file' type='file'
                                accept='image/*'
                                multiple
                                onChange={(event) => this.handleOnChangeImage(event)}
                            />
                            <small className='remedy-hint'>
                                Có thể chọn nhiều ảnh cùng lúc. Tối đa {MAX_IMAGES} ảnh, mỗi ảnh ≤ 4 MB.
                            </small>
                        </div>
                    </div>

                    {imagesBase64.length > 0 && (
                        <div className='remedy-preview'>
                            {imagesBase64.map((src, index) => (
                                <div className='remedy-preview__item' key={`${index}-${src.slice(-20)}`}>
                                    <img src={src} alt={`Ảnh kết quả ${index + 1}`} />
                                    <button
                                        type='button'
                                        className='remedy-preview__remove'
                                        onClick={() => this.handleRemoveImage(index)}
                                        title='Xoá ảnh này'
                                        aria-label={`Xoá ảnh ${index + 1}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='form-group remedy-note'>
                        <label>{'Nhận xét và dặn dò bệnh nhân'}</label>
                        <textarea
                            className='form-control'
                            rows={4}
                            maxLength={2000}
                            value={doctorNote}
                            onChange={(event) => this.handleOnChangeNote(event)}
                            placeholder='Ví dụ: Sức khỏe ổn định, uống đủ nước, tái khám sau 7 ngày...'
                        />
                        <small className='remedy-hint remedy-note__count'>
                            {doctorNote.length}/2000 ký tự — nội dung này sẽ được gửi kèm email.
                        </small>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.handleSendRemedy()}>
                        {'Gửi kết quả'}
                    </Button>{' '}
                    <Button color="secondary" onClick={closeRemedyModal}>
                        {'Hủy'}
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    return {
        genders: state.admin.genders
    };
};

const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RemedyModal);
