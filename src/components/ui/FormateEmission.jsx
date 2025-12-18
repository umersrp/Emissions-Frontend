export const formatEmission = (num, precision = 5) => {
  if (num === null || num === undefined || isNaN(num)) return 0;

  const rounded = Number(Number(num).toFixed(precision));

  if (
    rounded !== 0 &&
    (Math.abs(rounded) < 0.0001 || Math.abs(rounded) >= 1e6)
  ) {
    return Number(rounded.toExponential(precision));
  }

  return rounded;
};
