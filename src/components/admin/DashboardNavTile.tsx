import { ChevronRight } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
}>;

interface Props {
  icon: IconComponent;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconColor?: string;
  iconBgClassName?: string;
}

export default function DashboardNavTile({
  icon: Icon,
  title,
  subtitle,
  onPress,
  iconColor = '#1E3A5F',
  iconBgClassName = 'bg-zu-sky-mid/45',
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="flex-row items-center rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm active:opacity-80">
      <View className={`h-12 w-12 items-center justify-center rounded-2xl ${iconBgClassName}`}>
        <Icon size={25} color={iconColor} />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-lg font-bold text-zu-navy">{title}</Text>
        <Text className="mt-0.5 text-sm text-zu-slate">{subtitle}</Text>
      </View>

      <ChevronRight size={22} color="#6B8698" />
    </Pressable>
  );
}
