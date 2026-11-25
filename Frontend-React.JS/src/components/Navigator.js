import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import './Navigator.scss';

/**
 * Menu điều hướng dọc (sidebar) của khu vực quản trị.
 *
 * Cấu trúc dữ liệu `menus` (xem `containers/Header/menuApp.js`):
 *   [{ name, menus: [{ name, link, subMenus: [{ name, link }] }] }]
 * tức 3 cấp: NHÓM -> MENU -> MENU CON.
 *
 * - Ai dùng: `containers/Header/Header.js` (truyền `menus={this.state.menuApp}`).
 * - Bảng: không truy cập DB (dữ liệu menu là hằng số ở frontend).
 *
 * File gồm 4 thành phần:
 *   MenuGroup  - khối tiêu đề nhóm menu
 *   Menu       - một mục menu (có thể có menu con)
 *   SubMenu    - một mục menu con
 *   Navigator  - khung tổng, quản lý trạng thái mở/đóng và tô sáng mục đang active
 */

/**
 * MenuGroup — khối tiêu đề nhóm menu (ví dụ "Quản lý người dùng").
 *
 * - Ai dùng: `Navigator.render()` (bọc các `Menu` bên trong).
 * - Trả về: JSX `<li className="menu-group">` gồm tên nhóm + danh sách menu con.
 */
class MenuGroup extends Component {

    render() {
        const { name, children } = this.props;
        return (
            <li className="menu-group">
                <div className="menu-group-name">
                    {name}
                </div>
                <ul className="menu-list list-unstyled">
                    {children}
                </ul>
            </li>
        );
    }
}

/**
 * Menu — một mục menu cấp 2.
 *
 * Nếu có `subMenus` thì render dạng nút bấm mở/đóng (có mũi tên bên phải);
 * nếu không thì render thành `Link` điều hướng thẳng.
 *
 * - Ai dùng: `Navigator.render()`.
 * - Trả về: JSX `<li className="menu ...">`.
 */
class Menu extends Component {

    render() {
        const { name, active, link, children, onClick, hasSubMenu, onLinkClick } = this.props;
        return (
            <li className={"menu" + (hasSubMenu ? " has-sub-menu" : "") + ("") + (active ? " active" : "")}>
                {hasSubMenu ? (
                    <Fragment>
                        <span
                            data-toggle="collapse"
                            className={"menu-link collapsed"}
                            onClick={onClick}
                            aria-expanded={"false"}
                        >
                            {name}
                            <div className="icon-right">
                                <i className={"far fa-angle-right"} />
                            </div>
                        </span>
                        <div>
                            <ul className="sub-menu-list list-unstyled">
                                {children}
                            </ul>
                        </div>
                    </Fragment>
                ) : (
                        <Link to={link} className="menu-link" onClick={onLinkClick}>
                            {name}
                        </Link>
                    )}
            </li>
        );
    }
}

/**
 * SubMenu — một mục menu cấp 3 (menu con).
 *
 * - Ai dùng: `Navigator.render()` (render bên trong `Menu`).
 * - Trả về: JSX `<li className="sub-menu">` kèm class `active` khi đúng route.
 */
class SubMenu extends Component {

    /**
     * Xác định class `active` cho menu con dựa trên route hiện tại.
     *
     * - Ai gọi: `render()` của component này.
     * - Trả về: **chuỗi** `"active"` nếu `path` trùng đường dẫn hiện tại, ngược lại `""`.
     */
    getItemClass = path => {
        return this.props.location.pathname === path ? "active" : "";
    };

    render() {
        const { name, link, onLinkClick } = this.props;
        return (
            <li className={"sub-menu " + this.getItemClass(link)}>
                <Link to={link} className="sub-menu-link" onClick={onLinkClick}>
                    {name}
                </Link>
            </li>
        );
    }
}

const MenuGroupWithRouter = withRouter(MenuGroup);
const MenuWithRouter = withRouter(Menu);
const SubMenuWithRouter = withRouter(SubMenu);

/**
 * HOC bọc `withRouter` + chuyển tiếp `ref` xuống component bên trong.
 *
 * - Ai dùng: dòng export cuối file (`withRouterInnerRef(connect(...)(Navigator))`).
 * - Trả về: component mới có thể nhận `ref` từ bên ngoài (dùng để gọi
 *   các phương thức của `Navigator`).
 *
 * Cần thiết vì `withRouter` mặc định chặn `ref`.
 */
