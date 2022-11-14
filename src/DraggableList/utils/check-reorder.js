import { mix } from "popmotion";
import { moveItem } from "./moveItem";

export function checkReorder(order, value, offset, velocity) {
  if (!velocity) return order;
  const index = order.findIndex((item) => item.value === value);

  if (index === -1) return order;

  const nextOffset = velocity > 0 ? 1 : -1;
  const nextItem = order[index + nextOffset];

  if (!nextItem) return order;
  const item = order[index];
  const nextLayout = nextItem.layout.y;

  const nextItemCenter = mix(nextLayout.min, nextLayout.max, 0.5);

  if (
    (nextOffset === 1 && item.layout.y.max + offset > nextItemCenter) ||
    (nextOffset === -1 && item.layout.y.min + offset < nextItemCenter)
  ) {
    return moveItem(order, index, index + nextOffset);
  }
  return order;
}

export function checkReorderGhost(order, item, isMoveGhost, setIsMoveGhost) {
  const obj = { items: order, ghost: null };

  if (!order) return obj;
  if (!item?.y) return obj;

  const ghostIndex = order.findIndex((item) => item.value === "ghost");
  if (ghostIndex === -1) return order;

  let nextOffset = item.velocity.y > 0 ? 1 : -1;
  let nextItem = order[ghostIndex + nextOffset];
  if (isMoveGhost && !nextItem) {
    nextOffset = item.velocity.y > 0 ? -1 : 1;
    nextItem = order[ghostIndex + nextOffset];
    if (!nextItem) return obj;
  } else if (!nextItem) return obj;

  const nextLayout = nextItem.layout.y;

  const nextItemCenter = mix(nextLayout.min, nextLayout.max, 0.5);
  if (isMoveGhost) {
    setIsMoveGhost(false);
  }
  if (
    (nextOffset === 1 && item.y > nextItemCenter) ||
    (nextOffset === -1 && item.y < nextItemCenter)
  ) {
    return {
      items: moveItem(order, ghostIndex, ghostIndex + nextOffset),
      ghost: {
        ...order[ghostIndex + nextOffset],
        forIndex: ghostIndex + nextOffset,
      },
    };
  } else {
    return obj;
  }
}

export function checkSwipeItem(item, i, containers, velocity) {
  if (!item?.x) return false;

  const nextItem = containers[i + velocity];
  // console.log(i + velocity, containers);

  if (!nextItem) return false;
  const nextItemCenter = mix(
    nextItem.pos.x.min,
    nextItem.pos.x.max,
    velocity > 0 ? -0.5 : 0.5
  );

  if (velocity > 0 ? item.x < nextItemCenter : item.x > nextItemCenter)
    return false;
  return true;
}

// export function checkSwipeItem(rect, i, containers, nextOffset) {
//   const nextItem = containers[i + nextOffset];

//   if (!nextItem) return false;
//   const nextItemCenter = mix(nextItem.pos.x.min, nextItem.pos.x.max, -0.2);
//   if (rect.x < nextItemCenter) return false;
//   return true;
// }
