import React from 'react';
import ReactDOM from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';
import './styles/styles.scss';
import App from './containers/App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import reduxStore, { persistor } from './redux';

/**
 * Điểm khởi động của ứng dụng React.
 *
 * Trước đây App được bọc trong <IntlProviderWrapper> để hỗ trợ đa ngôn ngữ
 * (vi/en) qua react-intl. Nay đã bỏ cơ chế chuyển ngôn ngữ, toàn bộ giao diện
 * dùng tiếng Việt trực tiếp nên không cần wrapper này nữa.
 */
const renderApp = () => {
    ReactDOM.render(
        <Provider store={reduxStore}>
            <App persistor={persistor} />
        </Provider>,
        document.getElementById('root')
    );
};

renderApp();

serviceWorker.unregister();
