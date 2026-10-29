import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchAuthenticatedUser } from "@/lib/github";

export default function AuthCallbackPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    // Strict-mode protection: only run once
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/auth/callback?code=${encodeURIComponent(code)}`);
        if (!res.ok) throw new Error("Token exchange failed");
        const { token } = (await res.json()) as { token: string };

        const user = await fetchAuthenticatedUser(token);
        setUser(user);
        navigate("/board", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500 text-sm">
      Signing you in…
    </div>
  );
}
