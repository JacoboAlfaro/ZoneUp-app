import { Text } from 'react-native';

import { GlassCard } from './GlassCard';

interface Props {
  value: number | string;
  label: string;
  valueClassName?: string;
}

export default function DashboardStat({ value, label, valueClassName }: Props) {
  return (
    <GlassCard className="min-h-28 h-28 flex-1 justify-between p-4 ">
      <Text className={`text-3xl font-bold text-zu-navy ${valueClassName ?? ''}`}>
        {value}
      </Text>
      <Text className="mt-2 text-xs leading-4 text-zu-slate">{label}</Text>
    </GlassCard>
  );
}
