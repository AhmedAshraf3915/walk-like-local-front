import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import AdminUsersView from "@/features/admin/components/AdminUsersView";
import AdminVerificationView from "@/features/admin/components/AdminVerificationView";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { useAdminVerification } from "@/features/admin/hooks/useAdminVerification";
import { TABS } from "@/features/admin/utils/adminConstants";

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState(TABS.verification);

  const verification = useAdminVerification();
  const users = useAdminUsers({ enabled: activeTab === TABS.users });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#ecebfb_0%,#f6f5fb_42%,#f0eff9_100%)] text-[#1c1a52]">
      <header className="sticky top-0 z-20 border-b border-[#dfdeed] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="grid h-14 w-14 place-items-center rounded-full border border-[#d8d7ea] bg-[#eff0f9]"
            >
              <Menu className="h-6 w-6 text-[#1c1a73]" />
            </button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2f2c7e]">
                Admin Console
              </p>
              <h1 className="text-5xl font-bold leading-none text-[#111169]">
                {activeTab === TABS.verification
                  ? "Verification"
                  : "User Management"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-[#d2d0e5] bg-white px-3 py-2 md:flex">
              <Search className="h-4 w-4 text-[#77759a]" />
              <span className="text-sm text-[#757398]">Search dashboard..</span>
            </div>
            <button
              type="button"
              className="grid h-12 w-12 place-items-center rounded-full border border-[#d8d7ea] bg-[#eff0f9]"
            >
              <Bell className="h-5 w-5 text-[#1c1a73]" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1680px] space-y-8 px-4 py-8 sm:px-6 lg:px-10">
        <div className="inline-flex rounded-full border border-[#cccbe2] bg-[#eeedf8] p-1">
          <button
            type="button"
            onClick={() => setActiveTab(TABS.verification)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === TABS.verification
                ? "bg-white text-[#232071] shadow"
                : "text-[#6d6a90]"
            }`}
          >
            Admin Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TABS.users)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === TABS.users
                ? "bg-white text-[#232071] shadow"
                : "text-[#6d6a90]"
            }`}
          >
            Admin User Management
          </button>
        </div>

        {activeTab === TABS.verification ? (
          <AdminVerificationView
            verificationType={verification.verificationType}
            setVerificationType={verification.setVerificationType}
            queue={verification.queue}
            queueLoading={verification.queueLoading}
            queueError={verification.queueError}
            selectedRecord={verification.selectedRecord}
            setSelectedRecordId={verification.setSelectedRecordId}
            recordDetails={verification.recordDetails}
            detailsLoading={verification.detailsLoading}
            detailsError={verification.detailsError}
            actionLoading={verification.actionLoading}
            rejectReason={verification.rejectReason}
            setRejectReason={verification.setRejectReason}
            rejectedFieldsText={verification.rejectedFieldsText}
            setRejectedFieldsText={verification.setRejectedFieldsText}
            onVerifyAction={verification.handleVerifyAction}
          />
        ) : (
          <AdminUsersView
            stats={users.stats}
            statsLoading={users.statsLoading}
            usersMeta={users.usersMeta}
            usersSearch={users.usersSearch}
            setUsersSearch={users.setUsersSearch}
            usersRoleFilter={users.usersRoleFilter}
            setUsersRoleFilter={users.setUsersRoleFilter}
            usersStatusFilter={users.usersStatusFilter}
            setUsersStatusFilter={users.setUsersStatusFilter}
            onSearchUsers={users.handleSearchUsers}
            usersError={users.usersError}
            users={users.users}
            usersLoading={users.usersLoading}
            usersActionLoadingId={users.usersActionLoadingId}
            onUserAction={users.handleUserAction}
            setUsersPage={users.setUsersPage}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
