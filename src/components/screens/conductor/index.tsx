import { useConductorIndex } from "@/src/hooks/conductor/useConductorIndex";
import { Pressable, View, Text} from "react-native";
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
      <View style={{ position: 'absolute', top: 16, left: 16 }}>
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