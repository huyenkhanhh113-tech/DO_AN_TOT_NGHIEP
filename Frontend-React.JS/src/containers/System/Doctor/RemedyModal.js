import React, { Component } from 'react';
import { connect } from "react-redux";
import './RemedyModal.scss'
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { CommonUtils } from '../../../utils';


class RemedyModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '', 
            imgBase64: ''
        }
    }

    async componentDidMount() {
        if (this.props.dataModal) {
            this.setState({
                email: this.props.dataModal.patientEmail,
            })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
                if (this.props.dataModal !== prevProps.dataModal) {
            this.setState({
                email: this.props.dataModal.patientEmail,
            })
        }
    }

    handleOnchangeEmail = (event) => {
        this.setState({
            email: event.target.value,
        })
    }

    handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file)

            this.setState({
                imgBase64: base64
            })
        }
        
    }

    handleSendRemedy = () => {
        this.props.sendRemedy(this.state)
    }

    render() {
        let { isOpenRemedyModal, closeRemedyModal } = this.props

        return (
            <Modal
                isOpen={isOpenRemedyModal}
                className={'booking-modal-container'}
                size='md'
                centered
                toggle={closeRemedyModal}
            >
                <div className="modal-header">
                    <h5 className="modal-title">{'Gửi hóa đơn khám bệnh'}</h5>
                    <button type="button" className="close" aria-label="Close" onClick={closeRemedyModal}>
                        <span aria-hidden="true">x</span>
                    </button>
                </div>
                <ModalBody>
                    <div className='row'>
                        <div className='col-6 form-group'>
                            <label>{'Email bệnh nhân'}</label>
                            <input className='form-control' type='email' value={this.state.email}
                                onChange={(event) => this.handleOnchangeEmail(event)}
                            />
                        </div>
                        <div className='col-6 form-group'>
                            <label>{'Chọn file hóa đơn'}</label>
                            <input className='form-control-file' type='file'
                                onChange={(event) => this.handleOnChangeImage(event)}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={() => this.handleSendRemedy()}>
                        {'Gửi'}
                    </Button>{' '}
                    <Button color="secondary" onClick={closeRemedyModal}>
                        {'Hủy'}
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
