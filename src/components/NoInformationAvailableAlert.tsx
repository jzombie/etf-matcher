import React from "react";

import { Alert, AlertProps } from "@mui/material";

export type NoInformationAvailableAlertProps = AlertProps;

export default function NoInformationAvailableAlert({
  severity = "warning",
  ...rest
}: NoInformationAvailableAlertProps) {
  return <Alert severity={severity} {...rest} />;
}
