
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConductorDrawer } from '@/src/hooks/conductor/useConductorDrawer';

type Props = {
  navigation: {
    closeDrawer: () => void;
  };
};

export default function ConductorDrawer({ navigation }: Props) {
  const {
    user,
    irAReservar,
    irAReservas,
    irAPerfil,
    irAVehiculos,
    cerrarSesion,
  } = useConductorDrawer(navigation);

  return (
    <SafeAreaView style={estilos.contenedor} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.nombreApp}>ZoneUp</Text>

        <Text style={estilos.nombreUsuario}>
          {user?.name || 'Conductor'}
        </Text>

        <Text style={estilos.correo}>
          {user?.email || ''}
        </Text>

        <View style={estilos.opciones}>
          <Pressable style={estilos.boton} onPress={irAReservar}>
            <Text style={estilos.textoBoton}>Reservar zona azul</Text>
          </Pressable>

          <Pressable style={estilos.boton} onPress={irAReservas}>
            <Text style={estilos.textoBoton}>Mis reservas</Text>
          </Pressable>

          <Pressable style={estilos.boton} onPress={irAPerfil}>
            <Text style={estilos.textoBoton}>Mi perfil</Text>
          </Pressable>

          <Pressable style={estilos.boton} onPress={irAVehiculos}>
            <Text style={estilos.textoBoton}>Mis vehículos</Text>
          </Pressable>

          <Pressable
            style={[estilos.boton, estilos.botonCerrar]}
            onPress={cerrarSesion}
          >
            <Text style={estilos.textoBoton}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#EAF6FF',
  },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  nombreApp: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    color: '#52677D',
    textTransform: 'uppercase',
  },
  nombreUsuario: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#142D4E',
  },
  correo: {
    marginTop: 4,
    fontSize: 16,
    color: '#52677D',
  },
  opciones: {
    marginTop: 24,
    gap: 12,
  },
  boton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  botonCerrar: {
    backgroundColor: '#DCE8F2',
  },
  textoBoton: {
    color: '#142D4E',
    fontSize: 16,
    fontWeight: '600',
  },
});
