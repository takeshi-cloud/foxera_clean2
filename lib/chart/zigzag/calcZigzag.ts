export function calcZigzag(data, deviation = 0.03, depth = 3) {
  if (data.length < depth * 2 + 1) return [];

  const pivots = [];
  let lastPivot = null;

  for (let i = depth; i < data.length - depth; i++) {
    const current = data[i];

    const left = data.slice(i - depth, i);
    const right = data.slice(i + 1, i + 1 + depth);

    const isHigh =
      left.every((d) => current.price >= d.price) &&
      right.every((d) => current.price >= d.price);

    const isLow =
      left.every((d) => current.price <= d.price) &&
      right.every((d) => current.price <= d.price);

    if (!isHigh && !isLow) continue;

    const type = isHigh ? "HIGH" : "LOW";

    if (!lastPivot) {
      lastPivot = { ...current, type };
      pivots.push(lastPivot);
      continue;
    }

    if (lastPivot.type === type) {
      if (
        (type === "HIGH" && current.price > lastPivot.price) ||
        (type === "LOW" && current.price < lastPivot.price)
      ) {
        pivots[pivots.length - 1] = { ...current, type };
        lastPivot = { ...current, type };
      }
      continue;
    }

    const change =
      Math.abs((current.price - lastPivot.price) / lastPivot.price) * 100;

    if (change >= deviation) {
      lastPivot = { ...current, type };
      pivots.push(lastPivot);
    }
  }

  const last = data[data.length - 1];
  pivots.push({
    ...last,
    type: pivots[pivots.length - 1].type === "HIGH" ? "LOW" : "HIGH",
  });

  return pivots;
}
