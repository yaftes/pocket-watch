import { useForm } from "react-hook-form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { supabase } from "../api/supabase_client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { cn } from "../lib/utils";

type LoginInputs = {
  email: string;
  password: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginInputs>();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data: LoginInputs) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Login successful!");
      reset();
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-0 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-4 py-12 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200">
            Pocket Watch
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Welcome back to your financial cockpit.
          </h1>
          <p className="text-base text-white/80">
            Plug into real-time dashboards, automate receipts, and keep every
            budget behaving—even on mobile. Sign in to continue orchestrating
            your spending strategy.
          </p>
          <div className="grid gap-4 text-left text-sm text-white/70 md:grid-cols-2">
            {["Live dashboards", "Receipt OCR", "Budget automations", "Encrypted auth"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <Card className="w-full max-w-md border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
            <CardDescription className="text-white/70">
              Use your email and password to access Pocket Watch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/60"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^@]+@[^@]+\.[^@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-rose-300">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/60"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-rose-300">{errors.password.message}</p>
                )}
              </div>

              {errorMsg && (
                <Alert className="border-red-400/50 bg-red-500/10 text-white">
                  <AlertTitle>Login failed</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              {successMsg && (
                <Alert className="border-emerald-400/50 bg-emerald-500/10 text-white">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{successMsg}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className={cn(
                  "w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-900 shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5",
                  loading && "opacity-70"
                )}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Access dashboard"}
              </Button>

              <div className="text-center text-sm text-white/70">
                No account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="text-indigo-200 underline-offset-4 hover:text-white"
                  onClick={() => navigate("/register", { replace: true })}
                >
                  Create one
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
