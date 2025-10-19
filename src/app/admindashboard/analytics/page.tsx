import AdminDashboardLayout from "@/layout/admindashboard/AdminDashboardLayout";
import Analytics from "@/components/admindashboard/client/Analytics";

export default function AdminAnalyticsPage() {
  return (
    <AdminDashboardLayout 
      title="Analytics" 
      subtitle="View platform analytics and insights"
    >
      <Analytics />
    </AdminDashboardLayout>
  );
}
