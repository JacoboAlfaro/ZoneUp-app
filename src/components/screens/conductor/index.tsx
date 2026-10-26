import { useConductorIndex } from "@/src/hooks/conductor/useConductorIndex";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParkingMap } from "../../ParkingMap";
import { User } from "lucide-react-native";
import { LiquidChip } from "../../LiquidChip";

const ConductorIndexScreen = function () {
  const { user, abrirDrawer } = useConductorIndex();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ParkingMap />
      <View
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          zIndex: 20,
          elevation: 20,
        }}>
        <LiquidChip
          text={`Hola, ${user?.name ?? ''}`}
          icon={User}
          onPress={abrirDrawer}
        />
      </View>
    </View>
  );
};

export default ConductorIndexScreen;