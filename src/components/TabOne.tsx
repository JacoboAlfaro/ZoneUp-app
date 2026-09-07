import { View } from 'react-native';

import { ParkingMap } from '@/src/components/ParkingMap';

export default function TabOne() {
  return (
    <View className="flex-1 bg-white">
      <ParkingMap />
    </View>
  );
}
