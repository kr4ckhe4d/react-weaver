import type { LucideIcon } from 'lucide-react';

export interface CanvasComponent {
  id: string;
  type: string; // Corresponds to AvailableComponent.id
  props: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
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
}
