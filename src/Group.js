import * as React from "react";
import { forwardRef, useEffect, useRef } from "react";
import { useConstant } from "./utils/use-constant";
import { ReorderContext } from "./context/ReorderContext";
import { ReorderContextGlobal } from "./context/ReorderContextGlobal";
import { checkReorder, checkReorderGhost } from "./utils/check-reorder";
import { motion } from "framer-motion";
import { getMesure } from "./utils/getMesure";

export function ReorderGroup(
  { children, as = "ul", axis = "y", onReorder, values, index, ...props },
  externalRef
) {
  const contextGlobal = React.useContext(ReorderContextGlobal);
  const [mesure, setMesure] = React.useState(null);
  const [reOrder, setReorder] = React.useState(0);
  const [newReOrder, setNewReOrder] = React.useState([]);
  let activeElement = null;
  const order = [];
  const isReordering = useRef(false);

  const Component = useConstant(() => motion(as));

  const context = {
    axis,
    updateActiveItemPosition: (pos, value, index) => {
      contextGlobal.updateActiveItemPosition(pos, value, index);
    },
    registerItem: (value, layout) => {
      if (layout && order.findIndex((entry) => value === entry.value) === -1) {
        order.push({ value, layout: { x: layout.x, y: layout.y } });
        order.sort(compareMin);

        if (reOrder === 0) setReorder((prev) => prev + 1);
      }
    },
    updateOrder: (id, offset, velocity, item, velocityX) => {
      if (!activeElement) {
        activeElement = item;
      }
      const rect = activeElement.target.getBoundingClientRect();

      contextGlobal.checkSwip(rect, index, velocityX);

      if (contextGlobal.ghost !== null) {
        const checkNewReorder = checkReorderGhost(
          contextGlobal?.sizecontainers[contextGlobal.ghost]?.elements,
          contextGlobal.activeitem,
          contextGlobal.isMoveGhost,
          contextGlobal.setIsMoveGhost
        );

        if (!checkNewReorder?.items || !checkNewReorder?.ghost) return;
        if (!arraysEqual(checkNewReorder.items, newReOrder)) {
          setNewReOrder(checkNewReorder.items);
          contextGlobal.updateOrderGhost(
            checkNewReorder.items.map(getValue),
            checkNewReorder.ghost
          );
        }
      }
      if (contextGlobal.ghost !== null) return;
      if (isReordering.current) return;
      const newOrder = checkReorder(order, id, offset, velocity);

      if (order !== newOrder) {
        setReorder((prev) => prev + 1);
        isReordering.current = true;
        contextGlobal.updateOrder(
          newOrder
            .map(getValue)
            .filter((value) => values.indexOf(value) !== -1),
          index
        );
      }
    },
  };

  useEffect(() => {
    isReordering.current = false;
  });

  const onDragEnd = () => {
    contextGlobal.setNewPos();
    contextGlobal.setGhost(null);
    // contextGlobal.reset(null);
    contextGlobal.updateActiveItemPosition(null);
    contextGlobal.setIsMoveGhost(true);
    activeElement = null;
  };
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ghost: contextGlobal.ghost,
        onDragEnd,
        item: activeElement,
        activeitem: contextGlobal.activeitem,
        index,
      });
    }
    return child;
  });

  useEffect(() => {
    if (!order) return;
    if (!arraysEqual(order, contextGlobal?.sizecontainers[index]?.elements)) {
      contextGlobal.registerItem(mesure, order, index);
    }
  }, [order, contextGlobal]);

  return (
    <Component
      ref={(ref) => {
        if (externalRef) {
          externalRef.target = ref;
        }
        const mes = getMesure(ref);
        setMesure(mes);
      }}
      {...props}
    >
      <ReorderContext.Provider value={context}>
        {childrenWithProps}
      </ReorderContext.Provider>
    </Component>
  );
}

export const Group = forwardRef(ReorderGroup);

function getValue(item) {
  return item.value;
}

function compareMin(a, b) {
  return a.layout.min - b.layout.min;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i].value !== b[i].value) return false;
    if (a[i].layout.min !== b[i].layout.min) return false;
    if (a[i].layout.max !== b[i].layout.max) return false;
  }
  return true;
}
