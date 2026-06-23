import { useEffect, useState } from "react";
import { authApi } from "@/features/auth/api/authApi";
import AuthContext from "./authContext";

const AUTH_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "user",
};

const safeJsonParse = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
};

const getStoredUser = () => {
  const parsedUser = safeJsonParse(
    localStorage.getItem(AUTH_STORAGE_KEYS.user),
  );

  if (!parsedUser || typeof parsedUser !== "object") {
    return null;
  }

  return parsedUser;
};

const readStoredAuth = () => {
  if (typeof window === "undefined") {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userRole: null,
    };
  }

  const user = getStoredUser();
  const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);

  if (!user || !accessToken) {
    clearAuthStorage();

    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userRole: null,
    };
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: true,
    userRole: user?.role ?? null,
  };
};

const persistAuthStorage = ({ accessToken, refreshToken, user }) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));

  if (refreshToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  }
};

const normalizeAuthResponse = (authResponse) => {
  const candidate =
    authResponse?.data?.data ?? authResponse?.data ?? authResponse;

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const accessToken = candidate.accessToken ?? candidate.token ?? null;
  const refreshToken = candidate.refreshToken ?? null;
  const user = candidate.user ?? null;

  if (!accessToken || !user || typeof user !== "object") {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const normalizeSignupResponse = (signupResponse) => {
  if (!signupResponse || typeof signupResponse !== "object") {
    return null;
  }

  const accessToken =
    signupResponse.accessToken ?? signupResponse.token ?? null;
  const refreshToken = signupResponse.refreshToken ?? null;
  const user = signupResponse.user ?? null;

  if (!accessToken || !user || typeof user !== "object") {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const normalizeAllowedRoles = (allowedRoles) => {
  if (Array.isArray(allowedRoles)) {
    return allowedRoles;
  }

  if (typeof allowedRoles === "string") {
    return [allowedRoles];
  }

  return [];
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => readStoredAuth());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] =
    useState(null);
  const [verificationResendCooldownSeconds, setVerificationResendCooldownSeconds] =
    useState(0);


  useEffect(() => {
    if (verificationResendCooldownSeconds <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setVerificationResendCooldownSeconds((current) =>
        Math.max(0, current - 1),
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [verificationResendCooldownSeconds]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      clearAuthStorage();
    }
  }, [authState.isAuthenticated]);

  const clearAuth = () => {
    clearAuthStorage();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      userRole: null,
    });
  };

  const login = (authResponse) => {
    const normalizedAuth = normalizeAuthResponse(authResponse);

    if (!normalizedAuth) {
      throw new Error("Invalid auth response shape.");
    }

    persistAuthStorage(normalizedAuth);

    setAuthState({
      user: normalizedAuth.user,
      accessToken: normalizedAuth.accessToken,
      refreshToken: normalizedAuth.refreshToken,
      isAuthenticated: true,
      userRole: normalizedAuth.user?.role ?? null,
    });
  };

  const logout = () => {
    clearAuth();
  };

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const signup = async ({
    fullName,
    email,
    password,
    confirmPassword,
    role,
  }) => {
    setLoading(true);
    resetMessages();

    try {
      const signupPayload = {
        fullName,
        email,
        password,
        confirmPassword,
      };

      const signupResponse =
        role === "guide"
          ? await authApi.registerGuide(signupPayload)
          : await authApi.registerTourist(signupPayload);

      const normalizedSignup = normalizeSignupResponse(signupResponse);

      if (normalizedSignup) {
        persistAuthStorage(normalizedSignup);

        setAuthState({
          user: normalizedSignup.user,
          accessToken: normalizedSignup.accessToken,
          refreshToken: normalizedSignup.refreshToken,
          isAuthenticated: true,
          userRole: normalizedSignup.user?.role ?? null,
        });
      }

      setPendingVerificationEmail(email);
      setSuccessMessage(
        "Account created successfully. Please check your email to verify your account.",
      );

      return {
        email,
        response: signupResponse,
      };
    } catch (signupError) {
      const message =
        signupError instanceof Error
          ? signupError.message
          : "Unable to create your account. Please try again.";

      setError(message);

      throw signupError;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email) => {
    const targetEmail = email ?? pendingVerificationEmail;

    if (!targetEmail) {
      throw new Error(
        "Please provide an email address to resend verification.",
      );
    }

    setLoading(true);
    resetMessages();

    try {
      await authApi.resendVerificationEmail(targetEmail);

      setPendingVerificationEmail(targetEmail);
      setVerificationResendCooldownSeconds(0);
      setSuccessMessage("Verification email sent. Please check your inbox.");

      return targetEmail;
    } catch (resendError) {
      const cooldownSeconds = Number(resendError?.cooldownSeconds ?? 0);

      if (Number.isFinite(cooldownSeconds) && cooldownSeconds > 0) {
        setError(null);
        setVerificationResendCooldownSeconds(Math.ceil(cooldownSeconds));
        return null;
      }

      const message =
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend verification email. Please try again.";

      setError(message);

      throw resendError;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser || typeof updatedUser !== "object") {
      return;
    }

    setAuthState((currentState) => {
      const nextUser = {
        ...currentState.user,
        ...updatedUser,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(nextUser));
      }

      return {
        ...currentState,
        user: nextUser,
        userRole: nextUser?.role ?? null,
      };
    });
  };

  const hasRole = (allowedRoles) => {
    const roles = normalizeAllowedRoles(allowedRoles);

    if (!roles.length) {
      return false;
    }

    return roles.includes(authState.userRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        isAuthenticated: authState.isAuthenticated,
        isAuthLoading: loading,
        userRole: authState.userRole,
        loading,
        error,
        successMessage,
        pendingVerificationEmail,
        verificationResendCooldownSeconds,
        login,
        signup,
        resendVerificationEmail,
        logout,
        updateUser,
        hasRole,
        clearAuth,
        resetMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
