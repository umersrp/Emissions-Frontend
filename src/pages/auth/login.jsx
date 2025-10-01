import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import Social from "./common/social";
import useDarkMode from "@/hooks/useDarkMode";

// Images
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/SrpLogo.png";
import backfoot from "@/assets/images/all-img/backiamge.jpg";

const Login = () => {
  const [isDark] = useDarkMode();

  return (
    <div className="w-full min-h-screen flex">
      {/* Left side with background image and overlay */}
      <div className="hidden lg:block relative w-1/2 h-screen">
        <img src={backfoot} alt="background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center px-12">
          <div className="text-white text-left">
            <h1 className="text-4xl font-bold mb-4 leading-snug bg-gradient-to-r from-[#94ffed] to-[#1e816e] text-transparent bg-clip-text">
              Welcome to CarbonX
            </h1>

            <p className="text-lg opacity-90">
              Your one-stop platform for tracking, analyzing, and reducing carbon emissions.
            </p>
          </div>
        </div>
      </div>

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white dark:bg-slate-900 px-6 sm:px-12 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/">
              <img src={isDark ? LogoWhite : Logo} alt="Logo" className="mx-auto h-28" />
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-white">
              Sign in to your CarbonX account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your company’s carbon footprint with ease
            </p>
          </div>

          <LoginForm />

          {/* <div className="flex items-center justify-center">
            <span className="text-sm text-slate-400 dark:text-slate-500">Or sign in with</span>
          </div> */}

          {/* <Social /> */}

          {/* <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Sign up
            </Link>
          </div> */}
        </div>

        <footer className="mt-10 text-xs text-center text-blue-600 dark:text-green-700">
          &copy; 2025 SrpTechnologies. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Login;
