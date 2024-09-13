import React from "react";

import Scrollable from "@layoutKit/Scrollable";

import FullContainer from "@components/FullContainer";
import SettingsManager from "@components/SettingsManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function SettingsPage() {
  usePageTitleSetter("Settings");

  return (
    <Scrollable>
      <FullContainer>
        <SettingsManager />
      </FullContainer>
    </Scrollable>
  );
}
