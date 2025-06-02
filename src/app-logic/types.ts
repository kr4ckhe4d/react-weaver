
// src/app-logic/types.ts

/**
 * Describes the object of state setters passed to functions in app-logic.
 * The keys are dynamically generated based on `valueSource` props
 * (e.g., if valueSource="myProgress", key will be "setMyProgress").
 * The value is the React state setter function.
 */
export interface AvailableSetters {
  [setterName: string]: React.Dispatch<React.SetStateAction<any>>;
}
