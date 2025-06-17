import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NavItem } from "../../types/Types";
import procurementLogo from "../../assets/procurement_logo/procurement-logo.svg";
import {
  BellIcon,
  ClipboardIcon,
  DocumentTextIcon,
  HomeIcon,
  SettingsIcon,
  UserIcon,
} from "../../utils/Icons";
import Modal from "./Modal";
import NotificationContent from "../dashboard/NotificationContent";
import "./sidebarStyle.css";
import { INotificationItem } from "../../types/commonTypes";

interface SidebarProp{
  notifications:INotificationItem[];
  trigger:()=>void
}

const Sidebar = ({ notifications,trigger }: SidebarProp) => {
  const location = useLocation(); // Get current location
  const currentPath = location.pathname;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<string>("");

  // Navigation Items Configuration
  const navItems: NavItem[] = [
    { to: "/", title: "Dashboard", icon: HomeIcon },
    { to: "/rfps", title: "Requests", icon: ClipboardIcon },
    { to: "/vendors", title: "Vendors", icon: DocumentTextIcon },
    { to: "/settings/user-managment", title: "Settings", icon: SettingsIcon },
  ];

  const bottomItems: NavItem[] = [
    {
      to: "",
      title: "Notifications",
      icon: BellIcon,
      onClick: () => {
        setActiveIcon("Notifications");
        setIsModalOpen(true);
      },
    },
    { to: "/profile", title: "User Profile", icon: UserIcon },
  ];

  // Function to handle modal close - resets active icon to match current path
  const handleModalClose = () => {
    setIsModalOpen(false);

    // Reset the active icon based on current path
    updateActiveIconFromPath();
  };

  // Function to update active icon based on current path
  const updateActiveIconFromPath = () => {
    // Find which navigation item matches the current path
    for (const item of [...navItems, ...bottomItems]) {
      if (!item.to) continue;

      // Special case for settings - check if path starts with '/settings'
      if (item.title === "Settings" && currentPath.startsWith("/settings")) {
        setActiveIcon("Settings");
        return;
      }

      // Special case for spend_analysys - check if path starts with '/spend_analysys'
      if (item.title === "spend analysys" && currentPath.startsWith("/spend_analysys")) {
        setActiveIcon("spend analysys");
        return;
      }

      // Special case for requests - check if path starts with '/requests' or '/request'
      if (item.title === "Requests" && (currentPath.startsWith("/requests") || currentPath.startsWith("/request"))) {
        setActiveIcon("Requests");
        return;
      }

      // For other routes, exact match (or home route)
      if ((item.to === "/" && currentPath === "/") ||
        (item.to !== "/" && currentPath === item.to)) {
        setActiveIcon(item.title);
        return;
      }
    }
  };

  // Update active icon based on current path
  useEffect(() => {
    updateActiveIconFromPath();
  }, [currentPath]);

  //hide scroll-bar when modal open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  // Reusable Navigation Link Component
  const Nav_Link = ({
    to,
    title,
    icon: Icon,
    onClick,
  }: {
    to?: string;
    title: string;
    icon: React.ElementType;
    onClick?: () => void;
  }) => {
    // Determine if this nav item is active
    const isActive = activeIcon === title;

    // For settings, add special check for paths that start with /settings
    const isSettingsActive =
      title === "Settings" && currentPath.startsWith("/settings");

    // For spend_analysys, add special check for paths that start with /spend_analysys
    const isSpendAnalysysActive =
      title === "spend analysys" && currentPath.startsWith("/spend_analysys");

    // For requests, add special check for paths that start with /requests or /request
    const isRequestsActive =
      title === "Requests" && (currentPath.startsWith("/requests") || currentPath.startsWith("/request"));

    const handleClick = () => {
      if (onClick) onClick();
    };

    if (!to) {
      return (
        <button
          title={title}
          onClick={handleClick}
          className={`flex justify-center w-[38px] h-[38px] items-center px-2 py-1 ${isActive ? "bg-customBlue text-white" : "text-black"
            } hover:bg-customBlue hover:text-white rounded-md transition-colors duration-100 group`}
        >
          <Icon className={`w-[26px] h-[26px] ${isActive ? "stroke-white" : "stroke-black group-hover:stroke-white"
            } transition-colors duration-100`} />
        </button>
      );
    }

    // For settings, spend analysys, and requests, use custom isActive logic
    if (title === "Settings" || title === "spend analysys" || title === "Requests") {
      return (
        <NavLink
          to={to}
          title={title}
          onClick={handleClick}
          className={({ isActive }) =>
            `flex justify-center items-center w-[38px] h-[38px] px-2 py-1 ${isActive || isSettingsActive || isSpendAnalysysActive || isRequestsActive
              ? "bg-customBlue text-white"
              : "text-black"
            } hover:bg-customBlue hover:text-white rounded-md transition-colors duration-100 group`
          }
        >
          <Icon className={`w-[26px] h-[26px] ${isActive || isSettingsActive || isSpendAnalysysActive || isRequestsActive
            ? "stroke-white"
            : "stroke-black group-hover:stroke-white"
            } transition-colors duration-100`} />
        </NavLink>
      );
    }

    // For other nav items
    return (
      <NavLink
        to={to}
        title={title}
        onClick={handleClick}
        className={({ isActive }) =>
          `flex justify-center items-center w-[38px] h-[38px] px-2 py-1 ${isActive ? "bg-customBlue text-white" : "text-black"
          } hover:bg-customBlue hover:text-white rounded-md transition-colors duration-100 group`
        }
      >
        <Icon className={`w-[26px] h-[26px] ${isActive ? "stroke-white" : "stroke-black group-hover:stroke-white"
          } transition-colors duration-100`} />
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <main
        id="sidebar-main"
        className="flex w-[78px] z-10 h-screen fixed left-0 top-0 border-r flex-col items-center justify-between"
      >
        <section className="space-y-2">
          {/* Logo */}
          <div className="my-[32px] flex items-center justify-center">
            <img src={procurementLogo} alt="Logo" className="w-[34px] h-[34px]" />
          </div>

          {/* Navigation Links */}
          {navItems.map(({ to, title, icon }) => (
            <Nav_Link key={title} to={to} title={title} icon={icon} />
          ))}
        </section>

        {/* Bottom Section */}
        <section className="space-y-2">
          {bottomItems.map(({ to, title, icon, onClick }) => (
            (title == "Notifications" && notifications.some(n=>n.isRead == false)) ?
              <div className="relative inline-block">
                <Nav_Link key={title} to={to} title={title} icon={icon} onClick={onClick} />
                <span className="absolute top-2 right-3 inline-flex items-center justify-center w-2 h-2 text-xs text-white bg-red-500 rounded-full -translate-y-1/2 translate-x-1/2">
                </span>
              </div>
              : <Nav_Link key={title} to={to} title={title} icon={icon} onClick={onClick} />
          ))}
        </section>
      </main>

      {/* Modal */}
      <Modal
        title="Notifications"
        modalPosition="end"
        content={<NotificationContent data={notifications} closeModal={handleModalClose} trigger={trigger} />}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        width="40%"
      />
    </>
  );
};

export default Sidebar;