import { clamp, distance } from "@popmotion/popcorn";

const buffer = 5;

export const findIndex = (i, yOffset, positions) => {
  let target = i;
  const { top } = positions[i];

  // If moving down
  if (yOffset > 0) {
    const nextItem = positions[i + 1];
    if (nextItem === undefined) return i;

    const swapOffset =
      distance(top, nextItem.top + nextItem.height / 2) + buffer;

    if (yOffset > swapOffset) target = i + 1;

    // If moving up
  } else if (yOffset < 0) {
    const prevItem = positions[i - 1];
    if (prevItem === undefined) return i;

    const swapOffset =
      distance(top, prevItem.top - prevItem.height / 2) + buffer;
    if (yOffset < -swapOffset) target = i - 1;
  }

  return clamp(0, positions.length, target);
};
