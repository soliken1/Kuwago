
import AdminDashboardLayout from "@/layout/admindashboard/AdminDashboardLayout";
import Overview from "@/components/admindashboard/client/Overview";

export default function AdminDashboard() {
  return (
    <AdminDashboardLayout 
      title="Admin Dashboard" 
      subtitle="Welcome to your admin dashboard"
    >
      <Overview />
    </AdminDashboardLayout>
  );
}
