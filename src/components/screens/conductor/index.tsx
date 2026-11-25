import { useConductorIndex } from "@/src/hooks/conductor/useConductorIndex";
import { router } from "expo-router";
import { User } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidChip } from "../../LiquidChip";
import { ParkingMap } from "../../ParkingMap";
import { ReservaActivaPanel } from "../../ReservaActivaPanel";
import { ReservaTiempoChip } from "../../ReservaTiempoChip";
import { ZonaMapPanel } from "../../ZoneMapPanel";

const ConductorIndexScreen = function () {
  const {
    user,
    abrirDrawer,
    zonas,
    zonaSeleccionada,
    seleccionarZona,
    cerrarZona,
    reservaActiva,
    panelReservaAbierto,
    abrirPanelReserva,
    cerrarPanelReserva,
    refrescarReservaActiva,
    alTerminarTiempo,
    ubicacionConcedida,
    miUbicacion,
    ubicacionListo,
  } = useConductorIndex();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <ParkingMap
        zonas={zonas}
        zonaSeleccionadaId={zonaSeleccionada?.id}
        onPressZona={seleccionarZona}
        onPressMapa={() => {
          cerrarZona();
          cerrarPanelReserva();
        }}
        mostrarUbicacion={ubicacionConcedida}
        miUbicacion={miUbicacion}
        ubicacionListo={ubicacionListo}
      />
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          right: 16,
          zIndex: 20,
          elevation: 20,
          gap: 8,
        }}
      >
        <View style={{ alignSelf: "flex-start", maxWidth: "100%" }}>
          <LiquidChip
            text={`Hola, ${user?.name ?? ""}`}
            icon={User}
            onPress={abrirDrawer}
          />
        </View>
        {reservaActiva ? (
          <View style={{ alignSelf: "flex-start" }}>
            <ReservaTiempoChip
              reserva={reservaActiva.reserva}
              onPress={abrirPanelReserva}
              onFin={alTerminarTiempo}
            />
          </View>
        ) : null}
      </View>
      {panelReservaAbierto && reservaActiva ? (
        <ReservaActivaPanel
          fila={reservaActiva}
          destino={
            zonas.find((zona) => zona.id === reservaActiva.reserva.id_zona) ??
            null
          }
          onCerrar={cerrarPanelReserva}
          onCambio={refrescarReservaActiva}
          onVerDetalle={() => {
            cerrarPanelReserva();
            router.push({
              pathname: "/conductor/(panel)/(reservas)/reserva/[id]",
              params: { id: String(reservaActiva.reserva.id) },
            });
          }}
        />
      ) : null}
      {zonaSeleccionada && !panelReservaAbierto ? (
        <ZonaMapPanel
          zona={zonaSeleccionada}
          onCerrar={cerrarZona}
          onReservar={() =>
            router.push({
              pathname: "/conductor/(panel)/(reservas)/nueva-reserva",
              params: { idZona: String(zonaSeleccionada.id) },
            })
          }
        />
      ) : null}
    </View>
  );
};

export default ConductorIndexScreen;