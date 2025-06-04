
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
  AlertTriangle,
  CircleUserRound, // More specific than User
  Tags, // Using Tags for Badge, Tag might be a single tag icon
  CaseSensitive, // For Label
  Minus, // Re-using for Progress and Separator
  ListChecks, // For RadioGroup
  ScrollText, // For ScrollArea
  ChevronsUpDown, // For Select component
  RectangleHorizontal, // For Skeleton
  Table as LucideTable, // For Table component
  GalleryHorizontal, // For Tabs component
  FileText, // For Textarea
  PanelRightOpen, // For Accordion
  Puzzle, // Icon for custom components
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
export const IconButton = MousePointerSquareDashed;
export const IconCard = Columns; // Placeholder for Card
export const IconSwitch = ToggleLeft;
export const IconSlider = SlidersHorizontal;
export const IconCheckbox = CheckSquare;
// export const IconSelect = ChevronDown; // Replaced by more specific IconSelect below

// Default/Fallback Icon
export const IconComponent = Square;

// Newly added icons for more ShadCN components
export const IconAccordion = PanelRightOpen;
export const IconAlert = AlertTriangle;
export const IconAvatar = CircleUserRound;
export const IconBadge = Tags; // Using Tags for a more "badge collection" feel
export const IconLabel = CaseSensitive;
export const IconProgress = Minus; // Can be reused
export const IconRadioGroup = ListChecks;
export const IconScrollArea = ScrollText;
export const IconSelect = ChevronsUpDown; // Specific for the Select component
export const IconSeparator = Minus; // Re-using for separator
export const IconSkeleton = RectangleHorizontal;
export const IconTable = LucideTable;
export const IconTabs = GalleryHorizontal;
export const IconTextarea = FileText;

// Icon for Custom Components
export const IconPuzzlePiece = Puzzle;
