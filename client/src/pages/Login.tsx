import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginSchema } from "../schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";

export function Login() {
  const navigate = useNavigate();
  const { login, error } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsSubmitting(true);

    await login({
      email: data.email,
      password: data.password,
    });

    const { isLoggedIn } = useAuthStore.getState();

    if (isLoggedIn) {
      toast.success("Login successful!");
      navigate("/");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center min-h-screen items-center text-xl">
      <Card className="w-full max-w-sm gap-6">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your username or email to login into your account
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Username / Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Error and Submit */}
            <CardFooter className="flex-col gap-2 px-0 pb-0 pt-6">
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Spinner />}
                {!isSubmitting && "Login"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
