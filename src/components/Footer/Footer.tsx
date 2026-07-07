import React from "react";
import SocialLinks from "@/components/Footer/SocialLinks";
import Image from "next/image";

const Footer = () => {
  return (
    <footer
      className="w-full px-4 py-3 
      flex flex-col md:flex-row md:justify-between items-center 
      gap-y-4 md:gap-y-0
      text-olive text-sm font-extrabold mt-8 sm:mt-auto"
    >
      <div className="flex items-center space-x-2 order-2 md:order-1">
        © {new Date().getFullYear()} deepcut
      </div>
      <div className="group flex items-center gap-2 order-1 md:order-2">
        <span>made with</span>
        <Image
          src="/22heart.png"
          alt="Heart"
          width={20}
          height={20}
          className="transition-transform group-hover:scale-125"
        />
        <span>by twxntytwo.</span>
      </div>
      <div className="order-3">
        <SocialLinks />
      </div>
    </footer>
  );
};

export default Footer;
