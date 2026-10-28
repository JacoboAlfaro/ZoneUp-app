import { useConductorIndex } from "@/src/hooks/conductor/useConductorIndex";
import { router } from "expo-router";
import { User } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidChip } from "../../LiquidChip";
import { ParkingMap } from "../../ParkingMap";
import { ZonaMapPanel } from "../../ZoneMapPanel";

const ConductorIndexScreen = function () {
  const { user, abrirDrawer, zonas, zonaSeleccionada, seleccionarZona, cerrarZona } =
    useConductorIndex();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ParkingMap
        zonas={zonas}
        zonaSeleccionadaId={zonaSeleccionada?.id}
        onPressZona={seleccionarZona}
        onPressMapa={cerrarZona}
      />
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
      {zonaSeleccionada ? (
        <ZonaMapPanel
          zona={zonaSeleccionada}
          onCerrar={cerrarZona}
          onReservar={() =>
            router.push({
              pathname: '/conductor/(panel)/(reservas)/nueva-reserva',
              params: { idZona: String(zonaSeleccionada.id) },
            })
          }
        />
      ) : null}
    </View>
  );
};

export default ConductorIndexScreen;