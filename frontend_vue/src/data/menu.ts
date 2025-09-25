interface MenuItem {
  name: string;
  to?: string;
  icon?: string;
  subActivePaths?: string;
  sub?: MenuItem[];
  heading?: boolean;
  badge?: number;
  'badge-variant'?: string;
  target?: string;
  permission?: string; // Thêm field permission cho menu item
}

interface MenuData {
  main: MenuItem[];
  boxed?: MenuItem[];
  demo?: MenuItem[];
}

const menuData: MenuData = {
  main: [
    {
      name: "Dashboard",
      to: "backend-dashboard",
      icon: "si si-speedometer",
      // Dashboard không cần permission đặc biệt
    },
    {
      name: "Quản lý App bệnh nhân",
      icon: "si si-calendar",
      subActivePaths: "/backend/appointments",
      permission: "access_menu_appointment", // Menu cha cần permission
      sub: [
        {
          name: "Danh mục",
          subActivePaths: "/backend/appointments/categories",
          permission: "access_menu_appointment",
          sub: [
            {
              name: "Chuyên khoa",
              to: "backend-specialties",
              permission: "access_menu_appointment",
            },
            {
              name: "Chức danh",
              to: "backend-title",
              permission: "access_menu_appointment",
            },
            {
              name: "Chức danh - Bác sĩ",
              to: "backend-doctor-title",
              permission: "access_menu_appointment",
            },
            {
              name: "PK - Chuyên khoa",
              to: "backend-clinic-specialty",
              permission: "access_menu_appointment",
            },
            {
              name: "Người dùng",
              to: "backend-users",
              permission: "access_menu_user",
            },
          ]
        },
        {
          name: "Quản lý lịch khám",
          to: "backend-appointment-slots",
          permission: "access_menu_appointment",
        },
        {
          name: "Quản lý BN đặt lịch",
          to: "backend-appointment-management",
          permission: "access_menu_appointment",
        },
        {
          name: "Import lịch khám (Excel)",
          to: "backend-import-appointment-slots",
          permission: "access_menu_appointment",
        },
      ],
    },
    {
      name: "Quản lý xếp hàng",
      icon: "si si-calendar",
      subActivePaths: "/backend/queue",
      permission: "access_menu_queue",
      sub: [
        {
          name: "Danh mục",
          subActivePaths: "/backend/queue",
          permission: "access_menu_queue",
          sub: [
            {
              name: "Phòng xếp số",
              to: "backend-queue-room",
              permission: "access_menu_queue",
            },
            {
              name: "Phòng xếp số - Thực hiện",
              to: "backend-queue-clinic-room",
              permission: "access_menu_queue",
            },
          ]
        },
        {
          name: "Quản lý xếp hàng",
          to: "backend-queue-ticket",
          permission: "access_menu_queue",
        }
      ],
    },
    {
      name: "Khảo sát hài lòng",
      to: "backend-satisfaction-survey",
      icon: "si si-star",
      permission: "access_menu_survey",
    },
    {
      name: "Quản trị hệ thống",
      icon: "si si-settings",
      permission: "access_menu_super_admin",
      sub: [
        {
          name: "Phân quyền - vai trò",
          to: "backend-permission-role",
          icon: "si si-shield",
          permission: "access_menu_super_admin",
        },
        {
          name: "Vai trò - người dùng",
          to: "backend-role-user",
          icon: "si si-users",
          permission: "access_menu_super_admin",
        },
      ],
    },
    
  ],
};

// Function để lọc menu dựa trên permissions
// Sử dụng callback function để tránh circular dependency
export function getFilteredMenu(hasPermissionFn?: (permission: string) => boolean): MenuData {
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Nếu item có permission, kiểm tra quyền
      if (item.permission && hasPermissionFn) {
        const hasPermission = hasPermissionFn(item.permission);
        if (!hasPermission) {
          return false;
        }
      }
      
      // Nếu có sub menu, lọc sub menu trước
      if (item.sub) {
        item.sub = filterMenuItems(item.sub);
        // Chỉ hiển thị item cha nếu có ít nhất 1 sub item
        return item.sub.length > 0;
      }
      
      return true;
    });
  };
  
  return {
    ...menuData,
    main: filterMenuItems(menuData.main)
  };
}

export default menuData; 