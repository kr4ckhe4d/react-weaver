
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
  IconComponent,
  IconAccordion,
  IconAlert,
  IconAvatar,
  IconBadge,
  IconLabel,
  IconProgress,
  IconRadioGroup,
  IconScrollArea,
  IconSelect,
  IconSeparator,
  IconSkeleton,
  IconTable,
  IconTabs,
  IconTextarea,
  IconPuzzlePiece, // Generic icon for custom components
} from './icons';

// Import config for custom components
import { componentConfig as ExampleCounterConfig } from '@/custom-components/ExampleCounter';

export const GRID_SIZE = 20;

export const AVAILABLE_COMPONENTS: AvailableComponent[] = [
  // Forms
  {
    id: 'button',
    name: 'Button',
    icon: IconButton,
    category: 'Forms',
    defaultProps: { children: 'Button', variant: 'default', size: 'default', onClickAction: '' },
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
      onClickAction: { type: 'select', label: 'onClick Action', defaultValue: '' },
    },
  },
  {
    id: 'input',
    name: 'Input Field',
    icon: IconInput,
    category: 'Forms',
    defaultProps: { placeholder: 'Enter text...' },
    defaultSize: { width: 200, height: 40 },
    propTypes: {
      placeholder: { type: 'string', defaultValue: 'Enter text...', label: 'Placeholder' },
      type: { type: 'select', options: ['text', 'password', 'email', 'number'], defaultValue: 'text', label: 'Type' },
      valueSource: { type: 'string', label: 'Value Source (State Var)', defaultValue: '' },
    },
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    icon: IconCheckbox,
    category: 'Forms',
    defaultProps: { label: 'Accept terms', checked: false },
    defaultSize: { width: 150, height: 24 },
    propTypes: {
        label: { type: 'string', defaultValue: 'Accept terms', label: 'Label'},
        checked: { type: 'boolean', defaultValue: false, label: 'Checked'},
        valueSource: { type: 'string', label: 'Checked Source (State Var)', defaultValue: '' },
    }
  },
  {
    id: 'switch',
    name: 'Switch',
    icon: IconSwitch,
    category: 'Forms',
    defaultProps: { checked: false },
    defaultSize: { width: 60, height: 30 },
    propTypes: {
        checked: {type: 'boolean', defaultValue: false, label: 'Enabled'},
        valueSource: { type: 'string', label: 'Enabled Source (State Var)', defaultValue: '' },
    }
  },
  {
    id: 'radioGroup',
    name: 'Radio Group',
    icon: IconRadioGroup,
    category: 'Forms',
    defaultProps: { defaultValue: 'option-one', items: [{ value: 'option-one', label: 'Option One' }, { value: 'option-two', label: 'Option Two' }] },
    defaultSize: { width: 180, height: 80 },
    propTypes: {
      defaultValue: { type: 'string', label: 'Default Value' },
      items: { type: 'array', label: 'Items (JSON: {value, label}[])', defaultValue: [{ value: 'option-one', label: 'Option One' }] },
    },
  },
  {
    id: 'select',
    name: 'Select',
    icon: IconSelect,
    category: 'Forms',
    defaultProps: { placeholder: 'Select an option', items: [{ value: 'item1', label: 'Item 1' }, { value: 'item2', label: 'Item 2' }] },
    defaultSize: { width: 200, height: 40 },
    propTypes: {
      placeholder: { type: 'string', defaultValue: 'Select an option', label: 'Placeholder' },
      items: { type: 'array', label: 'Items (JSON: {value, label}[])', defaultValue: [{ value: 'item1', label: 'Item 1' }] },
    },
  },
  {
    id: 'textarea',
    name: 'Textarea',
    icon: IconTextarea,
    category: 'Forms',
    defaultProps: { placeholder: 'Type your message here.' },
    defaultSize: { width: 250, height: 100 },
    propTypes: {
      placeholder: { type: 'string', defaultValue: 'Type your message here.', label: 'Placeholder' },
      valueSource: { type: 'string', label: 'Value Source (State Var)', defaultValue: '' },
    },
  },
  // Content
  {
    id: 'text',
    name: 'Text Block',
    icon: IconText,
    category: 'Content',
    defaultProps: {
      children: 'Some sample text',
      className: '',
      textAlign: 'left',
      fontWeight: 'normal',
      fontSize: 'text-base',
      customTextColor: '',
      customBackgroundColor: ''
    },
    defaultSize: { width: 200, height: 30 },
    propTypes: {
      children: { type: 'string', defaultValue: 'Some sample text', label: 'Content' },
      className: { type: 'string', defaultValue: '', label: 'Custom Tailwind Classes'},
      textAlign: { type: 'select', options: ['left', 'center', 'right', 'justify'], defaultValue: 'left', label: 'Text Align'},
      fontWeight: { type: 'select', options: ['normal', 'medium', 'semibold', 'bold'], defaultValue: 'normal', label: 'Font Weight'},
      fontSize: { type: 'select', options: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'], defaultValue: 'text-base', label: 'Font Size'},
      customTextColor: { type: 'string', defaultValue: '', label: 'Text Color (CSS)'},
      customBackgroundColor: { type: 'string', defaultValue: '', label: 'Background Color (CSS)'}
    },
  },
  {
    id: 'image',
    name: 'Image',
    icon: IconImage,
    category: 'Content',
    defaultProps: { src: `https://placehold.co/200x150.png`, alt: 'Placeholder Image', "data-ai-hint": "abstract texture" },
    defaultSize: { width: 200, height: 150 },
    propTypes: {
      src: { type: 'string', defaultValue: `https://placehold.co/200x150.png`, label: 'Image URL' },
      alt: { type: 'string', defaultValue: 'Placeholder Image', label: 'Alt Text' },
      "data-ai-hint": {type: 'string', defaultValue:'abstract texture', label: 'AI Hint'},
    },
  },
  {
    id: 'alert',
    name: 'Alert',
    icon: IconAlert,
    category: 'Content',
    defaultProps: { variant: 'default', title: 'Heads up!', description: 'This is an alert message.' },
    defaultSize: { width: 320, height: 100 },
    propTypes: {
      variant: { type: 'select', options: ['default', 'destructive'], defaultValue: 'default', label: 'Variant' },
      title: { type: 'string', defaultValue: 'Heads up!', label: 'Title' },
      description: { type: 'string', defaultValue: 'This is an alert message.', label: 'Description' },
    },
  },
  {
    id: 'avatar',
    name: 'Avatar',
    icon: IconAvatar,
    category: 'Content',
    defaultProps: { src: 'https://placehold.co/40x40.png', fallback: 'AV', "data-ai-hint": "profile person" },
    defaultSize: { width: 40, height: 40 },
    propTypes: {
      src: { type: 'string', label: 'Image URL', defaultValue: 'https://placehold.co/40x40.png' },
      fallback: { type: 'string', defaultValue: 'AV', label: 'Fallback (2 chars)' },
      "data-ai-hint": {type: 'string', defaultValue:'profile person', label: 'AI Hint'},
    },
  },
  {
    id: 'badge',
    name: 'Badge',
    icon: IconBadge,
    category: 'Content',
    defaultProps: { children: 'Badge', variant: 'default' },
    defaultSize: { width: 80, height: 28 },
    propTypes: {
      children: { type: 'string', defaultValue: 'Badge', label: 'Text' },
      variant: { type: 'select', options: ['default', 'secondary', 'destructive', 'outline'], defaultValue: 'default', label: 'Variant' },
    },
  },
  {
    id: 'label',
    name: 'Label',
    icon: IconLabel,
    category: 'Content',
    defaultProps: { children: 'This is a label' },
    defaultSize: { width: 120, height: 24 },
    propTypes: {
      children: { type: 'string', defaultValue: 'This is a label', label: 'Text' },
      valueSource: { type: 'string', label: 'Text Source (State Var)', defaultValue: '' },
    },
  },
  {
    id: 'progress',
    name: 'Progress Bar',
    icon: IconProgress,
    category: 'Content',
    defaultProps: { value: 60 },
    defaultSize: { width: 200, height: 16 },
    propTypes: {
      value: { type: 'number', defaultValue: 60, label: 'Value (0-100)' },
      valueSource: { type: 'string', label: 'Value Source (State Var)', defaultValue: '' },
    },
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    icon: IconSkeleton,
    category: 'Content',
    defaultProps: { className: 'h-4 w-full rounded-md' },
    defaultSize: { width: 200, height: 20 },
    propTypes: {
      className: { type: 'string', defaultValue: 'h-4 w-full rounded-md', label: 'Tailwind Classes for appearance' },
    },
  },
  {
    id: 'table',
    name: 'Table',
    icon: IconTable,
    category: 'Content',
    defaultProps: {
      caption: 'A list of recent invoices.',
      headers: ['Invoice', 'Status', 'Method', 'Amount'],
      rows: [
        ['INV001', 'Paid', 'Credit Card', '$250.00'],
        ['INV002', 'Pending', 'PayPal', '$150.00'],
      ],
    },
    defaultSize: { width: 450, height: 200 },
    propTypes: {
      caption: { type: 'string', defaultValue: 'A list of recent invoices.', label: 'Table Caption' },
      headers: { type: 'array', label: 'Headers (JSON: string[])', defaultValue: ['Header 1', 'Header 2'] },
      rows: { type: 'array', label: 'Rows (JSON: string[][])', defaultValue: [['Cell 1-1', 'Cell 1-2']] },
    },
  },
  // Layout & Navigation
  {
    id: 'card',
    name: 'Card',
    icon: IconCard,
    category: 'Layout & Navigation',
    isContainer: true,
    defaultProps: { title: 'Card Title', description: 'Card description here.', content: 'Drag components here.'},
    defaultSize: { width: 300, height: 200 },
    propTypes: {
        title: { type: 'string', defaultValue: 'Card Title', label: 'Title' },
        description: { type: 'string', defaultValue: 'Card description here.', label: 'Description' },
        content: { type: 'string', defaultValue: 'Drag components here.', label: 'Default Content (if no children)' },
    },
  },
  {
    id: 'accordion',
    name: 'Accordion',
    icon: IconAccordion,
    category: 'Layout & Navigation',
    defaultProps: { type: 'single', collapsible: true, items: [{ value: 'item-1', title: 'Section 1 Title', content: 'Content for section 1.' }, { value: 'item-2', title: 'Section 2 Title', content: 'Content for section 2.' }] },
    defaultSize: { width: 300, height: 150 },
    propTypes: {
      type: { type: 'select', options: ['single', 'multiple'], defaultValue: 'single', label: 'Type' },
      collapsible: { type: 'boolean', defaultValue: true, label: 'Collapsible (for single type)' },
      items: { type: 'array', label: 'Items (JSON: {value, title, content}[])', defaultValue: [{ value: 'item-1', title: 'Section 1 Title', content: 'Content for section 1.' }] },
    },
  },
  {
    id: 'scrollArea',
    name: 'Scroll Area',
    icon: IconScrollArea,
    category: 'Layout & Navigation',
    isContainer: true,
    defaultProps: { contentPlaceholder: 'Drag scrollable content here' },
    defaultSize: { width: 250, height: 150 },
    propTypes: {
        contentPlaceholder: { type: 'string', defaultValue: 'Drag scrollable content here', label: 'Placeholder (if empty)' },
    },
  },
  {
    id: 'separator',
    name: 'Separator',
    icon: IconSeparator,
    category: 'Layout & Navigation',
    defaultProps: { orientation: 'horizontal' },
    defaultSize: { width: 200, height: 1 },
    propTypes: {
      orientation: { type: 'select', options: ['horizontal', 'vertical'], defaultValue: 'horizontal', label: 'Orientation (Note: Resize to change visual orientation)' },
    },
  },
  {
    id: 'tabs',
    name: 'Tabs',
    icon: IconTabs,
    category: 'Layout & Navigation',
    defaultProps: {
      defaultValue: 'tab1',
      items: [
        { value: 'tab1', title: 'Account', content: 'Make changes to your account here.' },
        { value: 'tab2', title: 'Password', content: 'Change your password here.' },
      ],
    },
    defaultSize: { width: 350, height: 200 },
    propTypes: {
      defaultValue: { type: 'string', label: 'Default Tab Value' },
      items: { type: 'array', label: 'Tabs (JSON: {value, title, content}[])', defaultValue: [{ value: 'tab1', title: 'Tab 1', content: 'Content for Tab 1' }] },
    },
  },
  // Miscellaneous
  {
    id: 'placeholder',
    name: 'Placeholder',
    icon: IconComponent,
    category: 'Miscellaneous',
    defaultProps: { text: 'Placeholder' },
    defaultSize: { width: 100, height: 100 },
    propTypes: {
        text: {type: 'string', defaultValue: 'Placeholder', label: 'Label'}
    }
  },
  // Custom Components
  {
    id: ExampleCounterConfig.id, // 'custom_ExampleCounter'
    name: ExampleCounterConfig.name,
    icon: IconPuzzlePiece, // Generic icon for custom components
    category: 'Custom',
    defaultProps: ExampleCounterConfig.defaultProps,
    defaultSize: ExampleCounterConfig.defaultSize,
    propTypes: ExampleCounterConfig.propTypes,
    isCustom: true,
  },
];

export function getComponentConfig(type: string): AvailableComponent | undefined {
  return AVAILABLE_COMPONENTS.find(comp => comp.id === type);
}
