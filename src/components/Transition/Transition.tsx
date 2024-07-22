import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
  isValidElement,
  ReactElement,
} from "react";
import useStableCurrentRef from "@hooks/useStableCurrentRef";
import TransitionChildView from "./Transition.ChildView";
import "animate.css";
import Full from "@layoutKit/Full";

export type TransitionDirection = "left" | "right";

export type TransitionType = "slide" | "fade";

export type TransitionProps = {
  children: ReactNode;
  direction?: TransitionDirection;
  transitionType?: TransitionType;
  transitionDurationMs?: number;
  trigger?: any;
};

const Transition = ({
  children,
  direction,
  transitionType = "slide",
  transitionDurationMs = 200,
  trigger,
}: TransitionProps) => {
  const initialTriggerRef = useRef(trigger);

  const [activeView, setActiveView] = useState<ReactNode>(children);
  const [nextView, setNextView] = useState<ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeViewRef = useRef<HTMLDivElement>(null);
  const nextViewRef = useRef<HTMLDivElement>(null);

  const childrenStableRef = useStableCurrentRef(children);
  const activeViewStableRef = useStableCurrentRef(activeView);

  useEffect(() => {
    // Don't run on initial trigger (prevents symbols from loading)
    if (trigger === initialTriggerRef.current) {
      return;
    }

    const children = childrenStableRef.current;
    const activeView = activeViewStableRef.current;

    const currentChild = React.Children.only(children);

    if (isValidElement(currentChild)) {
      const activeViewElement = isValidElement(activeView)
        ? (activeView as ReactElement)
        : null;

      if (
        trigger !== undefined ||
        currentChild.key !== activeViewElement?.key
      ) {
        const clonedNextView = React.cloneElement(currentChild, {
          key: `cloned-${currentChild.key}`,
        });
        setIsTransitioning(true);
        setNextView(clonedNextView);
      }
    }
  }, [childrenStableRef, activeViewStableRef, trigger]);

  const { activeTransitionClass, nextTransitionClass } = useMemo(() => {
    if (transitionType === "fade") {
      return {
        activeTransitionClass: "animate__fadeOut",
        nextTransitionClass: "animate__fadeIn",
      };
    }

    const transitionDirection = direction;

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
  }, [direction, transitionType]);

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

  const transitionDurationCSS = useMemo(
    () => `${transitionDurationMs / 1000}s`,
    [transitionDurationMs]
  );

  return (
    <Full>
      <TransitionChildView
        ref={activeViewRef}
        transitionClassName={isTransitioning ? activeTransitionClass : ""}
        style={{
          animationDuration: transitionDurationCSS,
          transform: "translateZ(0)",
        }}
      >
        {activeView}
      </TransitionChildView>
      {nextView && (
        <TransitionChildView
          ref={nextViewRef}
          transitionClassName={isTransitioning ? nextTransitionClass : ""}
          style={{
            animationDuration: transitionDurationCSS,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transform: "translateZ(0)",
          }}
        >
          {nextView}
        </TransitionChildView>
      )}
    </Full>
  );
};

export default Transition;
