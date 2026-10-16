
import React, { useEffect, useState } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "@/store/api/auth/authApiSlice";
import { setUser } from "@/store/api/auth/authSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user?.isAuth) {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.isAuth, navigate]);

  const getActualValues = () => {
    const emailInput = document.querySelector(
      'input[name="email"]'
    );
    const passwordInput = document.querySelector(
      'input[name="password"]'
    );

    const email = emailInput?.value?.trim() || "";
    const password = passwordInput?.value || "";

    setValue("email", email);
    setValue("password", password);

    return { email, password };
  };

  const onSubmit = async (data) => {
    const emailInput = document.querySelector(
      'input[name="email"]'
    );
    const passwordInput = document.querySelector(
      'input[name="password"]'
    );

    const email = (
      emailInput?.value || data.email || ""
    ).trim();

    const password =
      passwordInput?.value || data.password || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      const response = await login({
        email,
        password,
      }).unwrap();

      const userData = response?.data ?? response;

      if (!userData?.token) {
        throw new Error("Invalid credentials");
      }

      if (userData?.type === "user") {
        throw new Error("Invalid credentials");
      }

      const storage = checked ? localStorage : sessionStorage;
      const otherStorage = checked ? sessionStorage : localStorage;

      const storageKeys = [
        "user",
        "token",
        "companyId",
        "userId",
        "email",
      ];

      storageKeys.forEach((key) => {
        otherStorage.removeItem(key);
      });

      storage.setItem("user", JSON.stringify(userData));
      storage.setItem("token", userData.token);

      if (userData.companyId) {
        storage.setItem("companyId", userData.companyId);
      }

      if (userData._id) {
        storage.setItem("userId", userData._id);
      }

      if (userData.email) {
        storage.setItem("email", userData.email);
      }

      dispatch(setUser(userData));

      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Enter" || isLoading) return;

      const target = event.target;
      const form = target?.closest?.("form");

      if (!form?.querySelector('input[name="email"]')) return;

      const { email, password } = getActualValues();

      if (email && password) {
        event.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, handleSubmit, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <Textinput
        name="email"
        label="Email"
        type="email"
        register={register}
        error={errors.email}
        className="h-[48px]"
      />

      {/* Password field with show/hide toggle */}
      <div className="relative">
        <Textinput
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          register={register}
          error={errors.password}
          className="h-[48px] pr-12"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute right-3 top-[38px] z-10 flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          {showPassword ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>

      {/* Keep me signed in */}
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="keepSignedIn"
          className="flex cursor-pointer select-none items-center"
        >
          <input
            id="keepSignedIn"
            name="keepSignedIn"
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="h-4 w-4 cursor-pointer accent-slate-900"
          />

          <span className="ml-2 text-sm text-slate-800 dark:text-slate-400">
            Keep me signed in
          </span>
        </label>

        <Link
          to="/forgot-password"
          className="text-sm font-medium leading-6 text-slate-800 dark:text-slate-400"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-dark block w-full text-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
