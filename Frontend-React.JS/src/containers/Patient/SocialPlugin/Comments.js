import React, { Component } from 'react';
import './Comments.scss';
import { loadFacebookSdk } from '../../../utils/facebookSdk';

class Comments extends Component {
    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
    }

    componentDidMount() {
        this._isMounted = true;
        this.initFacebookPlugin();
    }

    componentWillUnmount() {
        // Dọn dẹp: ngăn callback muộn của SDK chạm vào node đã bị gỡ khỏi DOM.
        this._isMounted = false;
        this.containerRef = null;
    }

    async initFacebookPlugin() {
        const FB = await loadFacebookSdk();
        // SDK bị chặn/không khả dụng -> khung bình luận đơn giản là để trống.
        if (!this._isMounted || !FB || !this.containerRef || !this.containerRef.current) {
            return;
        }
        try {
            FB.XFBML.parse(this.containerRef.current);
        } catch (e) {
            // Không bao giờ để plugin bên thứ ba làm sập trang.
        }
    }

    render() {
        const { dataHref } = this.props;
        const href = dataHref || (typeof window !== 'undefined' ? window.location.href : '');

        return (
            <div className="comment-plugin" ref={this.containerRef}>
                <div
                    className="fb-comments"
                    data-href={href}
                    data-width="100%"
                    data-numposts="5"
                    data-order-by="reverse_time"
                ></div>
            </div>
        );
    }
}

export default Comments;
