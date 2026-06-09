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

const getErrorMessage = (error, fallbackMessage) => {
	const responseMessage =
		error?.response?.data?.message ??
		error?.response?.data?.error ??
		error?.message;

	if (typeof responseMessage === "string" && responseMessage.trim()) {
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

const normalizeRoleForApi = (role) => {
	if (typeof role !== "string") {
		return role;
	}

	const normalizedRole = role.trim().toUpperCase();

	return normalizedRole || role;
};

const getGoogleAuthUrl = (nextPath = "/test", options = {}) => {
	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

	if (!apiBaseUrl) {
		throw new Error("VITE_API_BASE_URL is not configured.");
	}

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
	if (!role || typeof role !== "string") {
		throw new Error("Role is required for Google sign up.");
	}

	return getGoogleAuthUrl(nextPath, {
		role,
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
	resendVerificationEmail: (email) =>
		postWithMessage(
			"/auth/resend-verification-email",
			{ email },
			"Unable to resend verification email. Please try again.",
		),
	register: (data) => apiClient.post("/auth/register", data),
	login: (data) => apiClient.post("/auth/login", data),
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
