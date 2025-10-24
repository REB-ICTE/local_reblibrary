import { h } from "preact";
import Sidebar from "./components/shared/Sidebar";
import Dashboard from "./components/admin/Dashboard";
import { statsSignal } from "./store";
import { getAdminMenuItems } from "./config/admin-menu";
import { getLibraryMenuItems } from "./config/library-menu";

export default function App() {
	// Get menu items from configuration
	const adminMenuItems = getAdminMenuItems('dashboard');
	const libraryMenuItems = getLibraryMenuItems();

	return (
		<div className="flex min-h-screen bg-white">
			<Sidebar adminMenuItems={adminMenuItems} libraryMenuItems={libraryMenuItems} />
			<main className="flex-1 overflow-y-auto">
				<Dashboard stats={statsSignal.value} />
			</main>
		</div>
	);
}
