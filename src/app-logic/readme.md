
# Custom Application Logic

This directory (`src/app-logic/`) is where you can define custom TypeScript functions that can be linked to your React Weaver designs.

## How to Use

1.  **Create Logic Files**: Create `.ts` files in this directory (e.g., `userActions.ts`, `apiHandlers.ts`).
2.  **Export Functions**: Within these files, write and export the functions you want to use as actions.

    ```typescript
    // Example: src/app-logic/myButtonLogic.ts
    export const handleLogin = () => {
      console.log("Login button clicked!");
      // Add your login logic here
      // You can import services, call APIs, etc.
    };

    export const submitForm = (formData: any) => {
      console.log("Form submitted with data:", formData);
      // Process form data
    };

    // Example of an action that might interact with state passed from the component
    export const incrementCounter = (setCounter: (updater: (prev: number) => number) => void) => {
      setCounter(prev => prev + 1);
    };
    ```

3.  **Link in React Weaver**:
    *   For a **Button** component, set its `onClickAction` prop in the React Weaver editor to `yourFileName/yourFunctionName`.
        *   Example: If your file is `myButtonLogic.ts` and your function is `handleLogin`, you would set `onClickAction` to `myButtonLogic/handleLogin`.
    *   The generated React component will automatically import `handleLogin` from `@/app-logic/myButtonLogic` and assign it to the button's `onClick` handler.

## Interacting with Component State

-   Components like the **Progress Bar** can have their `value` driven by a state variable defined by the `valueSource` prop (e.g., `uploadProgress`). This creates a `useState` hook in the generated UI component (e.g., `const [uploadProgress, setUploadProgress] = useState(0);`).
-   If your external functions in `src/app-logic/` need to modify such state, you'll need to pass the state setter function to them.

    For instance, if a button's `onClickAction` is `myActions/updateProgress`, and `myActions.ts` contains:
    ```typescript
    // src/app-logic/myActions.ts
    export const updateProgress = (setProgress) => {
      // ... some logic ...
      const newProgress = 75;
      setProgress(newProgress);
    };
    ```
    In the generated code, you might manually adjust the button's `onClick` to:
    `onClick={() => updateProgress(setUploadProgress)}` (assuming `setUploadProgress` is the setter for the progress bar's state).

This setup allows for a clean separation of your UI design (in React Weaver) and your application logic (in `src/app-logic/`).
