import React from "react";

import Unstyled, { UnstyledProps } from "./Unstyled";

export type UnstyledButtonProps = UnstyledProps<"button">;

export default function UnstyledButton({ ...rest }: UnstyledButtonProps) {
  return <Unstyled {...rest} as="button" />;
}
