import Sidebar from "../../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="pt-14 lg:pl-[240px] lg:pt-0">
        <main className="min-h-screen p-6 sm:p-8">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>
    </>
  );
}
