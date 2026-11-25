import { USER_ROLE } from '../../utils';

/**
 * Cấu hình menu sidebar cho khu vực quản trị.
 *
 * LƯU Ý: trước đây `name` là khoá dịch (ví dụ 'menu.admin.clinic') và được
 * <FormattedMessage> tra ra tiếng Việt/tiếng Anh. Nay đã bỏ cơ chế chuyển
 * ngôn ngữ nên `name` chính là chuỗi tiếng Việt hiển thị trực tiếp.
 *
 * Cấu trúc một nhóm menu:
 *   {
 *     name: 'Tên nhóm',                 // tiêu đề nhóm (in đậm)
 *     menus: [
 *       { name: 'Tên mục', link: '/duong-dan' },
 *       { name: 'Tên mục cha', subMenus: [ { name, link } ] }  // nếu có menu con
 *     ]
 *   }
 */

// Menu dành cho tài khoản QUẢN TRỊ VIÊN (roleId = R1)
export const adminMenu = [
    { // Nhóm: quản lý người dùng
        name: 'Người dùng hệ thống',
        menus: [
            {
                name: 'Quản lý người dùng', link: '/system/user-manage',
            },
            {
                name: 'Quản lý bác sĩ', link: '/system/manage-doctor',
            },
            { // Quản lý kế hoạch khám bệnh của bác sĩ
                name: 'Quản lý kế hoạch khám bệnh', link: '/doctor/manage-schedule',
            }
        ]
    },
    { // Nhóm: quản lý phòng khám
        name: 'Phòng khám',
        menus: [
            {
                name: 'Quản lý phòng khám', link: '/system/manage-clinic',
            },
        ]
    },
    { // Nhóm: quản lý chuyên khoa
        name: 'Chuyên khoa',
        menus: [
            {
                name: 'Quản lý chuyên khoa', link: '/system/manage-specialty',
            },
        ]
    },
    { // Nhóm: quản lý cẩm nang
        name: 'Cẩm nang',
        menus: [
            {
                name: 'Quản lý cẩm nang', link: '/system/manage-handbook',
            },
        ]
    },
    { // Nhóm: quản lý khu vực trang chủ (banner + ô dịch vụ)
        name: 'Trang chủ',
        menus: [
            {
                name: 'Quản lý trang chủ', link: '/system/manage-homepage',
                role: USER_ROLE.ADMIN,
            },
        ]
    },
];

// Menu dành cho tài khoản BÁC SĨ (roleId = R2)
export const doctorMenu = [
    {
        name: 'Quản lý lịch trình',
        menus: [
            { // Quản lý kế hoạch khám bệnh của bác sĩ
                name: 'Quản lý kế hoạch khám bệnh', link: '/doctor/manage-schedule',
            },
            { // Quản lý bệnh nhân khám bệnh
                name: 'Quản lý bệnh nhân khám bệnh', link: '/doctor/manage-patient',
            }
        ]
    }
];
