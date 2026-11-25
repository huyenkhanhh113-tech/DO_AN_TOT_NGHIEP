const FB_SDK_ID = 'facebook-jssdk';
const FB_SDK_SRC = 'https://connect.facebook.net/vi_VN/sdk.js';
const FB_SDK_VERSION = 'v18.0';
const FB_SDK_TIMEOUT = 5000;

let sdkPromise = null;

/**
 * Liên tục kiểm tra cho tới khi window.FB sẵn sàng (dùng khi thẻ script đã
 * tồn tại nhưng SDK chưa khởi động xong).
 */
const pollForFb = (resolve, attempts = 0) => {
    if (typeof window !== 'undefined' && window.FB) {
        resolve(window.FB);
        return;
    }
    if (attempts > 50) {
        // ~5 giây mà không có SDK dùng được: bỏ cuộc để giao diện dùng phương án dự phòng.
        resolve(null);
        return;
    }
    setTimeout(() => pollForFb(resolve, attempts + 1), 100);
};

/**
 * Tải Facebook JS SDK đúng một lần cho toàn bộ ứng dụng.
 *
 * Promise trả về không bao giờ bị reject: khi SDK bị chặn (ad-blocker,
 * offline, CSP...) nó sẽ resolve với `null` để bên gọi hiển thị phương án
 * dự phòng thay vì làm sập ứng dụng.
 */
export const loadFacebookSdk = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.resolve(null);
    }
    if (window.FB) {
        return Promise.resolve(window.FB);
    }
    if (sdkPromise) {
        return sdkPromise;
    }

    sdkPromise = new Promise((resolve) => {
        const appId = process.env.REACT_APP_FACEBOOK_APP_ID || '';

        // Một plugin khác có thể đã chèn SDK từ trước.
        if (document.getElementById(FB_SDK_ID)) {
            pollForFb(resolve);
            return;
        }

        window.fbAsyncInit = function () {
            try {
                window.FB.init({
                    appId,
                    xfbml: false,
                    version: FB_SDK_VERSION,
                });
            } catch (e) {
                // Bỏ qua lỗi khởi tạo: vẫn resolve với window.FB nếu có.
            }
            resolve(window.FB || null);
        };

        const script = document.createElement('script');
        script.id = FB_SDK_ID;
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.src = `${FB_SDK_SRC}#xfbml=1&version=${FB_SDK_VERSION}&appId=${appId}`;
        script.onerror = () => resolve(null);

        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        } else {
            document.body.appendChild(script);
        }

        // Lưới an toàn cho môi trường mà cả onload lẫn onerror đều không kích hoạt.
        setTimeout(() => resolve(window.FB || null), FB_SDK_TIMEOUT);
    });

    return sdkPromise;
};

export default loadFacebookSdk;
