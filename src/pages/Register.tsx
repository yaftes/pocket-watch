import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { supabase } from "../api/supabase_client";
import { useNavigate } from "react-router-dom";

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

    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-semibold text-center mb-6">Register</h1>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
     
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

      
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^@]+@[^@]+\.[^@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-500 text-center">{serverError}</p>
          )}

          {successMsg && (
            <p className="text-sm text-green-600 text-center">{successMsg}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>

          <Button className="w-full" onClick={() => navigate('/login',{replace : true})}>
              Login
          </Button>

        </form>
      </div>
    </div>
  );
};

export default Register;
