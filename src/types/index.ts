
import type { LucideIcon } from 'lucide-react';

export interface CanvasComponent {
  id: string;
  type: string; // Corresponds to AvailableComponent.id
  props: Record<string, any>;
  x: number; // Relative to parent if a child, otherwise relative to canvas
  y: number; // Relative to parent if a child, otherwise relative to canvas
  width: number;
  height: number;
  zIndex: number; // For top-level components; children are within parent's stacking context
  parentId?: string | null; // ID of the parent component, if any
  children?: CanvasComponent[];
}

export type PropValueType = 'string' | 'number' | 'boolean' | 'select' | 'color' | 'object' | 'array';

export interface PropDefinition {
  type: PropValueType;
  label?: string;
  options?: string[]; // For 'select' type
  defaultValue?: any;
}
export interface AvailableComponent {
  id: string;
  name: string;
  icon: LucideIcon | React.ElementType; // Allow custom SVG components too
  defaultProps: Record<string, any>;
  defaultSize: { width: number; height: number };
  propTypes: Record<string, PropDefinition>;
  isContainer?: boolean; // Indicates if this component can host children
  isCustom?: boolean; // Flag to identify custom components
}
