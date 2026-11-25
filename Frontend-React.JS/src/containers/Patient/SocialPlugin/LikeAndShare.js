import React, { Component } from 'react';
import './LikeAndShare.scss';
import { loadFacebookSdk } from '../../../utils/facebookSdk';

class LikeAndShare extends Component {
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
        // SDK bị chặn/không khả dụng -> giữ lại các liên kết dự phòng bên dưới.
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
        const { dataHref, title } = this.props;
        const href = dataHref || (typeof window !== 'undefined' ? window.location.href : '');
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(href)}`;

        return (
            <div className="like-share-plugin" ref={this.containerRef}>
                <div
                    className="fb-like"
                    data-href={href}
                    data-layout="button_count"
                    data-action="like"
                    data-size="small"
                    data-share="true"
                    data-lazy="false"
                ></div>
                <div
                    className="fb-share-button"
                    data-href={href}
                    data-layout="button"
                    data-size="small"
                >
                    <a
                        className="fb-xfbml-parse-ignore"
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {title || 'Share'}
                    </a>
                </div>
            </div>
        );
    }
}

export default LikeAndShare;
