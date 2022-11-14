export function getMesure(target) {
  if (!target) return {};
  const rect = target.getBoundingClientRect();

  return {
    x: { min: rect.x, max: rect.x + rect.width },
    y: { min: rect.y, max: rect.y + rect.height },
  };
}
