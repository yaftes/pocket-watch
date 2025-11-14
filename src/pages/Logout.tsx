import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../api/auth_api";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";

type LogoutState = "pending" | "success" | "error";

const Logout = () => {
  const [status, setStatus] = useState<LogoutState>("pending");
  const [message, setMessage] = useState("Signing you out securely...");
  const navigate = useNavigate();

  useEffect(() => {
    const executeLogout = async () => {
      try {
        const { error } = await signOut();
        if (error) {
          throw error;
        }
        setStatus("success");
        setMessage("............");
        setTimeout(() => navigate("/login", { replace: true }), 1800);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Something went wrong while signing out.");
      }
    };

    executeLogout();
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-10 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur">
        <div className="mb-6 flex justify-center">
          {status === "pending" ? (
            <Spinner className="h-12 w-12 text-white" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl">
              {status === "success" ? "✓" : "!"}
            </div>
          )}
        </div>

        <h1 className="text-2xl font-semibold">
          {status === "error" ? "Logout failed" : "Logging you out"}
        </h1>
        <p className="mt-3 text-sm text-white/80">{message}</p>

        {status === "error" && (
          <div className="mt-6 space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-900 shadow-lg shadow-emerald-500/40"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/40 text-white hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              Retry logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logout;

