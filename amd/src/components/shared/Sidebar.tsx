import { h } from "preact";

interface MenuItem {
    name: string;
    url: string;
    icon: string;
    active?: boolean;
}

interface SidebarProps {
    adminMenuItems: MenuItem[];
    libraryMenuItems: MenuItem[];
}

export default function Sidebar({ adminMenuItems, libraryMenuItems }: SidebarProps) {
    return (
        <aside className="w-56 bg-gray-50 border-r border-gray-200 py-6 pr-4">
            {/* Library Menu Section */}
            <div className="mb-8">
                <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Library Menu
                </h6>
                <ul className="space-y-2 m-0 p-0">
                    {libraryMenuItems.map((item, index) => (
                        <li key={index}>
                            <a
                                href={item.url}
                                className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
                                    item.active
                                        ? "bg-reb-blue text-white"
                                        : "text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <i className={`${item.icon} w-5 mr-3`}></i>
                                <span>{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Admin Menu Section */}
            <div className="mb-8">
                <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Admin Menu
                </h6>
                <ul className="space-y-2 m-0 p-0">
                    {adminMenuItems.map((item, index) => (
                        <li key={index}>
                            <a
                                href={item.url}
                                className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
                                    item.active
                                        ? "bg-reb-blue text-white"
                                        : "text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                <i className={`${item.icon} w-5 mr-3`}></i>
                                <span>{item.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

        </aside>
    );
}
