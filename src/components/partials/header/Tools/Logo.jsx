import React from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";
import useWidth from "@/hooks/useWidth";
import sufi from "../../../../assets/images/logo/SrpLogo.png"

import LogoWhite from "@/assets/images/logo/logo-white.svg";
import MobileLogo from "@/assets/images/logo/logo-c.svg";
import MobileLogoWhite from "@/assets/images/logo/logo-c-white.svg";
const Logo = () => {
  const [isDark] = useDarkMode();
  const { width, breakpoints } = useWidth();

  return (
    <div>
      <Link to="/dashboard">
        {width >= breakpoints.xl ? (
          <img src={isDark ? LogoWhite : sufi} alt="" className="w-[30%] h-9" />
        ) : (
          <img src={isDark ? MobileLogoWhite : sufi} alt="" className="w-[20%] h-[30%]" />
        )}
      </Link>
    </div>
  );
};

export default Logo;
