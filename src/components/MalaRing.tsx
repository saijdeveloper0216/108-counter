import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TOTAL_COUNT, colors } from '../constants/theme';

type MalaRingProps = {
  count: number;
  size: number;
};

const BEAD_RADIUS_RATIO = 0.034;
const OUTER_INSET_RATIO = 0.014;

/** Center mandala diameter — leaves room for coin ring on the outer rim. */
export function computeMalaMandalaSize(ringSize: number): number {
  const beadRadius = ringSize * BEAD_RADIUS_RATIO;
  const coinRingRadius = ringSize / 2 - beadRadius - ringSize * OUTER_INSET_RATIO;
  const gap = ringSize * 0.022;
  return Math.floor(2 * (coinRingRadius - beadRadius - gap));
}

export function MalaRing({ count, size }: MalaRingProps) {
  const center = size / 2;
  const beadRadius = size * BEAD_RADIUS_RATIO;
  const ringRadius = size / 2 - beadRadius - size * OUTER_INSET_RATIO;

  const beads = Array.from({ length: TOTAL_COUNT }, (_, index) => {
    const angle = (index / TOTAL_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = center + ringRadius * Math.cos(angle);
    const y = center + ringRadius * Math.sin(angle);
    const filled = index < count;
    return { x, y, filled, key: index };
  });

  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        <LinearGradient id="malaRingGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.saffron} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={colors.gold} stopOpacity="0.15" />
        </LinearGradient>
        <LinearGradient id="malaBeadFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#fff4c2" />
          <Stop offset="45%" stopColor={colors.beadActive} />
          <Stop offset="100%" stopColor={colors.goldDark} />
        </LinearGradient>
      </Defs>
      <Circle
        cx={center}
        cy={center}
        r={ringRadius}
        stroke="url(#malaRingGlow)"
        strokeWidth={2}
        fill="none"
      />
      {beads.map((bead) => (
        <Circle
          key={bead.key}
          cx={bead.x}
          cy={bead.y}
          r={beadRadius}
          fill={bead.filled ? 'url(#malaBeadFill)' : colors.beadInactive}
          stroke={bead.filled ? colors.beadGlow : 'rgba(255, 215, 0, 0.12)'}
          strokeWidth={bead.filled ? 1.5 : 1}
        />
      ))}
    </Svg>
  );
}
