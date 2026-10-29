import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { requestDeviceCode, pollForToken } from "@/lib/deviceFlow";
import { fetchAuthenticatedUser } from "@/lib/github";

type Step = "idle" | "waiting" | "polling" | "error";

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("idle");
  const [userCode, setUserCode] = useState<string>("");
  const [verificationUri, setVerificationUri] = useState<string>(
    "https://github.com/login/device"
  );
  const [error, setError] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  async function startDeviceFlow() {
    setError("");
    setStep("waiting");
    try {
      const deviceData = await requestDeviceCode();
      setUserCode(deviceData.user_code);
      setVerificationUri(deviceData.verification_uri);
      window.open(deviceData.verification_uri, "_blank", "noopener,noreferrer");
      setStep("polling");

      const controller = new AbortController();
      abortRef.current = controller;

      const token = await pollForToken(
        deviceData.device_code,
        deviceData.interval,
        controller.signal
      );

      const user = await fetchAuthenticatedUser(token);
      setUser(user);
      navigate("/board", { replace: true });
    } catch (err) {
      if ((err as Error).message === "Polling aborted") return;
      setError((err as Error).message ?? "Authentication failed");
      setStep("error");
    }
  }

  function cancel() {
    abortRef.current?.abort();
    setStep("idle");
    setUserCode("");
    setError("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-8 px-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          Taskboard
        </span>
        <p className="text-sm text-slate-500">
          Collaborative task management powered by GitHub Issues
        </p>
      </div>

      {step === "idle" && (
        <button
          onClick={startDeviceFlow}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors"
        >
          <GitHubIcon />
          Sign in with GitHub
        </button>
      )}

      {(step === "waiting" || step === "polling") && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-6 w-full max-w-sm text-center">
          {step === "waiting" ? (
            <p className="text-sm text-slate-600">Requesting code…</p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                GitHub has opened in a new tab. Enter this code there:
              </p>
              <div className="font-mono text-2xl font-bold tracking-widest text-slate-900 bg-white border border-slate-200 rounded-md px-6 py-3">
                {userCode}
              </div>
              <a
                href={verificationUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 underline underline-offset-2"
              >
                {verificationUri}
              </a>
              <p className="text-xs text-slate-400">
                Waiting for you to authorise on GitHub…
              </p>
            </>
          )}
          <button
            onClick={cancel}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={startDeviceFlow}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            <GitHubIcon />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
