import * as React from "react";
import { forwardRef } from "react";
import { useConstant } from "./utils/use-constant";
import { ReorderContextGlobal } from "./context/ReorderContextGlobal";
import { motion } from "framer-motion";
import { checkSwipeItem } from "./utils/check-reorder";

export function ReorderGroup(
  { children, as = "ol", onReorder, values, ...props },
  externalRef
) {
  const Component = useConstant(() => motion(as));
  const [activeitem, setActiveItem] = React.useState(null);
  const [sizecontainers, setSizeContainers] = React.useState([]);
  const [ghost, setGhost] = React.useState(null);
  const [ghostPosition, setGhostPosition] = React.useState(null);

  const [isMoveGhost, setIsMoveGhost] = React.useState(true);

  function removeItemOnce(arr, value) {
    let index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }
  const removeGhost = (b) => {
    let lastValues = [...values];
    let removeElement = false;
    lastValues.forEach((item, index) => {
      const findIndex = item.findIndex((el) => el === "ghost");
      if (findIndex !== -1) {
        const newItem = removeItemOnce(item, "ghost");
        lastValues[index] = newItem;
        removeElement = true;
      }
    });
    if (removeElement) {
      onReorder(lastValues);
    }
    return false;
  };

  React.useEffect(() => {
    if (!ghost) {
      removeGhost();
    }
  }, [ghost]);

  let context = {
    setNewPos: () => {
      if (!ghostPosition) return;
      if (ghost !== null) {
        const insert = (arr, index, newItem) => [
          ...arr.slice(0, index),
          newItem,
          ...arr.slice(index),
        ];

        let arr = [...values];
        for (const val of values) {
          const forIndex = val.findIndex((item) => item === activeitem.value);

          if (forIndex !== -1) {
            arr[activeitem.index] = arr[activeitem.index].filter(
              (el) => el !== activeitem.value
            );
            arr[ghost] = arr[ghost].filter((el) => el !== "ghost");
            arr[ghost] = insert(
              arr[ghost],
              ghostPosition.forIndex,
              activeitem.value
            );
            return onReorder(arr);
          }
        }
      }
    },
    registerItem: (layout, order, index) => {
      setSizeContainers((prev) => {
        const lastArr = [...prev];
        lastArr[index] = { pos: layout, elements: order };
        return lastArr;
      });
    },
    updateOrder: (items, index) => {
      let lastValues = [...values];
      lastValues[index] = items;
      onReorder(lastValues);
    },
    updateOrderGhost: (items, ghostPosition) => {
      let lastValues = [...values];
      if (ghostPosition) {
        setGhostPosition(ghostPosition);
      }
      if (!arraysEqual(lastValues[ghost], items)) {
        lastValues[ghost] = items;
        onReorder(lastValues);
      }
    },
    checkSwip: (a, index, velocityX) => {
      if (ghost !== null) return false;
      const nextOffset = velocityX > 0 ? 1 : -1;
      const isSwip = checkSwipeItem(
        activeitem,
        index,
        sizecontainers,
        nextOffset
      );

      let lastValues = [...values];
      const container = lastValues[index + nextOffset];
      if (!container) return;
      const findIndex = container.findIndex((el) => el === "ghost");

      if (!isSwip) return removeGhost(index);
      setGhost(index + nextOffset);
      if (findIndex === -1) {
        lastValues[index + nextOffset] = [
          ...lastValues[index + nextOffset],
          "ghost",
        ];
        onReorder(lastValues);
      }
      if (findIndex !== -1) return false;

      return true;
    },
    updateActiveItemPosition: (pos, value, index) => {
      if (!posEqual(pos, { x: activeitem?.x, y: activeitem?.y })) {
        setActiveItem({ ...pos, value, index });
      }
    },
    reset: () => {
      setActiveItem(null);
    },
  };

  return (
    <Component ref={externalRef}>
      <ReorderContextGlobal.Provider
        value={{
          ...context,
          activeitem,
          ghost,
          setGhost,
          sizecontainers,
          ghostPosition,
          isMoveGhost,
          setIsMoveGhost,
        }}
      >
        {children}
      </ReorderContextGlobal.Provider>
    </Component>
  );
}

export const GroupGlobal = forwardRef(ReorderGroup);

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function posEqual(a, b) {
  if (!a) return true;
  if (!b) return false;
  if (a.x !== b.x || a.y !== b.y) return false;

  return true;
}
