'use client';
import type { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
export function Sprite({
  x,
  y,
  w = 44,
  h = 44,
  scale = 1,
  className = '',
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  scale?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`sprite ${className}`}
      style={{
        width: w * scale,
        height: h * scale,
        backgroundSize: `${1536 * scale}px ${1024 * scale}px`,
        backgroundPosition: `${-x * scale}px ${-y * scale}px`,
      }}
    />
  );
}
export const nav = [
  'Home',
  'Finances',
  'Budgets',
  'Goals',
  'Vehicles',
  'Garage',
  'Work',
  'Lifestyle',
  'Analytics',
  'Settings',
];
export const navY = [77, 124, 168, 211, 261, 303, 351, 397, 445, 491];
export function Icon({
  index,
  scale = 0.85,
}: {
  index: number;
  scale?: number;
}) {
  return <Sprite x={61} y={navY[index]} w={44} h={45} scale={scale} />;
}
export function GoalIcon({ index }: { index: number }) {
  return (
    <Sprite
      x={1239}
      y={[403, 351, 238, 238, 299][index] ?? 238}
      w={55}
      h={48}
      scale={0.85}
    />
  );
}
export function Panel({
  title,
  children,
  className = '',
  extra,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  extra?: ReactNode;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-title">
          <h2>{title}</h2>
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}
export function Bar({
  value,
  color = 'green',
  label = 'Progress',
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <Progress
      aria-label={label}
      value={Math.min(100, Math.max(0, value))}
      className={`pixel-progress ${color}`}
    />
  );
}
