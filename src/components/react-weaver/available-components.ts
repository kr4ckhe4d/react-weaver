
import type { AvailableComponent } from '@/types';
import {
  IconButton,
  IconInput,
  IconCard,
  IconText,
  IconImage,
  IconSwitch,
  IconSlider,
  IconCheckbox,
  IconComponent
} from './icons';

export const GRID_SIZE = 20;

export const AVAILABLE_COMPONENTS: AvailableComponent[] = [
  {
    id: 'button',
    name: 'Button',
    icon: IconButton,
    defaultProps: { children: 'Button', variant: 'default', size: 'default' },
    defaultSize: { width: 120, height: 40 },
    propTypes: {
      children: { type: 'string', defaultValue: 'Button', label: 'Text' },
      variant: {
        type: 'select',
        options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        defaultValue: 'default',
        label: 'Variant'
      },
      size: {
        type: 'select',
        options: ['default', 'sm', 'lg', 'icon'],
        defaultValue: 'default',
        label: 'Size'
      },
    },
  },
  {
    id: 'input',
    name: 'Input Field',
    icon: IconInput,
    defaultProps: { placeholder: 'Enter text...' },
    defaultSize: { width: 200, height: 40 },
    propTypes: {
      placeholder: { type: 'string', defaultValue: 'Enter text...', label: 'Placeholder' },
      type: { type: 'select', options: ['text', 'password', 'email', 'number'], defaultValue: 'text', label: 'Type' },
    },
  },
  {
    id: 'text',
    name: 'Text Block',
    icon: IconText,
    defaultProps: { children: 'Some sample text', className: 'text-base' },
    defaultSize: { width: 200, height: 30 },
    propTypes: {
      children: { type: 'string', defaultValue: 'Some sample text', label: 'Content' },
      className: { type: 'string', defaultValue: 'text-base', label: 'Tailwind Classes (e.g. text-lg font-bold)'}
    },
  },
  {
    id: 'card',
    name: 'Card',
    icon: IconCard,
    isContainer: true, // This card can now accept children
    defaultProps: { title: 'Card Title', description: 'Card description here.', content: 'Drag components here.'}, // Updated content
    defaultSize: { width: 300, height: 200 },
    propTypes: {
        title: { type: 'string', defaultValue: 'Card Title', label: 'Title' },
        description: { type: 'string', defaultValue: 'Card description here.', label: 'Description' },
        content: { type: 'string', defaultValue: 'Drag components here.', label: 'Default Content (if no children)' },
    },
  },
  {
    id: 'image',
    name: 'Image',
    icon: IconImage,
    defaultProps: { src: `https://placehold.co/200x150.png`, alt: 'Placeholder Image', "data-ai-hint": "abstract texture" },
    defaultSize: { width: 200, height: 150 },
    propTypes: {
      src: { type: 'string', defaultValue: `https://placehold.co/200x150.png`, label: 'Image URL' },
      alt: { type: 'string', defaultValue: 'Placeholder Image', label: 'Alt Text' },
      "data-ai-hint": {type: 'string', defaultValue:'abstract texture', label: 'AI Hint'},
    },
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    icon: IconCheckbox,
    defaultProps: { label: 'Accept terms', checked: false },
    defaultSize: { width: 150, height: 24 },
    propTypes: {
        label: { type: 'string', defaultValue: 'Accept terms', label: 'Label'},
        checked: { type: 'boolean', defaultValue: false, label: 'Checked'}
    }
  },
  {
    id: 'switch',
    name: 'Switch',
    icon: IconSwitch,
    defaultProps: { checked: false },
    defaultSize: { width: 60, height: 30 },
    propTypes: {
        checked: {type: 'boolean', defaultValue: false, label: 'Enabled'}
    }
  },
   {
    id: 'placeholder',
    name: 'Placeholder',
    icon: IconComponent,
    defaultProps: { text: 'Placeholder' },
    defaultSize: { width: 100, height: 100 },
    propTypes: {
        text: {type: 'string', defaultValue: 'Placeholder', label: 'Label'}
    }
  },
];

export function getComponentConfig(type: string): AvailableComponent | undefined {
  return AVAILABLE_COMPONENTS.find(comp => comp.id === type);
}
