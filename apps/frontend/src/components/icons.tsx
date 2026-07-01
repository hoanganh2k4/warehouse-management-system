type IconProps = {
  size?: number;
};

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function BarcodeMark({ size = 26 }: IconProps) {
  // Signature mark: an uneven barcode, standing in for the scan-and-shelve
  // rhythm of a warehouse. Widths are intentionally irregular.
  const bars = [2, 1, 3, 1, 2, 1, 1, 3, 2];
  let x = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {bars.map((w, i) => {
        const rect = (
          <rect key={i} x={x} y={2} width={w} height={20} rx={0.5} fill="currentColor" />
        );
        x += w + 1;
        return rect;
      })}
    </svg>
  );
}

export function GridIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function BoxIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
      <path d="M3 7.5v9L12 21l9-4.5v-9" />
      <path d="M12 12v9" />
    </svg>
  );
}

export function LayersIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" />
      <path d="M2.5 13 12 18l9.5-5" />
      <path d="M2.5 18 12 23l9.5-5" />
    </svg>
  );
}

export function WarehouseIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M4.5 9.5V20h15V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

export function SwapIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M4 8h13l-3.5-3.5" />
      <path d="M20 16H7l3.5 3.5" />
    </svg>
  );
}

export function UsersIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 19c.7-3.2 3.2-5 6.2-5s5.5 1.8 6.2 5" />
      <path d="M16 4.3c1.6.4 2.8 1.9 2.8 3.6 0 1.7-1.2 3.2-2.8 3.6" />
      <path d="M18.4 14.4c2 .6 3.5 2.2 3.9 4.6" />
    </svg>
  );
}

export function SettingsIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.4a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.96 17.7a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H2.6a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.3 6.96a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H8.7a1.7 1.7 0 0 0 1.04-1.56V.6a2 2 0 1 1 4 0v.09c0 .68.4 1.28 1.04 1.56.66.28 1.42.14 1.94-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.48.48-.62 1.24-.34 1.87v.03c.28.64.88 1.04 1.56 1.04h.19a2 2 0 1 1 0 4h-.09c-.68 0-1.28.4-1.56 1.04Z" />
    </svg>
  );
}

export function SearchIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M14 4h6v6" />
      <path d="M10 14 20 4" />
      <path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

export function ScaleIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 3v18" />
      <path d="M5 8h14" />
      <path d="m5 8-3 6a3.3 3.3 0 0 0 6 0Z" />
      <path d="m19 8 3 6a3.3 3.3 0 0 1-6 0Z" />
    </svg>
  );
}

export function TagIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M3 3h7.6a1.9 1.9 0 0 1 1.35.56L21 12.6l-9.5 9.5-8.5-8.5a1.9 1.9 0 0 1-.56-1.35V3.56" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AlertIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 9v4.5" />
      <path d="M10.3 3.9 2.5 18a1.7 1.7 0 0 0 1.5 2.5h16a1.7 1.7 0 0 0 1.5-2.5L13.7 3.9a1.7 1.7 0 0 0-3.4 0Z" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
