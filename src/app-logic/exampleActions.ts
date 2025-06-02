
// src/app-logic/exampleActions.ts
import type { AvailableSetters } from './types'; // We'll define this type

/**
 * A simple example action that can be called from a button.
 * It logs a message to the console and shows an alert.
 */
export const showMessage = (setters: AvailableSetters) => {
  console.log("Hello from an imported action in exampleActions.ts!", { setters });
  alert("Message from exampleActions.ts!");
};

/**
 * An example action that could theoretically update a progress state randomly.
 * It expects an object of available state setters.
 */
export const updateExampleProgress = (
  setters: AvailableSetters
  // Example: setProgress: (value: number | ((prevNumber: number) => number)) => void
) => {
  const newValue = Math.floor(Math.random() * 101); // Random progress
  console.log(`Setting random progress via imported action to: ${newValue}`);
  
  // Assuming a progress bar's state is managed by a source named 'myProgress'
  // and its setter is available as setters.setMyProgress
  if (typeof setters.setMyProgress === 'function') {
    setters.setMyProgress(newValue);
    console.log("Called setters.setMyProgress");
  } else {
    console.warn("setMyProgress function was not found in the provided setters object for updateExampleProgress.");
    console.log("Available setters:", Object.keys(setters));
  }
};

/**
 * An example action that sets a progress state to a specific value.
 * It expects an object of available state setters and the target value.
 * @param setters An object containing available state setter functions.
 * @param targetValue The specific value to set the progress to.
 */
export const setSpecificProgressValue = (
  setters: AvailableSetters,
  targetValue: number
) => {
  console.log(`Setting progress to specific value via imported action: ${targetValue}`);
  // Assuming a progress bar's state is managed by a source named 'myProgress'
  // and its setter is available as setters.setMyProgress
  if (typeof setters.setMyProgress === 'function') {
    setters.setMyProgress(targetValue);
  } else {
    console.warn("setMyProgress function was not found in the provided setters object for setSpecificProgressValue.");
    console.log("Available setters:", Object.keys(setters));
  }
};

export const anotherAction = (setters: AvailableSetters) => {
  console.log("Another action was called!", { setters });
};
