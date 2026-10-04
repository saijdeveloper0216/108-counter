import Svg, { Circle, Path } from 'react-native-svg';

export function TempleIcon({ color, size = 26 }: { color: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="16" cy="3" r="0.9" fill={color} stroke="none" />
    <Path d="M16 5L9 10H23L16 5ZM8 14H24M5 20H27M10 11L5 29M22 11L27 29M3 29H29M14 29V24Q16 21 18 24V29" />
  </Svg>;
}

export function LotusIcon({ color = '#e9b85a', size = 30 }: { color?: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round">
    <Path d="M16 26C8 20 10 12 16 5C22 12 24 20 16 26ZM16 26C6 25 3 18 4 12C11 13 15 19 16 26ZM16 26C26 25 29 18 28 12C21 13 17 19 16 26ZM16 26C8 30 2 26 1 21C8 19 13 22 16 26ZM16 26C24 30 30 26 31 21C24 19 19 22 16 26Z" />
  </Svg>;
}
