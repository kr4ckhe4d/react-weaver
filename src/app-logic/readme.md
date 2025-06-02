
# Custom Application Logic

This directory (`src/app-logic/`) is where you define custom TypeScript functions that can be linked to your React Weaver designs, making the "Preview" tab an interactive application.

## How to Use

1.  **Create Logic Files**: Create `.ts` files in this directory (e.g., `userActions.ts`, `apiHandlers.ts`).
2.  **Export Functions**: Within these files, write and export the functions you want to use as actions. These functions will receive a `setters` object as their first argument.

    ```typescript
    // Example: src/app-logic/myButtonLogic.ts
    import type { AvailableSetters } from './types'; // Define this in types.ts

    export const handleLogin = (setters: AvailableSetters, /* other args if needed */) => {
      console.log("Login button clicked!");
      // Add your login logic here
      // You can import services, call APIs, etc.

      // Example of using a setter passed from React Weaver
      if (setters.setIsLoading) {
        setters.setIsLoading(true);
      }
    };

    export const submitForm = (setters: AvailableSetters, formData: any) => {
      console.log("Form submitted with data:", formData, { setters });
      // Process form data
      if (setters.setFormSubmissionStatus) {
        setters.setFormSubmissionStatus("Submitted successfully!");
      }
    };
    ```

3.  **Link in React Weaver**:
    *   For a **Button** component, set its `onClickAction` prop in the React Weaver editor to `yourFileName/yourFunctionName`.
        *   Example: If your file is `myButtonLogic.ts` and your function is `handleLogin`, you would set `onClickAction` to `myButtonLogic/handleLogin`.
    *   The Preview tab will attempt to import and call this function.

## Interacting with Component State (via `valueSource`)

-   Components like the **Progress Bar** can have their `value` driven by a state variable defined by the `valueSource` prop (e.g., `uploadProgress`). The React Weaver Preview environment automatically creates a state (e.g., `const [uploadProgress, setUploadProgress] = useState(initialValue);`) for each unique `valueSource`.
-   Your custom functions in `src/app-logic/` receive an object as their first argument. This object contains all the state setter functions created from `valueSource` props. The keys of this object are the setter names (e.g., `setUploadProgress`).

    ```typescript
    // src/app-logic/progressChanger.ts
    import type { AvailableSetters } from './types';

    export const setProgressToValue = (setters: AvailableSetters, targetValue: number, progressStateName: string = "myProgress") => {
      const setterName = `set${progressStateName.charAt(0).toUpperCase() + progressStateName.slice(1)}`;
      if (setters[setterName] && typeof setters[setterName] === 'function') {
        setters[setterName](targetValue);
        console.log(`Progress state '${progressStateName}' set to ${targetValue}`);
      } else {
        console.warn(`Setter '${setterName}' not found or not a function. Available setters:`, Object.keys(setters));
      }
    };
    ```
    To use `setProgressToValue` from a button to set a progress bar (with `valueSource="myProgress"`) to 75:
    *   Button's `onClickAction`: `progressChanger/setProgressToValue`
    *   **Limitation**: Currently, passing additional arguments like `75` or `"myProgress"` directly from the editor is not supported. You would create more specific functions in your `app-logic` folder, e.g.:
        ```typescript
        // src/app-logic/progressChanger.ts
        export const setMyProgressTo75 = (setters: AvailableSetters) => {
          if (setters.setMyProgress) {
            setters.setMyProgress(75);
          }
        };
        ```
        And then use `onClickAction="progressChanger/setMyProgressTo75"`.

This setup allows for a clean separation of your UI design (in React Weaver) and your application logic (in `src/app-logic/`), with the Preview tab acting as your live application.
