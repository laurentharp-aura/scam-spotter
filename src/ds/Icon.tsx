import type { CSSProperties } from 'react';
import { iconData, type IconName } from './iconData';

export type { IconName };

// Mirrors DesignSystem_def12d.Icon: path markup from the DS icon set, coloured via currentColor.
export function Icon({ name, size, style }: { name: IconName; size: number; style?: CSSProperties }) {
  const d = iconData[name];
  return (
    <svg width={size} height={size} viewBox={d.viewBox} fill="none" style={style} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: d.body }} />
  );
}
