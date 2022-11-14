import {
  motion,
  useMotionValue,
  useTransform,
  isMotionValue,
  useAnimationControls,
} from "framer-motion";
import * as React from "react";
import { useContext, useEffect, useRef, forwardRef } from "react";
import { useConstant } from "./utils/use-constant";
import { ReorderContext } from "./context/ReorderContext";
import { ReorderContextGlobal } from "./context/ReorderContextGlobal";

function useDefaultMotionValue(value, defaultValue = 0) {
  return isMotionValue(value) ? value : useMotionValue(defaultValue);
}

const transition = {
  type: "spring",
  damping: 25,
  stiffness: 120,
};

export function ReorderItem(
  {
    children,
    style = {},
    value,
    as = "li",
    onDrag,
    layout = true,
    ghost,
    onDragEnd,
    item,
    id,
    index,
    activeitem,
    ...props
  },
  externalRef
) {
  const Component = useConstant(() => motion(as));
  const controls = useAnimationControls();

  const context = useContext(ReorderContext);
  const contextGlobal = useContext(ReorderContextGlobal);
  const point = {
    x: useDefaultMotionValue(style.x),
    y: useDefaultMotionValue(style.y),
  };
  const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) =>
    latestX || latestY ? 2 : 1
  );

  const measuredLayout = useRef(null);

  const { axis, registerItem, updateOrder, updateActiveItemPosition } = context;

  useEffect(() => {
    registerItem(value, measuredLayout.current);
  }, [context]);

  const getClass = React.useMemo(() => {
    if ("ghost" === value) {
      return "ghost";
    }
    return "";
  }, [ghost, value]);

  useEffect(() => {
    if (contextGlobal.activeitem && children && value !== "ghost") {
      controls.set({
        x:
          contextGlobal.activeitem.x -
          contextGlobal.sizecontainers[index].pos.x.min -
          7,
        y:
          contextGlobal.activeitem.y - contextGlobal.ghostPosition.layout.y.min,
      });
      controls.start({
        x: 0,
        y: 0,

        transition,
      });
    }
  }, [children]);

  return (
    <Component
      drag
      {...props}
      animate={controls}
      id={value}
      dragSnapToOrigin
      style={{ ...style, x: point.x, y: point.y, zIndex }}
      layout={layout}
      onDrag={(event, gesturePoint) => {
        const { velocity } = gesturePoint;
        const rect = event.target.getBoundingClientRect();
        updateActiveItemPosition(
          { x: rect.x, y: rect.y, velocity },
          value,
          index
        );
        velocity[axis] &&
          updateOrder(
            value,
            point[axis].get(),
            velocity[axis],
            event,
            velocity["x"]
          );
      }}
      onDragEnd={onDragEnd}
      onLayoutMeasure={(measured) => {
        measuredLayout.current = measured;
      }}
      ref={externalRef}
      className={getClass}
    >
      {children}
    </Component>
  );
}

export const Item = forwardRef(ReorderItem);
