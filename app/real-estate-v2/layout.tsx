import { DashboardLayout } from '@/components/DashboardLayout';

export default function RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
