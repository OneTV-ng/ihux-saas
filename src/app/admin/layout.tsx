import Navbar from "@/components/admin/navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (<div>
		<Navbar />
			<div className="flex min-h-screen bg-background">  
				
				
				<main className="flex-1 p-4 md:p-8 bg-background overflow-y-auto">
					{children}
				</main>
			</div>
		
</div>	);
}
