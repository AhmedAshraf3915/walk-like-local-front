import axios from "axios";

const appBaseUrl = import.meta.env.BASE_URL || "/";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
	console.warn("VITE_API_BASE_URL is not set. API requests will fail at runtime.");
}

export const apiClient = axios.create({
	baseURL: apiBaseUrl,

	headers: {
		"Content-Type": "application/json",
	},

	timeout: 10000,
});

apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},

	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => {
		return response;
	},

	(error) => {
		const hasStoredToken = Boolean(localStorage.getItem("accessToken"));

		if (error.response?.status === 401 && hasStoredToken) {
			localStorage.removeItem("accessToken");
			window.location.href = `${appBaseUrl}login`;
		}

		return Promise.reject(error);
	}
);