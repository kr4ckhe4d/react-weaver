
// src/app-logic/exampleActions.ts

/**
 * A simple example action that can be called from a button.
 * It logs a message to the console.
 */
export const showMessage = () => {
  console.log("Hello from an imported action in exampleActions.ts!");
  alert("Message from exampleActions.ts!");
};

/**
 * An example action that could theoretically update a progress state randomly.
 * The generated UI component would need to pass the `setProgressValue` state setter to this function.
 */
export const updateExampleProgress = (
  setProgress: (value: number | ((prevNumber: number) => number)) => void
) => {
  const newValue = Math.floor(Math.random() * 101); // Random progress
  console.log(`Setting random progress via imported action to: ${newValue}`);
  if (typeof setProgress === 'function') {
    setProgress(newValue);
  } else {
    console.warn("setProgress function was not provided to updateExampleProgress.");
  }
};

/**
 * An example action that sets a progress state to a specific value.
 * The generated UI component would need to pass the `setProgressValue` state setter 
 * and the target value to this function.
 * @param setProgress The state setter function (e.g., setProgressValue).
 * @param targetValue The specific value to set the progress to.
 */
export const setSpecificProgressValue = (
  setProgress: (value: number | ((prevNumber: number) => number)) => void,
  targetValue: number
) => {
  console.log(`Setting progress to specific value via imported action: ${targetValue}`);
  if (typeof setProgress === 'function') {
    setProgress(targetValue);
  } else {
    console.warn("setProgress function was not provided to setSpecificProgressValue.");
  }
};

export const anotherAction = () => {
  console.log("Another action was called!");
};
