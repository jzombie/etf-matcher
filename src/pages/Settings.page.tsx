import React from "react";

import SettingsManager from "@components/SettingsManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function Settings() {
  usePageTitleSetter("Settings");

  return <SettingsManager />;
}