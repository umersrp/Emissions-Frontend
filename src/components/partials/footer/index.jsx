import React from "react";
import useFooterType from "@/hooks/useFooterType";

const Footer = ({ className = "custom-class" }) => {
  const [footerType] = useFooterType();
  const footerclassName = () => {
    switch (footerType) {
      case "sticky":
        return "sticky bottom-0 z-[999]";
      case "static":
        return "static";
      case "hidden":
        return "hidden";
    }
  };
  return (
    <footer className={className + " " + footerclassName()}>
      <div className="site-footer px-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="text-center md:text-left">
            COPYRIGHT &copy; 2024 Srptechs, All rights Reserved
          </div>
          <div className="text-center md:text-right mt-2 md:mt-0">
            Made by{" "}
            <a
              href="https://srptechs.com"
              target="_blank"
              className="text-primary-900 font-semibold"
            >
              srptechs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
