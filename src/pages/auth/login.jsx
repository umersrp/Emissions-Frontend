import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import useDarkMode from "@/hooks/useDarkMode";

// Images
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/SrpLogo.png";
import backfoot from "@/assets/images/all-img/backiamge2.jpg";

const Login = () => {
  const [isDark] = useDarkMode();

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backfoot})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-slate-900/90 rounded-2xl shadow-lg p-8 sm:p-10">
        <div className="text-center mb-6">
          <Link to="/">
            <img
              src={isDark ? LogoWhite : Logo}
              alt="Logo"
              className="mx-auto h-24"
            />
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">
            Welcome to <span className="bg-gradient-to-r from-[#94ffed] to-[#1e816e] text-transparent bg-clip-text">CarbonX</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your company’s carbon footprint
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        <footer className="mt-8 text-xs text-center text-slate-600 dark:text-green-700">
          &copy; 2025 SrpTechnologies. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Login;
