import React from "react";

import Unstyled, { UnstyledProps } from "./Unstyled";

export type UnstyledULProps = UnstyledProps<"ul">;

export default function UnstyledUL({ ...rest }: UnstyledULProps) {
  return <Unstyled {...rest} as="ul" />;
}
