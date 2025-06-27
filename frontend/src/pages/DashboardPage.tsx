import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import Dashboard from './Dashboard';

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <Dashboard />
    </AuthenticatedLayout>
  );
}
