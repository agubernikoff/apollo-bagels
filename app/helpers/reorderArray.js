export default function reorderArray(array, conditions, sortFunction) {
  // Base case: if no more conditions to apply, return the array
  if (conditions.length === 0) {
    return array;
  }
  const sorted = array.sort(sortFunction);
  const condition = conditions[0]; // Get the first condition
  const matching = [];
  const nonMatching = [];

  // Separate elements based on the current condition
  for (const element of sorted) {
    if (condition(element)) {
      matching.push(element);
    } else {
      nonMatching.push(element);
    }
  }

  // Recurse for the remaining conditions, passing the non-matching elements
  const reordered = reorderArray(
    [...nonMatching, ...matching],
    conditions.slice(1),
  );

  return reordered;
}
