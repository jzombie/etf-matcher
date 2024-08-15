import React from "react";

import Unstyled, { UnstyledProps } from "./Unstyled";

export type UnstyledLIProps = UnstyledProps<"li">;

export default function UnstyledLI({ ...rest }: UnstyledLIProps) {
  return <Unstyled {...rest} as="li" />;
}
