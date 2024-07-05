import "react";
import { Button } from "antd";
import { Link } from "react-router-dom";
import LinkButton from "../components/LinkButton";

export default function Home() {
  return (
    <>
      <h1>Hello, Rust + Vite + React + TypeScript!!!</h1>

      <LinkButton to="about">About...</LinkButton>
    </>
  );
}
