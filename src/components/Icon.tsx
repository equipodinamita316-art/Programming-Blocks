import type { ComponentType, SVGProps } from "react";
import {
  Map,
  Palette,
  Zap,
  FolderOpen,
  Star,
  Check,
  CircleCheck,
  CircleX,
  ArrowRight,
  ArrowLeft,
  Play,
  Globe,
  PartyPopper,
  Hourglass,
  Lock,
  Trophy,
  Sword,
  Shield,
  Swords,
  Timer,
  Target,
  FileText,
  Gamepad2,
  FlaskConical,
  Rocket,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Pencil,
  Keyboard,
  User,
  KeyRound,
  Menu,
  LogOut,
  Flame,
  ChartColumn,
  Sparkles,
  Monitor,
  Trash2,
  Lightbulb,
  TriangleAlert,
  Save,
  RefreshCw,
  ArrowDown,
  Printer,
  Cloud,
  Castle,
  Landmark,
  Moon,
  Medal,
  Ban,
  Circle,
  Dumbbell,
  X,
  Skull,
  Image as ImageIcon,
  Smartphone,
  Clipboard,
  Heart,
  Brush,
  Crown,
  WandSparkles,
  Puzzle,
  Compass,
  Eye,
  Upload,
  type LucideIcon,
} from "lucide-react";

type CustomIcon = (p: SVGProps<SVGSVGElement> & { size?: number }) => React.ReactElement;

function svgProps(size: number, className: string, strokeWidth: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

const Brick: CustomIcon = ({ size = 20, className = "", strokeWidth = 2.5, ...rest }) => (
  <svg {...svgProps(size, className, Number(strokeWidth))} {...rest}>
    <rect x="3" y="6" width="18" height="12" rx="1.5" />
    <path d="M9 6v6M15 6v6M6 12v6M12 12v6M18 12v6M3 12h18" />
  </svg>
);

const Bolt: CustomIcon = ({ size = 20, className = "", strokeWidth = 2.5, ...rest }) => (
  <svg {...svgProps(size, className, Number(strokeWidth))} {...rest}>
    <path d="M13 2 5 13h6l-1 9 8-11h-6z" />
  </svg>
);

const eje = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="1.6" fill="currentColor" stroke="none" />;

const BloquiHappy: CustomIcon = ({ size = 20, className = "", strokeWidth = 2.5, ...rest }) => (
  <svg {...svgProps(size, className, Number(strokeWidth))} {...rest}>
    {eje(9, 10)}
    {eje(15, 10)}
    <path d="M8 14c1.2 1.7 2.6 2.5 4 2.5s2.8-.8 4-2.5" />
  </svg>
);
const BloquiThink: CustomIcon = ({ size = 20, className = "", strokeWidth = 2.5, ...rest }) => (
  <svg {...svgProps(size, className, Number(strokeWidth))} {...rest}>
    {eje(9, 10)}
    {eje(15, 10)}
    <path d="M8.5 15h7" />
    <path d="M13 6.5c1.4-.8 3-.4 3.6 1" />
  </svg>
);
const BloquiWow: CustomIcon = ({ size = 20, className = "", strokeWidth = 2.5, ...rest }) => (
  <svg {...svgProps(size, className, Number(strokeWidth))} {...rest}>
    <circle cx="9" cy="10" r="2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15.5" r="1.7" />
  </svg>
);
const BloquiSleep: CustomIcon = ({ size = 20, className = "", strokeWidth = 2.5, ...rest }) => (
  <svg {...svgProps(size, className, Number(strokeWidth))} {...rest}>
    <path d="M7 10c.7.9 1.3.9 2 0M15 10c.7.9 1.3.9 2 0" />
    <path d="M9.5 15h5" />
  </svg>
);

const ICONS = {
  map: Map,
  blocks: Brick,
  bricks: Brick,
  html: Brick,
  css: Palette,
  palette: Palette,
  js: Bolt,
  bolt: Bolt,
  zap: Zap,
  folder: FolderOpen,
  folderOpen: FolderOpen,
  star: Star,
  check: Check,
  checkCircle: CircleCheck,
  xCircle: CircleX,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowDown: ArrowDown,
  play: Play,
  globe: Globe,
  party: PartyPopper,
  hourglass: Hourglass,
  lock: Lock,
  trophy: Trophy,
  sword: Sword,
  shield: Shield,
  swords: Swords,
  timer: Timer,
  target: Target,
  file: FileText,
  gamepad: Gamepad2,
  flask: FlaskConical,
  rocket: Rocket,
  book: BookOpen,
  graduation: GraduationCap,
  clipboardList: ClipboardList,
  pencil: Pencil,
  keyboard: Keyboard,
  user: User,
  key: KeyRound,
  menu: Menu,
  logout: LogOut,
  flame: Flame,
  chart: ChartColumn,
  sparkles: Sparkles,
  monitor: Monitor,
  trash: Trash2,
  lightbulb: Lightbulb,
  warning: TriangleAlert,
  save: Save,
  refresh: RefreshCw,
  printer: Printer,
  cloud: Cloud,
  castle: Castle,
  landmark: Landmark,
  moon: Moon,
  medal: Medal,
  ban: Ban,
  circle: Circle,
  dumbbell: Dumbbell,
  close: X,
  x: X,
  boss: Skull,
  image: ImageIcon,
  smartphone: Smartphone,
  clipboard: Clipboard,
  heart: Heart,
  brush: Brush,
  crown: Crown,
  wand: WandSparkles,
  puzzle: Puzzle,
  compass: Compass,
  eye: Eye,
  upload: Upload,
} satisfies Record<string, LucideIcon | CustomIcon>;

const CUSTOM = {
  "bloqui-happy": BloquiHappy,
  "bloqui-think": BloquiThink,
  "bloqui-wow": BloquiWow,
  "bloqui-sleep": BloquiSleep,
} satisfies Record<string, CustomIcon>;

export type IconName = keyof typeof ICONS | keyof typeof CUSTOM;

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 2.5,
  ...rest
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "name" | "size">) {
  if (name in CUSTOM) {
    const C = CUSTOM[name as keyof typeof CUSTOM] as ComponentType<
      SVGProps<SVGSVGElement> & { size?: number }
    >;
    return <C size={size} className={className} strokeWidth={strokeWidth} {...rest} />;
  }
  const C = ICONS[name as keyof typeof ICONS] as LucideIcon;
  return <C size={size} className={className} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}
