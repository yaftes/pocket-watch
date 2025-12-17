import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { supabase } from "../api/supabase_client";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { cn } from "../lib/utils";



type RegisterInputs = {
  name: string;      
  email: string;
  password: string;
};

const Register = () => {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInputs>();

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (userInput: RegisterInputs) => {
    setServerError(null);
    setSuccessMsg(null);
    setLoading(true);


    const { error } = await supabase.auth.signUp({
      email: userInput.email,
      password: userInput.password,
      options: {
        data: { name: userInput.name }, 
      },
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccessMsg("Registration successful! Please check your email to confirm.");
    reset();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-4 py-12 lg:flex-row lg:items-center">
        <Card className="order-2 w-full max-w-md border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur lg:order-1">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Create account</CardTitle>
          
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ava Finance"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/60"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-rose-300">{errors.name.message}</p>
                )}
              </div>

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

              {serverError && (
                <Alert className="border-red-400/50 bg-red-500/10 text-white">
                  <AlertTitle>Registration failed</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
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
                {loading ? "Registering..." : "Register"}
              </Button>

              <div className="text-center text-sm text-white/70">
                Already a member?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="text-indigo-200 underline-offset-4 hover:text-white"
                  onClick={() => navigate("/login", { replace: true })}
                >
                  Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="order-1 max-w-xl space-y-6 text-center lg:order-2 lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">
            Launch mode
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Craft budgets, track spending, and automate your receipts.
          </h1>
          <p className="text-base text-white/80">
            Register once and sync across devices instantly. Pocket Watch keeps
            your financial playbook polished with modern UI and real-time data.
          </p>
        </div>


      </div>
    </div>
  );
};

export default Register;
