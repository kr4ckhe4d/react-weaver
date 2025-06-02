
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
 * An example action that could theoretically update a progress state.
 * To make this work, the generated UI component would need to pass
 * the `setProgressValue` state setter to this function.
 *
 * For example, in the generated component:
 * const [progressValue, setProgressValue] = useState(0);
 * // ...
 * <Button onClick={() => updateExampleProgress(setProgressValue)}>Update Progress</Button>
 *
 * @param setProgress - The state setter function (e.g., setProgressValue)
 */
export const updateExampleProgress = (setProgress: (updater: (prev: number) => number) | ((value: number) => void) ) => {
  const newValue = Math.floor(Math.random() * 101); // Random progress
  console.log(`Setting progress via imported action to: ${newValue}`);
  if (typeof setProgress === 'function') {
    setProgress(newValue);
  } else {
    console.warn("setProgress function was not provided to updateExampleProgress.");
  }
};

export const anotherAction = () => {
  console.log("Another action was called!");
};
