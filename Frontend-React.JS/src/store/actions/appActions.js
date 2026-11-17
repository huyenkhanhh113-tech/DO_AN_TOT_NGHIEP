import actionTypes from './actionTypes';

export const appStartUpComplete = () => ({
    type: actionTypes.APP_START_UP_COMPLETE
});

export const setContentOfConfirmModal = (contentOfConfirmModal) => ({
    type: actionTypes.SET_CONTENT_OF_CONFIRM_MODAL,
    contentOfConfirmModal: contentOfConfirmModal
});

export const changeSysMenuPathApp = (systemMenuPath) => ({
    type: actionTypes.CHANGE_SYSTEM_MENU_PATH,
    systemMenuPath: systemMenuPath
})