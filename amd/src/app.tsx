import { h } from "preact";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import { statsSignal } from "./store";

export default function App() {
	// Mock data for admin menu
	const adminMenuItems = [
		{ name: "Dashboard", url: "#", icon: "fa fa-tachometer-alt", active: true },
		{ name: "Education Structure", url: "#", icon: "fa fa-graduation-cap", active: false },
		{ name: "Resources", url: "#", icon: "fa fa-book", active: false },
		{ name: "Categories", url: "#", icon: "fa fa-tags", active: false },
		{ name: "Assignments", url: "#", icon: "fa fa-link", active: false },
	];

	// Mock data for library menu
	const libraryMenuItems = [
		{ name: "Top Books", url: "#", icon: "fa fa-star", active: false },
		{ name: "Discover", url: "#", icon: "fa fa-compass", active: false },
		{ name: "Categories", url: "#", icon: "fa fa-th-large", active: false },
	];

	return (
		<div className="flex min-h-screen bg-white">
			<Sidebar adminMenuItems={adminMenuItems} libraryMenuItems={libraryMenuItems} />
			<main className="flex-1 overflow-y-auto">
				<Dashboard stats={statsSignal.value} />
			</main>
		</div>
	);
}
