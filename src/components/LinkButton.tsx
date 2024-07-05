import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export type LinkButtonProps = {
  to: string;
  children: React.ReactNode;
};

export default function LinkButton({
  to,
  children,
  ...props
}: LinkButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}
