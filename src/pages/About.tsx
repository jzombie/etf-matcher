/// <reference types="vite-plugin-svgr/client" />
import React from "react";
import Logo from "@assets/logo.svg?react";

export default function About() {
  return (
    <div>
      About...{" "}
      <Logo
        style={{ width: 300, height: 300, backgroundColor: "yellow" }}
        fill="yellow"
      />
    </div>
  );
}
