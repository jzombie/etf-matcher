import React from "react";

export type TransitionChildViewProps = {
  children: React.ReactNode;
};

export default function TransitionChildView({
  children,
}: TransitionChildViewProps) {
  return <React.Fragment>{children}</React.Fragment>;
}
