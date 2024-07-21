import React, { useState, useEffect, ReactNode, useRef } from "react";
import "animate.css";

export type TransitionProps = {
  children: ReactNode;
};

const Transition = ({ children }: TransitionProps) => {
  const [activeView, setActiveView] = useState<ReactNode>(children);
  const [nextView, setNextView] = useState<ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeViewRef = useRef<HTMLDivElement>(null);
  const nextViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // if (children.key !== activeView.key) {
    if (children !== activeView) {
      setIsTransitioning(true);
      setNextView(children);
    }
  }, [children, activeView]);

  useEffect(() => {
    if (isTransitioning) {
      const handleAnimationEnd = () => {
        setIsTransitioning(false);
        setActiveView(nextView);
        setNextView(null);
      };

      const activeViewElement = activeViewRef.current;
      const nextViewElement = nextViewRef.current;

      if (activeViewElement) {
        activeViewElement.addEventListener("animationend", handleAnimationEnd, {
          once: true,
        });
      }

      // Ensure nextView starts its transition after activeView has started transitioning out
      if (nextViewElement) {
        nextViewElement.classList.add("animate__slideInRight");
      }

      // Cleanup
      return () => {
        if (activeViewElement) {
          activeViewElement.removeEventListener(
            "animationend",
            handleAnimationEnd
          );
        }
      };
    }
  }, [isTransitioning, nextView]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        ref={activeViewRef}
        className={`animate__animated ${
          isTransitioning ? "animate__slideOutLeft" : ""
        }`}
        style={{ flex: 1 }}
      >
        {activeView}
      </div>
      {nextView ? (
        <div
          ref={nextViewRef}
          className={`animate__animated ${
            isTransitioning ? "animate__slideInRight" : ""
          }`}
          style={{ flex: 1, position: "absolute", top: 0, left: 0 }}
        >
          {nextView}
        </div>
      ) : null}
    </div>
  );
};

export default Transition;
