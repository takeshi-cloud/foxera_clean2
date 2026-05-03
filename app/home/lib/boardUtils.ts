export const filterByDirection = (boards, showLong, showShort) => {
  return boards.filter((b) => {
    if (!showLong && b.direction === "long") return false;
    if (!showShort && b.direction === "short") return false;
    return true;
  });
};

export const sortByDirection = (arr) => {
  const order = { long: 2, short: 0 };
  return [...arr].sort((a, b) => order[b.direction] - order[a.direction]);
};

export const sortCurrent = (arr) => {
  const phaseOrder = {
    Trigger: 0,
    Pullback: 1,
    Trend: 2,
    Reversal: 3,
    wait: 99,
  };

  const dirOrder = {
    long: 0,
    short: 1,
  };

  return [...arr].sort((a, b) => {
    const p = phaseOrder[a.phase] - phaseOrder[b.phase];
    if (p !== 0) return p;

    return dirOrder[a.direction] - dirOrder[b.direction];
  });
};