const withRouterInnerRef = (WrappedComponent) => {

    class InnerComponentWithRef extends React.Component {
        render() {
            const { forwardRef, ...rest } = this.props;
            return <WrappedComponent {...rest} ref={forwardRef} />;
        }
    }

    const ComponentWithRef = withRouter(InnerComponentWithRef, { withRef: true });

    return React.forwardRef((props, ref) => {
        return <ComponentWithRef {...props} forwardRef={ref} />;
    });
};

class Navigator extends Component {
    state = {
        expandedMenu: {}
    };

    /**
     * Mở/đóng menu con của một mục menu (chỉ mở được 1 mục tại một thời điểm).
     *
     * - Ai gọi: `onClick` của `Menu` trong `render()`.
     * - Trả về: không trả dữ liệu (chỉ `setState`).
     *
     * State `expandedMenu` dùng khoá dạng `"<groupIndex>_<menuIndex>"`.
     */
    toggle = (groupIndex, menuIndex) => {
        const expandedMenu = {};
        const needExpand = !(this.state.expandedMenu[groupIndex + '_' + menuIndex] === true);
        if (needExpand) {
            expandedMenu[groupIndex + '_' + menuIndex] = true;
        }

        this.setState({
            expandedMenu: expandedMenu
        });
    };

    /**
     * Kiểm tra một menu (hoặc menu con của nó) có đang là route hiện tại không.
     *
     * - Ai gọi: `checkActiveMenu()`, `render()`.
     * - Trả về: **boolean** — `true` nếu đường dẫn hiện tại trùng `link` của menu
     *   hoặc trùng `link` của một menu con.
     *
     * Dùng để tô sáng (class `active`) mục menu tương ứng với trang đang mở.
     */
    isMenuHasSubMenuActive = (location, subMenus, link) => {
        if (subMenus) {
            if (subMenus.length === 0) {
                return false;
            }

            const currentPath = location.pathname;
            for (let i = 0; i < subMenus.length; i++) {
                const subMenu = subMenus[i];
                if (subMenu.link === currentPath) {
                    return true;
                }
            }
        }

        if (link) {
            return this.props.location.pathname === link;
        }

        return false;
    };

    checkActiveMenu = () => {
        const { menus, location } = this.props;
        outerLoop:
        for (let i = 0; i < menus.length; i++) {
            const group = menus[i];
            if (group.menus && group.menus.length > 0) {
                for (let j = 0; j < group.menus.length; j++) {
                    const menu = group.menus[j];
                    if (menu.subMenus && menu.subMenus.length > 0) {
                        if (this.isMenuHasSubMenuActive(location, menu.subMenus, null)) {
                            const key = i + '_' + j;
                            this.setState({
                                expandedMenu: {
                                    [key]: true
                                }
                            });
                            break outerLoop;
                        }
                    }
                }
            }
        }
    };

    componentDidMount() {
        this.checkActiveMenu();
    };

    componentDidUpdate(prevProps, prevState) {
        const { location } = this.props;
        const { location: prevLocation } = prevProps;
        if (location !== prevLocation) {
            this.checkActiveMenu();
        };
    };

    render() {
        const { menus, location, onLinkClick } = this.props;
        return (
            <Fragment>
                <ul className="navigator-menu list-unstyled">
                    {
                        menus.map((group, groupIndex) => {
                            return (
                                <Fragment key={groupIndex}>
                                    <MenuGroupWithRouter name={group.name}>
                                        {group.menus ? (
                                            group.menus.map((menu, menuIndex) => {
                                                const isMenuHasSubMenuActive = this.isMenuHasSubMenuActive(location, menu.subMenus, menu.link);
                                                const isSubMenuOpen = this.state.expandedMenu[groupIndex + '_' + menuIndex] === true;
                                                return (
                                                    <MenuWithRouter
                                                        key={menuIndex}
                                                        active={isMenuHasSubMenuActive}
                                                        name={menu.name}
                                                        link={menu.link}
                                                        hasSubMenu={menu.subMenus}
                                                        isOpen={isSubMenuOpen}
                                                        onClick={() => this.toggle(groupIndex, menuIndex)}
                                                        onLinkClick={onLinkClick}
                                                    >
                                                        {menu.subMenus && menu.subMenus.map((subMenu, subMenuIndex) => (
                                                            <SubMenuWithRouter
                                                                key={subMenuIndex}
                                                                name={subMenu.name}
                                                                link={subMenu.link}
                                                                onClick={this.closeOtherExpand}
                                                                onLinkClick={onLinkClick}
                                                            />
                                                        ))}
                                                    </MenuWithRouter>
                                                );
                                            })
                                        ) : null}
                                    </MenuGroupWithRouter>
                                </Fragment>
                            );
                        })
                    }
                </ul>
            </Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    }
}

export default withRouterInnerRef(connect(mapStateToProps, mapDispatchToProps)(Navigator));
