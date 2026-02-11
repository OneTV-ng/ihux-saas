export default function AdminDashboard() {
  return (
    <section className="flex flex-col items-center justify-center h-full w-full text-center py-12">
      <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">Admin Dashboard</h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
        Welcome to the new Universal Music Hub Admin!<br />
        Use the sidebar to navigate between User Management, Reports, Settings, and more. This is a modern, mobile-first, interactive prototype.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer">
          <span className="block text-primary font-semibold mb-2">User Management</span>
          <span className="text-xs text-muted-foreground">Manage users, roles, permissions</span>
        </div>
        <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer">
          <span className="block text-primary font-semibold mb-2">Reports</span>
          <span className="text-xs text-muted-foreground">Analytics, logs, KPIs</span>
        </div>
        <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer">
          <span className="block text-primary font-semibold mb-2">Settings</span>
          <span className="text-xs text-muted-foreground">Admin preferences</span>
        </div>
        <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer">
          <span className="block text-primary font-semibold mb-2">More</span>
          <span className="text-xs text-muted-foreground">Explore all features</span>
        </div>
      </div>
    </section>
  );
}
