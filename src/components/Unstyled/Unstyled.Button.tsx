import React from "react";

import Unstyled, { UnstyledProps } from "./Unstyled";

export type UnstyledButtonProps = UnstyledProps<"button">;

export default function UnstyledButton({
  type = "button", // Default type is "button" to prevent unintended form submissions
  role = "button", // Role is set to "button" for accessibility purposes
  ...rest
}: UnstyledButtonProps) {
  return <Unstyled {...rest} type={type} role={role} as="button" />;
}
