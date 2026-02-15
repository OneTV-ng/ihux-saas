import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 py-6 px-4 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 justify-center">
        <Image src="/images/tenant/sflogo.png" alt="SingFLEX Logo" width={32} height={32} className="rounded" />
        <span className="font-semibold">SingFLEX Global Distributions</span>
      </div>
      <div>
        &copy; {new Date().getFullYear()} SingFLEX Global Distributions. All rights reserved.
      </div>
      <div>
        <a href="mailto:info@singflex.com" className="underline">info@singflex.com</a> | <a href="tel:+1808-SINGFLEX" className="underline">+1-808-SING-FLEX</a>
      </div>
      <div className="text-xs mt-2 max-w-xl mx-auto">
        Global simless Media distribution company focused on delivering high-quality content to audiences worldwide.
      </div>
    </footer>
  );
};

export default Footer;
