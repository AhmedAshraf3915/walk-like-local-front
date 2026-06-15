import { AlertCircle, Search, ShieldCheck, Users, X } from "lucide-react";
import {
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "@/features/admin/utils/adminConstants";
import {
  getInitials,
  getUserActions,
  pillClass,
} from "@/features/admin/utils/adminFormatters";

const StatCard = ({ icon: Icon, label, value, subtle }) => (
  <article className="rounded-2xl border border-[#dbd9ee] bg-white px-5 py-4 shadow-[0_8px_22px_rgba(28,22,74,0.08)]">
    <div className="flex items-center gap-3">
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl ${subtle}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#666387]">
          {label}
        </p>
        <p className="text-2xl font-bold text-[#1a1a4f]">{value}</p>
      </div>
    </div>
  </article>
);

const AdminUsersView = ({
  stats,
  statsLoading,
  usersMeta,
  usersSearch,
  setUsersSearch,
  usersRoleFilter,
  setUsersRoleFilter,
  usersStatusFilter,
  setUsersStatusFilter,
  onSearchUsers,
  usersError,
  users,
  usersLoading,
  usersActionLoadingId,
  onUserAction,
  setUsersPage,
}) => {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={statsLoading ? "..." : stats.total}
          subtle="bg-[#ecebfb] text-[#302f8a]"
        />
        <StatCard
          icon={ShieldCheck}
          label="Active"
          value={statsLoading ? "..." : stats.active}
          subtle="bg-[#e7f6d6] text-[#3b6f1b]"
        />
        <StatCard
          icon={AlertCircle}
          label="Suspended"
          value={statsLoading ? "..." : stats.suspended}
          subtle="bg-[#f7edd0] text-[#9d7e20]"
        />
        <StatCard
          icon={X}
          label="Banned"
          value={statsLoading ? "..." : stats.banned}
          subtle="bg-[#f8dada] text-[#b23030]"
        />
      </div>

      <article className="overflow-hidden rounded-[24px] border border-[#d9d8ea] bg-white shadow-[0_12px_28px_rgba(25,23,73,0.08)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e3f2] px-6 py-5">
          <div>
            <h2 className="text-3xl font-bold text-[#1a1a4f]">
              Registered Users
            </h2>
            <p className="text-sm text-[#67648a]">
              {usersMeta.totalItems} account(s)
            </p>
          </div>

          <form
            onSubmit={onSearchUsers}
            className="flex w-full flex-col gap-3 md:w-auto md:flex-row"
          >
            <div className="flex items-center gap-2 rounded-xl border border-[#cfcde5] bg-white px-3">
              <Search className="h-4 w-4 text-[#737091]" />
              <input
                value={usersSearch}
                onChange={(event) => setUsersSearch(event.target.value)}
                placeholder="Search by name or email"
                className="h-10 min-w-56 border-none text-sm text-[#22205e] outline-none"
              />
            </div>

            <select
              value={usersRoleFilter}
              onChange={(event) => {
                setUsersRoleFilter(event.target.value);
                setUsersPage(1);
              }}
              className="h-10 rounded-xl border border-[#cfcde5] bg-white px-3 text-sm text-[#22205e]"
            >
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All roles" : option}
                </option>
              ))}
            </select>

            <select
              value={usersStatusFilter}
              onChange={(event) => {
                setUsersStatusFilter(event.target.value);
                setUsersPage(1);
              }}
              className="h-10 rounded-xl border border-[#cfcde5] bg-white px-3 text-sm text-[#22205e]"
            >
              {USER_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All status" : option}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="h-10 rounded-xl bg-[#1d1b72] px-4 text-sm font-semibold text-white"
            >
              Search
            </button>
          </form>
        </header>

        {usersError ? (
          <div className="px-6 py-6 text-sm text-[#a42f2f]">{usersError}</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#f1f0f8] text-left text-sm text-[#252368]">
              <tr>
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Full name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Date joined</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecebf7]">
              {usersLoading ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-[#6d6a90]" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-[#6d6a90]" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="text-sm text-[#1d1b59]">
                    <td className="px-6 py-5 font-semibold">
                      {String(user.id).slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#080a8f] text-base font-bold text-white">
                          {getInitials(user.fullName)}
                        </span>
                        <div>
                          <p className="text-xl leading-tight font-semibold text-[#1a194f]">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-[#66638a]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-[#deddf0] px-4 py-1 text-lg font-semibold text-[#272479]">
                        {user.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-2xl font-semibold text-[#222058]">
                      {user.joinedAt}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-4 py-1 text-lg font-semibold ${pillClass(user.status)}`}
                      >
                        {user.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {getUserActions(user.status).map((actionType) => (
                          <button
                            key={actionType}
                            type="button"
                            disabled={usersActionLoadingId === user.id}
                            onClick={() => {
                              void onUserAction(user, actionType);
                            }}
                            className="rounded-full border border-[#d4d2e8] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#2f2d73] hover:bg-[#f7f7fd] disabled:opacity-50"
                          >
                            {usersActionLoadingId === user.id
                              ? "..."
                              : actionType}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-[#e8e7f3] px-6 py-4 text-sm text-[#5f5b84]">
          <p>
            Page {usersMeta.page} of {usersMeta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={usersMeta.page <= 1 || usersLoading}
              onClick={() =>
                setUsersPage((current) => Math.max(1, current - 1))
              }
              className="rounded-lg border border-[#d3d1e7] px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={usersMeta.page >= usersMeta.totalPages || usersLoading}
              onClick={() =>
                setUsersPage((current) =>
                  Math.min(usersMeta.totalPages || 1, current + 1),
                )
              }
              className="rounded-lg border border-[#d3d1e7] px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </footer>
      </article>
    </section>
  );
};

export default AdminUsersView;
