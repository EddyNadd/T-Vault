import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const MapScreen = () => {
  // Coordonnées pour trois points : Paris, Nice et Neuchâtel
  const point1 = {
    latitude: 48.8566, // Paris
    longitude: 2.3522,
  };

  const point2 = {
    latitude: 43.7102, // Nice
    longitude: 7.2620,
  };

  const point3 = {
    latitude: 46.991, // Neuchâtel, Suisse
    longitude: 6.9293,
  };

  // Chemins des images personnalisées
  const customImageParis = { uri: 'https://t4.ftcdn.net/jpg/02/96/15/35/360_F_296153501_B34baBHDkFXbl5RmzxpiOumF4LHGCvAE.jpg' };
  const customImageNice = { uri: 'https://www.nice.fr/uploads/media/paysage/0001/29/thumb_28514_paysage_big.jpg' };
  const customImageNeuchatel = { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Vuevilledeneuchatel.jpg/280px-Vuevilledeneuchatel.jpg' };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 46.6034, // Position centrale entre la France et la Suisse
          longitude: 4.5,
          latitudeDelta: 5.0,
          longitudeDelta: 5.0,
        }}
        showsUserLocation={true}
        mapType='hybridFlyover'
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* Polyline pour relier les points */}
        <Polyline
          coordinates={[point1, point2, point3]}
          strokeColor="#000" // Couleur de la ligne
          strokeWidth={3} // Épaisseur de la ligne
        />

        {/* Marqueur personnalisé pour Paris */}
        <Marker coordinate={point1}>
          <View style={styles.customMarker}>
            <Image source={customImageParis} style={styles.markerImage} />
          </View>
        </Marker>

        {/* Marqueur personnalisé pour Nice */}
        <Marker coordinate={point2}>
          <View style={styles.customMarker}>
            <Image source={customImageNice} style={styles.markerImage} />
          </View>
        </Marker>

        {/* Marqueur personnalisé pour Neuchâtel */}
        <Marker coordinate={point3}>
          <View style={styles.customMarker}>
            <Image source={customImageNeuchatel} style={styles.markerImage} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15, // La moitié de la largeur/hauteur pour un cercle parfait
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white', // Optionnel : Ajouter une bordure autour de l'image
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Assure que l'image couvre toute la zone circulaire
  },
});

export default MapScreen;
