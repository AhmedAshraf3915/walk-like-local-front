import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/layouts/AuthLayout";
import Button from "../../../components/shared/Button";
import FormError from "../../../components/shared/FormError";
import Loader from "../../../components/shared/Loader";
import useAuth from "@/contexts/useAuth";

const parseUser = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(window.atob(value));
    } catch {
      return null;
    }
  }
};

const parseUserFromToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const decoded = JSON.parse(jsonPayload);
    const userCandidate = decoded.user || decoded;

    return {
      id: userCandidate.id ?? userCandidate._id ?? userCandidate.sub ?? null,
      email: userCandidate.email ?? null,
      role: userCandidate.role ?? null,
      fullName: userCandidate.fullName ?? userCandidate.name ?? null,
      ...userCandidate,
    };
  } catch {
    return null;
  }
};

const getCallbackParams = (search, hash) => {
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  hashParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.set(key, value);
    }
  });

  return params;
};

const GoogleAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const params = useMemo(
    () => getCallbackParams(location.search, location.hash),
    [location.hash, location.search],
  );

  const callbackResult = useMemo(() => {
    const message = params.get("error") ?? params.get("message");

    if (message) {
      return { error: message };
    }

    const accessToken = params.get("accessToken") ?? params.get("token");
    const refreshToken = params.get("refreshToken");
    let user = parseUser(params.get("user"));

    if (!user && accessToken) {
      user = parseUserFromToken(accessToken);
    }

    const defaultNextPath = "/";
    let nextPath = params.get("next");
    if (
      !nextPath ||
      nextPath === "/guide-verification" ||
      nextPath === "/test"
    ) {
      nextPath = defaultNextPath;
    }

    if (!accessToken || !user) {
      return { error: "Google sign in did not return valid auth data." };
    }

    return {
      authData: { accessToken, refreshToken, user },
      nextPath,
    };
  }, [params]);

  useEffect(() => {
    if (callbackResult.error || !callbackResult.authData) {
      return;
    }

    try {
      login(callbackResult.authData);
      navigate(callbackResult.nextPath, { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }, [callbackResult, login, navigate]);

  return (
    <AuthLayout
      title="Finishing Google sign in"
      subtitle="We are checking your account and getting your test page ready."
    >
      {callbackResult.error ? (
        <div className="flex flex-col gap-4">
          <FormError message={callbackResult.error} />
          <Button type="button" onClick={() => navigate("/login")} fullWidth>
            Back to sign in
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 text-sm font-semibold text-[#010170]">
          <Loader />
          <span>Connecting Google account...</span>
        </div>
      )}
    </AuthLayout>
  );
};

export default GoogleAuthCallbackPage;
