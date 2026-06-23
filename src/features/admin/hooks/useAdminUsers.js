import { useEffect, useState } from "react";
import { adminApi } from "@/features/admin/api/adminApi";
import {
	getPaginationMeta,
	toArray,
} from "@/features/admin/utils/adminFormatters";
import { mapStats, mapUsers } from "@/features/admin/utils/adminMappers";

export const useAdminUsers = ({ enabled }) => {
	const [users, setUsers] = useState([]);
	const [usersMeta, setUsersMeta] = useState({
		page: 1,
		totalPages: 1,
		totalItems: 0,
	});
	const [usersLoading, setUsersLoading] = useState(true);
	const [usersError, setUsersError] = useState("");
	const [usersSearch, setUsersSearch] = useState("");
	const [usersStatusFilter, setUsersStatusFilter] = useState("ALL");
	const [usersRoleFilter, setUsersRoleFilter] = useState("ALL");
	const [usersPage, setUsersPage] = useState(1);
	const [usersActionLoadingId, setUsersActionLoadingId] = useState("");

	const [stats, setStats] = useState({
		total: 0,
		active: 0,
		banned: 0,
		suspended: 0,
	});
	const [statsLoading, setStatsLoading] = useState(true);

	const loadUsers = async () => {
		setUsersLoading(true);
		setUsersError("");

		try {
			const payload = await adminApi.getUsers({
				page: usersPage,
				limit: 10,
				status: usersStatusFilter === "ALL" ? undefined : usersStatusFilter,
				role: usersRoleFilter === "ALL" ? undefined : usersRoleFilter,
				search: usersSearch.trim() || undefined,
			});

			setUsers(mapUsers(payload));
			setUsersMeta(getPaginationMeta(payload, toArray(payload).length));
		} catch (error) {
			setUsersError(error.message ?? "Unable to load users.");
			setUsers([]);
		} finally {
			setUsersLoading(false);
		}
	};

	const loadStats = async () => {
		setStatsLoading(true);

		try {
			const payload = await adminApi.getUsersStats();
			setStats(mapStats(payload));
		} catch {
			setStats({ total: 0, active: 0, banned: 0, suspended: 0 });
		} finally {
			setStatsLoading(false);
		}
	};

	useEffect(() => {
		if (!enabled) return;
		queueMicrotask(() => {
			void loadUsers();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled, usersPage, usersStatusFilter, usersRoleFilter]);

	useEffect(() => {
		if (!enabled) return;
		queueMicrotask(() => {
			void loadStats();
		});
	}, [enabled]);

	const handleSearchUsers = async (event) => {
		event.preventDefault();
		setUsersPage(1);
		await loadUsers();
	};

	const handleUserAction = async (user, actionType) => {
		if (!user?.id) return;

		const requiresReason = actionType === "suspend" || actionType === "ban";
		const reason = requiresReason
			? window.prompt(
					`Provide a reason to ${actionType} ${user.fullName || "this user"}.`,
				)
			: "";

		if (requiresReason && !reason?.trim()) {
			setUsersError(`A reason is required to ${actionType} a user.`);
			return;
		}

		setUsersError("");
		setUsersActionLoadingId(user.id);

		try {
			if (actionType === "suspend") {
				await adminApi.suspendUser(user.id, { reason: reason.trim() });
			}
			if (actionType === "activate") await adminApi.activateUser(user.id);
			if (actionType === "ban") {
				await adminApi.banUser(user.id, { reason: reason.trim() });
			}
			if (actionType === "unban") await adminApi.unbanUser(user.id);

			await Promise.all([loadUsers(), loadStats()]);
		} catch (error) {
			setUsersError(error.message ?? "Unable to update user status.");
		} finally {
			setUsersActionLoadingId("");
		}
	};

	return {
		users,
		usersMeta,
		usersLoading,
		usersError,
		usersSearch,
		setUsersSearch,
		usersStatusFilter,
		setUsersStatusFilter,
		usersRoleFilter,
		setUsersRoleFilter,
		usersPage,
		setUsersPage,
		usersActionLoadingId,
		stats,
		statsLoading,
		handleSearchUsers,
		handleUserAction,
	};
};
