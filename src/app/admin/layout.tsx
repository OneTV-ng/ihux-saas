import DashboardSidebar from '@/components/admin/dashboard-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen bg-background">
				<DashboardSidebar />
				<main className="flex-1 p-4 md:p-8 bg-background overflow-y-auto">
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
