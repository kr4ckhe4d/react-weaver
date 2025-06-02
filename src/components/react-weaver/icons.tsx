
import {
  MousePointerSquareDashed,
  Type,
  Image as LucideImage,
  ToggleLeft,
  SlidersHorizontal,
  Square,
  CheckSquare,
  Columns,
  ChevronDown,
  Palette,
  Code,
  Download,
  Trash2,
  GripVertical,
  Settings,
  PlusCircle,
  Layers,
  Move,
  Maximize2,
  ExternalLink,
  Copy,
} from 'lucide-react';

// General UI Icons
export const IconCode = Code;
export const IconDownload = Download;
export const IconSettings = Settings;
export const IconPlusCircle = PlusCircle;
export const IconTrash = Trash2;
export const IconGripVertical = GripVertical;
export const IconLayers = Layers; // For z-index or layers panel
export const IconMove = Move; // For drag handle
export const IconMaximize = Maximize2; // For resize handle
export const IconExternalLink = ExternalLink;
export const IconCopy = Copy;


// Component Specific Icons
export const IconText = Type;
export const IconImage = LucideImage;
export const IconInput = Square; // Placeholder for Input/Text Field
export const IconButton = MousePointerSquareDashed; // Changed from MousePointerSquare
export const IconCard = Columns; // Placeholder for Card
export const IconSwitch = ToggleLeft;
export const IconSlider = SlidersHorizontal;
export const IconCheckbox = CheckSquare;
export const IconSelect = ChevronDown; // Placeholder, could be more specific
export const IconColorPicker = Palette; // For color prop type

// Default/Fallback Icon
export const IconComponent = Square;
