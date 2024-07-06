/// <reference types="vite-plugin-svgr/client" />
import "react";
import Logo from "@assets/logo.svg?react";

export default function About() {
  return (
    <div>
      About... <Logo />
    </div>
  );
}
