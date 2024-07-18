import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";

interface StyledSlidingBackgroundProps {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius: string;
  visible: boolean;
  transitionEnabled: boolean;
}

const StyledSlidingBackground = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "left" &&
    prop !== "top" &&
    prop !== "width" &&
    prop !== "height" &&
    prop !== "borderRadius" &&
    prop !== "visible" &&
    prop !== "transitionEnabled",
})<StyledSlidingBackgroundProps>(
  ({
    theme,
    left,
    top,
    width,
    height,
    borderRadius,
    visible,
    transitionEnabled,
  }) => ({
    position: "absolute",
    top,
    left,
    width,
    height,
    backgroundColor: visible ? theme.palette.primary.main : "transparent",
    transition: transitionEnabled
      ? "left 0.3s ease, width 0.3s ease, top 0.3s ease, background-color 1s ease"
      : "none",
    zIndex: 0,
    borderRadius,
  })
);

export type SlidingBackgroundProps = {
  menuRef: React.RefObject<HTMLDivElement>;
  selectedKey: string | undefined;
};

export default function SlidingBackground({
  menuRef,
  selectedKey,
}: SlidingBackgroundProps) {
  const [isResizing, setIsResizing] = useState(false);

  const [backgroundProps, setBackgroundProps] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderRadius: "0px",
    visible: false,
    transitionEnabled: true,
  });

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsResizing(false);
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const updateBackgroundPosition = () => {
      if (menuRef.current && selectedKey) {
        const selectedItem = menuRef.current.querySelector(
          `.active`
        ) as HTMLElement;
        if (selectedItem) {
          const {
            offsetLeft: left,
            offsetTop: top,
            offsetWidth: width,
            offsetHeight: height,
          } = selectedItem;
          const borderRadius =
            window.getComputedStyle(selectedItem).borderRadius;
          setBackgroundProps({
            left,
            top,
            width,
            height,
            borderRadius,
            visible: true,
            transitionEnabled: !isResizing,
          });
        }
      } else {
        setBackgroundProps((prev) => ({
          ...prev,
          visible: false,
          transitionEnabled: true,
        }));
      }
    };

    updateBackgroundPosition(); // Update position on mount

    window.addEventListener("resize", updateBackgroundPosition);

    return () => {
      window.removeEventListener("resize", updateBackgroundPosition);
    };
  }, [menuRef, selectedKey, isResizing]);

  return (
    <StyledSlidingBackground
      left={backgroundProps.left}
      top={backgroundProps.top}
      width={backgroundProps.width}
      height={backgroundProps.height}
      borderRadius={backgroundProps.borderRadius}
      visible={backgroundProps.visible}
      transitionEnabled={backgroundProps.transitionEnabled}
    ></StyledSlidingBackground>
  );
}
