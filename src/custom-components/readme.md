
# Custom Components for React Weaver

This directory (`src/custom-components/`) is where you can define your own React components to be used within the React Weaver visual editor.

## How to Create a Custom Component

1.  **Create a `.tsx` File**:
    Create a new `.tsx` file for your component in this directory (e.g., `MyCustomButton.tsx`).

2.  **Write Your React Component**:
    Develop your React component as you normally would. It can have its own state, props, and logic.

    ```tsx
    // src/custom-components/MyCustomButton.tsx
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button'; // You can use ShadCN components

    interface MyCustomButtonProps {
      label?: string;
      initialClicks?: number;
      onCustomClick?: (clicks: number) => void; // Example of a custom event prop
    }

    const MyCustomButton: React.FC<MyCustomButtonProps> = ({
      label = "Click Me (Custom)",
      initialClicks = 0,
      onCustomClick,
    }) => {
      const [clicks, setClicks] = useState(initialClicks);

      const handleClick = () => {
        const newClicks = clicks + 1;
        setClicks(newClicks);
        onCustomClick?.(newClicks); // For generated code, not directly usable in Preview yet
        console.log(`Custom button clicked ${newClicks} times`);
      };

      return (
        <div className="p-2 border border-dashed border-primary rounded-md h-full flex flex-col items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground mb-2">MyCustomButton</p>
          <Button onClick={handleClick} variant="outline">
            {label} - Clicks: {clicks}
          </Button>
        </div>
      );
    };

    export default MyCustomButton;
    ```

3.  **Export `componentConfig`**:
    In the same file, export a `const` named `componentConfig`. This object tells React Weaver about your component.

    ```tsx
    // src/custom-components/MyCustomButton.tsx
    // ... (component code from above) ...

    export const componentConfig = {
      // A unique ID for your component. Convention: 'custom_ComponentName'
      id: 'custom_MyCustomButton',
      // Display name in the React Weaver component library
      name: 'My Button (Custom)',
      // Default props for when the component is dragged onto the canvas
      defaultProps: {
        label: 'Default Label',
        initialClicks: 0,
      },
      // Default size on the canvas
      defaultSize: { width: 200, height: 80 },
      // Prop types for the React Weaver Prop Editor panel
      propTypes: {
        label: { type: 'string', defaultValue: 'Default Label', label: 'Button Text' },
        initialClicks: { type: 'number', defaultValue: 0, label: 'Initial Click Count' },
        // Note: 'onCustomClick' is a function prop. For now, the Prop Editor
        // doesn't have a field for function props. You'd set this in generated code.
      },
    };
    ```
    *   `id`: Must be unique. Use the convention `custom_ComponentName` where `ComponentName` matches your component's filename/exported name.
    *   `name`: How it appears in the component library.
    *   `defaultProps`: Initial props when dragged.
    *   `defaultSize`: Initial dimensions on the canvas.
    *   `propTypes`: Defines what appears in the Prop Editor. Supports types like `'string'`, `'number'`, `'boolean'`, `'select'`, etc. (See `src/types/index.ts` `PropDefinition`).

4.  **Manually Register Your Component**:
    *   Open `src/components/react-weaver/available-components.ts`.
    *   Import your `componentConfig`:
        ```ts
        import { componentConfig as MyCustomButtonConfig } from '@/custom-components/MyCustomButton';
        ```
    *   Add it to the `AVAILABLE_COMPONENTS` array:
        ```ts
        // ... other components
        {
          id: MyCustomButtonConfig.id,
          name: MyCustomButtonConfig.name,
          icon: IconPuzzlePiece, // Or your own custom icon
          defaultProps: MyCustomButtonConfig.defaultProps,
          defaultSize: MyCustomButtonConfig.defaultSize,
          propTypes: MyCustomButtonConfig.propTypes,
          isCustom: true, // Indicate it's a custom component
        },
        ```

5.  **Update Renderers (If not already generic):**
    React Weaver's renderers (`CanvasItemRenderer.tsx` and `DesignPreviewRenderer.tsx`) need to know how to display your component.
    *   Open `src/components/react-weaver/canvas-item-renderer.tsx`.
    *   Import your component: `import MyCustomButton from '@/custom-components/MyCustomButton';`
    *   Add it to the `CustomComponentMap`:
        ```ts
        const CustomComponentMap: Record<string, React.FC<any>> = {
          'custom_ExampleCounter': ExampleCounter, // Existing example
          'custom_MyCustomButton': MyCustomButton, // Your new component
        };
        ```
    *   Repeat for `src/components/react-weaver/design-preview-renderer.tsx`.

6.  **Restart Your Development Server**:
    After adding new files and updating imports, it's often good to restart your Next.js development server.

Your custom component should now appear in the Component Library panel and be usable in React Weaver!

## Limitations in Preview

*   **`onClickAction` and `valueSource`**: These props are deeply integrated into the Preview environment for built-in components. For custom components, these props will be passed down, but your custom component itself needs to be designed to use them if you want them to interact with the Preview's state system or action system.
*   **Custom Event Props (e.g., `onCustomClick`)**: Props that are functions (event handlers) defined in your custom component's `propTypes` won't have a UI in the Prop Editor to link them to `app-logic` actions directly like the built-in Button's `onClickAction`. You would typically handle these in the generated code.

This system provides a powerful way to extend React Weaver with your own reusable UI pieces.
