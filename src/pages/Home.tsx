import "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <h1>Hello, Rust + Vite + React + TypeScript!!!</h1>
      <Link to="about">About Us</Link>
    </>
  );
}
