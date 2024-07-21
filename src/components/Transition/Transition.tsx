import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
  isValidElement,
  ReactElement,
} from "react";
import TransitionChildView from "./Transition.ChildView";
import "animate.css";
import Full from "@layoutKit/Full";
import debounceWithKey from "@utils/debounceWithKey";

export type TransitionDirection = "left" | "right";

export type TransitionType = "slide" | "fade";

export type TransitionProps = {
  children: ReactNode;
  explicitDirection?: TransitionDirection;
  transitionType?: TransitionType;
  transitionDurationMs?: number;
};

const Transition = ({
  children,
  explicitDirection,
  transitionType = "slide",
  transitionDurationMs = 200,
}: TransitionProps) => {
  const [activeView, setActiveView] = useState<ReactNode>(children);
  const [nextView, setNextView] = useState<ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTransitionHeight, setActiveTransitionHeight] = useState<
    number | null
  >(null);

  const keyedTransitionDirectionRef = useRef<TransitionDirection>("left");

  const activeViewRef = useRef<HTMLDivElement>(null);
  const nextViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentChild = React.Children.only(children);

    if (isValidElement(currentChild)) {
      const nextChildKey = (currentChild as ReactElement).key;
      const activeViewElement = isValidElement(activeView)
        ? (activeView as ReactElement)
        : null;
      const activeViewKey = activeViewElement?.key;

      if (nextChildKey !== activeViewKey) {
        if (activeViewRef.current) {
          const computedActiveViewStyle = window.getComputedStyle(
            activeViewRef.current
          );
          setActiveTransitionHeight(
            parseInt(computedActiveViewStyle.height, 10)
          );
        }

        if (nextChildKey && activeViewKey) {
          // For auto-determining transition direction
          keyedTransitionDirectionRef.current =
            parseInt(nextChildKey.toString(), 10) >
            parseInt(activeViewKey.toString(), 10)
              ? "left"
              : "right";
        }

        setIsTransitioning(true);
        setNextView(children);
      }
    }
  }, [children, activeView]);

  // Explicitly want the props to update on the following useMemo
  const keyedTransitionDirection = keyedTransitionDirectionRef.current;
  const { activeTransitionClass, nextTransitionClass } = useMemo(() => {
    if (transitionType === "fade") {
      return {
        activeTransitionClass: "animate__fadeOut",
        nextTransitionClass: "animate__fadeIn",
      };
    }

    const transitionDirection = explicitDirection || keyedTransitionDirection;

    if (transitionDirection === "left") {
      return {
        activeTransitionClass: "animate__slideOutLeft",
        nextTransitionClass: "animate__slideInRight",
      };
    } else {
      return {
        activeTransitionClass: "animate__slideOutRight",
        nextTransitionClass: "animate__slideInLeft",
      };
    }
  }, [explicitDirection, keyedTransitionDirection, transitionType]);

  useEffect(() => {
    if (isTransitioning) {
      const handleAnimationEnd = () => {
        setIsTransitioning(false);
        setActiveView(nextView);
        setNextView(null);

        debounceWithKey(
          "post_transition:height_reset",
          () => {
            setActiveTransitionHeight(null);
          },
          500
        );
      };

      const activeViewElement = activeViewRef.current;
      const nextViewElement = nextViewRef.current;

      if (activeViewElement) {
        activeViewElement.addEventListener("animationend", handleAnimationEnd, {
          once: true,
        });
      }

      if (nextViewElement) {
        nextViewElement.classList.add(nextTransitionClass);
      }

      return () => {
        if (activeViewElement) {
          activeViewElement.removeEventListener(
            "animationend",
            handleAnimationEnd
          );
        }
      };
    }
  }, [isTransitioning, nextView, nextTransitionClass]);

  // Infer keys inline
  const activeViewKey = isValidElement(activeView)
    ? (activeView as ReactElement).key
    : null;
  const nextViewKey = isValidElement(nextView)
    ? (nextView as ReactElement).key
    : null;

  const transitionDurationCSS = useMemo(
    () => `${transitionDurationMs / 1000}s`,
    [transitionDurationMs]
  );

  return (
    <Full
      style={activeTransitionHeight ? { height: activeTransitionHeight } : {}}
    >
      <TransitionChildView
        ref={activeViewRef}
        key={activeViewKey}
        transitionClass={isTransitioning ? activeTransitionClass : ""}
        style={{
          animationDuration: transitionDurationCSS,
          height: activeTransitionHeight || "null",
        }}
      >
        {activeView}
      </TransitionChildView>
      {nextView && (
        <TransitionChildView
          ref={nextViewRef}
          key={nextViewKey}
          transitionClass={isTransitioning ? nextTransitionClass : ""}
          style={{
            animationDuration: transitionDurationCSS,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {nextView}
        </TransitionChildView>
      )}
    </Full>
  );
};

export default Transition;
