import { useForm } from "react-hook-form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "@radix-ui/react-label";


type RegisterInputs = {
  name : String,
  email: string;
  password: string;
};

export function Register() {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
    
  } = useForm<RegisterInputs>();

  const onSubmit = (data: RegisterInputs) => {
    console.log(data);
    reset();
  };

  return (
   
    <div className="min-h-screen flex flex-col justify-center items-center">

    <h1 className="mb-5 text-3xl">Register</h1>
        <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 w-full max-w-sm mx-auto p-6 border rounded-lg"
        >
        <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          {...register("name", {
            required: "Name is required",
           
          })}
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
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
        
      </div>

      <Button size="lg" type="submit" className="w-full">
        Register
      </Button>
    </form>
    </div>
   
  );
}


export default Register;