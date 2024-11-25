import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import {
    XCircle,
    Menu,
    LayoutDashboard,
    SquareUser,
    Settings,
    Heater,
    BarChart2,
    ReceiptText,
    LandPlot,
    MessageSquareDot,
    LogOut,
    Leaf,
    ChevronDown,
    ChevronUp,
    Telescope,
    CircleDollarSign,
    PiggyBank
} from "lucide-react";

import { useSelector } from "react-redux";

const menuItems = [
    { icon: LayoutDashboard, label: "Bảng điều khiển", path: "/" },
    { icon: Leaf, label: "Chiến dịch gây quỹ", path: "/campaigns" },
    {
        icon: BarChart2,
        label: "Tài chính",
        path: "/finance",
        subItems: [
            { icon: PiggyBank, label: "Quỹ chung", path: "/funds" },
            { icon: ReceiptText, label: "Giao dịch", path: "/finance/transactions" },
            { icon: CircleDollarSign, label: "Giải ngân", path: "/disbursement-requests" },
        ]
    },
    { icon: SquareUser, label: "Người dùng", path: "/users" },
    { icon: Heater, label: "Trung tâm Quản trị", path: "/center" },
    { icon: Settings, label: "Cài đặt", path: "/settings" },
    { icon: Telescope, label: "Chuyến thăm", path: "/visits" },
    { icon: LogOut, label: "Đăng xuất", path: "/logout" },
];

const SidebarAdmin = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(null);
    const sideBarRef = useRef(null);

    const { user } = useSelector((state) => state.auth);

    // Filter menu items based on the user's role
    const filteredMenuItems =
        user?.role.toLowerCase() === "childmanager"
            ? menuItems.filter((item) =>
                ["Bảng điều khiển", "Chiến dịch gây quỹ", "Chuyến thăm"].includes(item.label)
            )
            : menuItems;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleDropdown = (label) => {
        setOpenDropdown(openDropdown === label ? null : label);
    };

    return (
        <>
            {!isSidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-4 left-4 md:hidden z-50 bg-white dark:bg-gray-950 p-2 rounded-md shadow-md"
                >
                    <Menu size={24} />
                </button>
            )}

            <div
                ref={sideBarRef}
                className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-950 border-r border-gray-300 dark:border-gray-700 p-6 
                    shadow-xl transition-all duration-300 ease-in-out z-40
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)]
                `}
            >
                <div className="flex flex-col h-full">
                    <div className="text-right mb-4">
                        <button onClick={toggleSidebar} className="md:hidden">
                            <XCircle size={24} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <p className="uppercase text-xs text-gray-600 mb-4 mt-4 tracking-wider">Quản lý</p>
                        {filteredMenuItems.map((item, index) => (
                            <div key={index}>
                                {item.subItems ? (
                                    <div>
                                        <button
                                            onClick={() => toggleDropdown(item.label)}
                                            className="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition duration-200"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>{<item.icon size={16} />}</span>
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </div>
                                            {openDropdown === item.label ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {openDropdown === item.label && (
                                            <div className="ml-6 mt-2 space-y-2">
                                                {item.subItems.map((subItem, subIndex) => (
                                                    <SidebarLink
                                                        key={subIndex}
                                                        path={subItem.path}
                                                        icon={<subItem.icon size={14} />}
                                                        label={subItem.label}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <SidebarLink
                                        path={item.path}
                                        icon={<item.icon size={16} />}
                                        label={item.label}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

const SidebarLink = ({ path, icon, label }) => (
    <NavLink
        to={path}
        className={({ isActive }) =>
            `flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition duration-200 ${isActive ? "text-teal-600 dark:text-teal-400 font-bold" : ""
            }`
        }
    >
        <span>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
    </NavLink>
);

export default SidebarAdmin;
