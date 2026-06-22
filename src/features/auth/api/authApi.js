import { apiClient } from "@/services/apiClient";

const appBaseUrl = import.meta.env.BASE_URL || "/";

const toAppUrl = (path) => {
	const normalizedBase = appBaseUrl.endsWith("/")
		? appBaseUrl
		: `${appBaseUrl}/`;
	const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

	return new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);
};

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

const extractServerMessage = (error) => {
	const candidate =
		error?.response?.data?.message ??
		error?.response?.data?.error ??
		error?.response?.data?.details ??
		error?.message;

	if (typeof candidate !== "string") {
		return "";
	}

	return candidate.trim();
};

const getErrorMessage = (error, fallbackMessage) => {
	const responseMessage = extractServerMessage(error);
	const statusCode = error?.response?.status;

	if (statusCode === 401) {
		return "Invalid email or password.";
	}

	if (statusCode === 403) {
		const normalizedMessage = responseMessage.toLowerCase();
		if (
			normalizedMessage.includes("verify") ||
			normalizedMessage.includes("verification") ||
			normalizedMessage.includes("unverified")
		) {
			return "Please verify your email first.";
		}

		return "Invalid email or password.";
	}

	if (responseMessage) {
		return responseMessage;
	}

	return fallbackMessage;
};

const postWithMessage = async (path, payload, fallbackMessage) => {
	try {
		const response = await apiClient.post(path, payload);

		return unwrapResponseData(response);
	} catch (error) {
		throw new Error(getErrorMessage(error, fallbackMessage), { cause: error });
	}
};

const extractCooldownSeconds = (error) => {
	const errorData = error?.response?.data ?? error?.cause?.response?.data ?? {};
	const explicitSeconds = Number(
		error?.cooldownSeconds ??
			errorData?.retryAfterSeconds ??
			errorData?.retryAfter ??
			errorData?.remainingSeconds,
	);

	if (Number.isFinite(explicitSeconds) && explicitSeconds > 0) {
		return Math.ceil(explicitSeconds);
	}

	const message = String(
		error?.message ??
			errorData?.message ??
			errorData?.error ??
			error?.cause?.message ??
			"",
	);
	const match = message.match(/wait\s+(\d+)\s+seconds?/i);

	return match ? Number(match[1]) : 0;
};

const formatCooldownDuration = (totalSeconds) => {
	const seconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;
	const parts = [];

	if (hours) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
	if (minutes) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
	if (remainingSeconds || parts.length === 0) {
		parts.push(
			`${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`,
		);
	}

	return parts.join(", ");
};

const resendVerificationEmail = async (email) => {
	try {
		return await postWithMessage(
			"/auth/resend-verification-email",
			{ email },
			"Unable to resend verification email. Please try again.",
		);
	} catch (error) {
		const cooldownSeconds = extractCooldownSeconds(error);

		if (!cooldownSeconds) throw error;

		const cooldownError = new Error(
			`A verification email is already active. You can request another in ${formatCooldownDuration(cooldownSeconds)}.`,
			{ cause: error },
		);
		cooldownError.cooldownSeconds = cooldownSeconds;
		throw cooldownError;
	}
};

const loginWithMessage = async (payload) => {
	try {
		return await apiClient.post("/auth/login", payload);
	} catch (error) {
		throw new Error(
			getErrorMessage(error, "Unable to sign in. Please try again."),
			{ cause: error }
		);
	}
};

const normalizeRoleForApi = (role) => {
	if (typeof role !== "string") {
		return role;
	}

	const normalizedRole = role.trim().toUpperCase();

	return normalizedRole || role;
};

const normalizeRoleForSignup = (role) => {
	if (typeof role !== "string") {
		return null;
	}

	const normalizedRole = role.trim().toLowerCase();

	if (normalizedRole !== "guide" && normalizedRole !== "tourist") {
		return null;
	}

	return normalizedRole;
};

const getValidatedApiBaseUrl = () => {
	const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

	if (!rawApiBaseUrl || typeof rawApiBaseUrl !== "string") {
		throw new Error(
			"Google authentication is unavailable right now. Please use email and password while we fix configuration."
		);
	}

	try {
		const parsedUrl = new URL(rawApiBaseUrl.trim());
		if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
			throw new Error("Unsupported protocol.");
		}

		return parsedUrl.toString().replace(/\/$/, "");
	} catch {
		throw new Error(
			"Google authentication is temporarily unavailable due to an invalid server URL configuration."
		);
	}
};

const getGoogleAuthUrl = (nextPath = "/test", options = {}) => {
	const apiBaseUrl = getValidatedApiBaseUrl();

	const callbackUrl = toAppUrl("auth/google/callback");
	const googleAuthUrl = new URL(`${apiBaseUrl}/auth/google`);
	const { role, mode } = options;

	callbackUrl.searchParams.set("next", nextPath);
	googleAuthUrl.searchParams.set("redirectUrl", callbackUrl.toString());
	googleAuthUrl.searchParams.set("frontendRedirectUrl", callbackUrl.toString());
	googleAuthUrl.searchParams.set("next", nextPath);

	if (role) {
		googleAuthUrl.searchParams.set("role", normalizeRoleForApi(role));
	}

	if (mode) {
		googleAuthUrl.searchParams.set("mode", mode);
	}

	return googleAuthUrl.toString();
};

const getGoogleSignupUrl = (role, nextPath = "/test") => {
	const normalizedRole = normalizeRoleForSignup(role);

	if (!normalizedRole) {
		throw new Error("Role is required for Google sign up.");
	}

	return getGoogleAuthUrl(nextPath, {
		role: normalizedRole,
		mode: "signup",
	});
};

const getGoogleSigninUrl = (nextPath = "/test") =>
	getGoogleAuthUrl(nextPath, {
		mode: "signin",
	});

export const authApi = {
	registerTourist: (data) =>
		postWithMessage(
			"/auth/register-tourist",
			data,
			"Unable to create tourist account. Please try again.",
		),
	registerGuide: (data) =>
		postWithMessage(
			"/auth/register-guide",
			data,
			"Unable to create guide account. Please try again.",
		),
	resendVerificationEmail,
	register: (data) => apiClient.post("/auth/register", data),
		login: (data) => loginWithMessage(data),
	verifyEmail: (token) => apiClient.get(`/auth/verify-email?token=${token}`),
	getGoogleAuthUrl,
	getGoogleSignupUrl,
	getGoogleSigninUrl,

	forgotPassword: (data) =>
		postWithMessage(
			"/auth/request-password-reset",
			data,
			"Unable to send reset code. Please try again.",
		),
	verifyOtp: (data) =>
		postWithMessage(
			"/auth/verify-reset-code",
			{ email: data.email, code: data.otp },
			"Invalid or expired code. Please try again.",
		),
	resetPassword: (data) =>
		postWithMessage(
			"/auth/reset-password",
			data,
			"Unable to reset password. Please try again.",
		),

	resendOtp: (data) =>
		postWithMessage(
			"/auth/resend-reset-code",
			data,
			"Unable to resend code. Please try again.",
		),
};
