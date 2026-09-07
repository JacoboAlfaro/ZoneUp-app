import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

const MANIZALES = {
  latitude: 5.0766,
  longitude: -75.5206,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export function ParkingMap() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={MANIZALES}
        showsMyLocationButton={false}
        mapType="standard"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
