type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const defaults = {
  size: 16,
  strokeWidth: 1.75,
  className: "",
};

function base({ size, strokeWidth, className }: Required<IconProps>) {
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
  };
}

function withDefaults(props: IconProps): Required<IconProps> {
  return { ...defaults, ...props };
}

export function PlayIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StopIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}

export function TvIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M17 2l-5 5-5-5" />
    </svg>
  );
}

export function RecordIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export function FilmIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 3v18" />
      <path d="M17 3v18" />
      <path d="M3 8h4" />
      <path d="M17 8h4" />
      <path d="M3 16h4" />
      <path d="M17 16h4" />
    </svg>
  );
}

export function MessageIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 9v12h14V9" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <circle cx="17" cy="8" r="3" />
      <path d="M22 21a5 5 0 0 0-5-5" />
    </svg>
  );
}

export function VideoIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <polygon points="16 10 22 6 22 18 16 14" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArchiveIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M10 13h4" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function CircleDotIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)} className={`spinner ${p.className}`}>
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </svg>
  );
}

export function MaximizeIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M3 9V3h6" />
      <path d="M21 9V3h-6" />
      <path d="M3 15v6h6" />
      <path d="M21 15v6h-6" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function FolderOpenIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function HardDriveIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.5 5h13a2 2 0 0 1 1.7 1l1.8 4v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l1.8-4A2 2 0 0 1 5.5 5z" />
      <line x1="6" y1="16" x2="6.01" y2="16" />
      <line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SkipBack5Icon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M11.5 4.5a8 8 0 1 0 7.5 5.5" />
      <polyline points="11.5 1.5 11.5 4.5 14.5 4.5" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        5
      </text>
    </svg>
  );
}

export function SkipForward5Icon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M12.5 4.5a8 8 0 1 1-7.5 5.5" />
      <polyline points="12.5 1.5 12.5 4.5 9.5 4.5" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        5
      </text>
    </svg>
  );
}

export function VolumeHighIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export function VolumeLowIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  );
}

export function VolumeMutedIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

export function TheaterIcon(props: IconProps) {
  // "Cinema" / theater rectangle with two side bars (matches YouTube cinema mode glyph).
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="6" y1="6" x2="6" y2="18" />
      <line x1="18" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function FullscreenIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M4 9V4h5" />
      <path d="M20 9V4h-5" />
      <path d="M4 15v5h5" />
      <path d="M20 15v5h-5" />
    </svg>
  );
}

export function FullscreenExitIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <path d="M9 4v5H4" />
      <path d="M15 4v5h5" />
      <path d="M9 20v-5H4" />
      <path d="M15 20v-5h5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  const p = withDefaults(props);
  return (
    <svg {...base(p)}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
