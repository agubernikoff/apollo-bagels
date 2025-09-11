export default function reorderArray(array, conditions, sortingFunction) {
  if (conditions.length === 0) {
    return sortingFunction ? array.slice().sort(sortingFunction) : array;
  }

  // Process all conditions first to create groups
  const groups = [];
  let remainingElements = [...array];

  // Apply each condition in order, removing matched elements
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    const matching = [];
    const nonMatching = [];

    for (const element of remainingElements) {
      if (condition(element)) {
        matching.push(element);
      } else {
        nonMatching.push(element);
      }
    }

    // Sort the matching group if we have a sorting function
    if (matching.length > 0) {
      groups.push(sortingFunction ? matching.sort(sortingFunction) : matching);
    }

    // Continue with non-matching elements for next condition
    remainingElements = nonMatching;
  }

  // Add any remaining elements (those that didn't match any condition) at the beginning
  if (remainingElements.length > 0) {
    const sortedRemaining = sortingFunction
      ? remainingElements.sort(sortingFunction)
      : remainingElements;
    groups.unshift(sortedRemaining); // Add to beginning
  }

  // Flatten all groups
  return groups.flat();
}
