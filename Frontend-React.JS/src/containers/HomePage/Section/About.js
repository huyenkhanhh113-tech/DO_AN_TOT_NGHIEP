import React, { Component } from 'react';
import { connect } from 'react-redux';

class About extends Component {
    
    render() {

        return (
            <div className='section-share section-about'>
                <div className='section-container'>
                    </div><div className='section-about-header'>
                        {'Một số bài nhạc chữa lành tâm hồn'}
                    </div>
                    <div className='section-about-content'>
                        <div className='content-left'>
                            <iframe width="100%" height="400" src="https://www.youtube.com/embed/8-KalRPhCxc" title="10 Bản Nhạc Indie Cực Hay Đã Cũ..." frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                        </div>
                        <div className='content-right'>
                            <p>
                                Overthinking gặp overlove sẽ như thế nào? 
                                 "Em đợi anh, anh xong việc sẽ nhắn liền cho em."
                                 "Hãy gọi cho anh bất kì lúc nào. Em có anh nên không phải trải qua những nỗi lo lắng hay nỗi buồn một mình."
                                 Luôn nói với người khác là có bạn rồi.
                                 Đi đâu hay làm gì cũng đều chụp hình khoe với bạn.
                                 "Anh không muốn em nghĩ nhiều không phải vì thấy em phiền. Mà vì anh biết nghĩ nhiều sẽ khiến em mệt mỏi."
                                 "Lần đầu không hiểu được em, em có thể nói với anh, anh sẽ vì em mà thay đổi."
                                 "Em có anh không phải để suy nghĩ hay khóc một mình. Hãy chia cho anh một nửa."
                                 Nghiêm túc lắng nghe những suy nghĩ của bạn. Từ từ tìm hiểu và nghĩ cách để khiến bạn hạnh phúc khi có anh ấy.
                            </p>
                        </div>
                    </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        // Chỗ chèn thêm dữ liệu
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
