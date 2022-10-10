import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Map({ route, navigation }) {
  const data = route.params;
  const region = {
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <MapView style={styles.map} region={region} initialRegion={region}>
          <Marker coordinate={region} title={region.address} />
        </MapView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
