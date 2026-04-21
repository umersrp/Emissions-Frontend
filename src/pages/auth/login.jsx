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
      <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-slate-900/90 rounded-2xl shadow-lg pb-8 pt-0 px-8 sm:p-10">
        <div className="text-center mb-6">
          <Link to="/">
            <img
              src={isDark ? LogoWhite : Logo}
              alt="Logo"
              className="mx-auto"
              style={{ width: "200px"}}
            />
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Welcome to <span className="font-black tracking-tight bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">SUSTIVIOUS</span>
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
