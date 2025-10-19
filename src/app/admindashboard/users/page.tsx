import AdminDashboardLayout from "@/layout/admindashboard/AdminDashboardLayout";
import Users from "@/components/admindashboard/client/Users";

export default function AdminUsersPage() {
  return (
    <AdminDashboardLayout 
      title="Users Management" 
      subtitle="Manage user accounts and permissions"
    >
      <Users />
    </AdminDashboardLayout>
  );
}
