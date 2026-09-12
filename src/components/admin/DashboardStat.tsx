import { Text, View } from 'react-native';

interface Props {
  value: number | string;
  label: string;
  valueClassName?: string;
}

export default function DashboardStat({ value, label, valueClassName }: Props) {
  return (
    <View className="min-h-28 flex-1 justify-between rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm">
      <Text className={`text-3xl font-bold text-zu-navy ${valueClassName ?? ''}`}>
        {value}
      </Text>
      <Text className="mt-2 text-xs leading-4 text-zu-slate">{label}</Text>
    </View>
  );
}