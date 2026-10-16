import { useConductorIndex } from "@/src/hooks/conductor/useConductorIndex";
import { Pressable, View, Text} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParkingMap } from "../../ParkingMap";
import { User } from "lucide-react-native";

const ConductorIndexScreen = function () {
  const { user, abrirDrawer } = useConductorIndex();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ParkingMap />

      <Pressable
        onPress={abrirDrawer}
        style={{ position: 'absolute', top: 16, left: 16 }}
        className="flex-row items-center rounded-full bg-zu-white px-2 py-1 shadow-sm"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-zu-navy">
          <User size={20} color="#FFFFFF" />
        </View>
        <Text className="ml-2 mr-3 text-base font-semibold text-zu-navy">
          Hola, {user?.name}
        </Text>
      </Pressable>
    </View>
  );
};

export default ConductorIndexScreen;