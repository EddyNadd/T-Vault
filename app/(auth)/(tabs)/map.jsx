import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, SafeAreaView, Switch } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { auth, db } from '../../../firebase';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';
import { useFirestoreListeners } from '../../../components/FirestoreListenerContext';
import { Button } from '@/components/ui/button';



const MapScreen = () => {
  const [myTripsSelected, setMyTripsSelected] = useState(true);
  const [discoverSelected, setDiscoverSelected] = useState(false);
  const [trips, setTrips] = useState([]);
  const myTripsMap = useRef(new Map());
  const discoverMap = useRef(new Map());
  const { listenersRef } = useFirestoreListeners();
  const currentListeners = useRef([]);


  const point1 = { latitude: 48.8566, longitude: 2.3522 };
  const point2 = { latitude: 43.7102, longitude: 7.2620 };
  const point3 = { latitude: 46.991, longitude: 6.9293 };

  const customImageParis = { uri: 'https://t4.ftcdn.net/jpg/02/96/15/35/360_F_296153501_B34baBHDkFXbl5RmzxpiOumF4LHGCvAE.jpg' };
  const customImageNice = { uri: 'https://www.nice.fr/uploads/media/paysage/0001/29/thumb_28514_paysage_big.jpg' };
  const customImageNeuchatel = { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Vuevilledeneuchatel.jpg/280px-Vuevilledeneuchatel.jpg' };

  const displayTrips = () => {
    if(myTripsSelected) {
      myTripsMap.current.forEach((trip) => {
        console.log(trip.title);
      });
    }
    if(discoverSelected) {
      discoverMap.current.forEach((trip) => {
        console.log(trip.title);
      });
    }
  };

  useEffect(() => {

    const myTripsQuery = query(
      collection(db, "trips"),
      or(
        where('uid', '==', auth.currentUser.uid),
        where('canWrite', 'array-contains', auth.currentUser.uid),
      )
    );

    const discoverQuery = query(
      collection(db, "trips"),
      where('canRead', 'array-contains', auth.currentUser.uid),
    );

    const processTrips = () => {
      myTripsMap.current.forEach((myTrip, myTripId) => {
        discoverMap.current.delete(myTripId);
      });
    };

    const updateTripsMap = (snapshot, type) => {
      snapshot.docChanges().forEach((change) => {
        const tripData = change.doc.data();
        if (change.type === 'modified' || change.type === 'added') {
          if (type === 'myTrips') {
            myTripsMap.current.set(change.doc.id, tripData);
          } else if (type === 'discover') {
              discoverMap.current.set(change.doc.id, tripData);
          }
        } else if (change.type === 'removed') {
          if (type === 'myTrips') {
            myTripsMap.current.delete(change.doc.id);
          } else if (type === 'discover') {
            discoverMap.current.delete(change.doc.id);
          }
        }
      });
    };

    const unsubscribeMyTripsQuery = onSnapshot(myTripsQuery, (snapshot) => {
      updateTripsMap(snapshot, "myTrips");
      processTrips();
    });

    const unsubscribeDiscoverQuery = onSnapshot(discoverQuery, (snapshot) => {
      updateTripsMap(snapshot, "discover");
      processTrips();
    });

    listenersRef.current.push(unsubscribeMyTripsQuery, unsubscribeDiscoverQuery);
    currentListeners.current.push(unsubscribeMyTripsQuery, unsubscribeDiscoverQuery);

    return () => {
      currentListeners.current.forEach((unsubscribe) => unsubscribe());
      currentListeners.current = [];
    };
  }, []);


  return (
    <MenuProvider skipInstanceCheck>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 46.6034,
            longitude: 4.5,
            latitudeDelta: 5.0,
            longitudeDelta: 5.0,
          }}
          showsUserLocation={true}
          mapType='hybridFlyover'
          zoomEnabled={true}
          scrollEnabled={true}
        >
          <Polyline coordinates={[point1, point2, point3]} strokeColor="#000" strokeWidth={3} />
          <Marker coordinate={point1}>
            <View style={styles.customMarker}>
              <Image source={customImageParis} style={styles.markerImage} />
            </View>
          </Marker>
          <Marker coordinate={point2}>
            <View style={styles.customMarker}>
              <Image source={customImageNice} style={styles.markerImage} />
            </View>
          </Marker>
          <Marker coordinate={point3}>
            <View style={styles.customMarker}>
              <Image source={customImageNeuchatel} style={styles.markerImage} />
            </View>
          </Marker>
        </MapView>

        <SafeAreaView style={styles.safeAreaView}>
          <Button
            title="Add Trip"
            onPress={() => displayTrips()}
          />
          <Menu style={{width: 60, height: 60, margin: 20}}>
            <MenuTrigger style={styles.filterButton}>
              <Feather name="settings" size={30} color={COLORS.blue} />
            </MenuTrigger>
            <MenuOptions style={styles.menuOptions}>
              <MenuOption style={styles.menuItems}>
                <Text style={styles.menuOptionText}>MY TRIPS</Text>
                <Switch
                  value={myTripsSelected}
                  onValueChange={(value) => {
                    setMyTripsSelected(value);
                  }}
                  trackColor={{ false: COLORS.background_dark, true: COLORS.blue }}
                />
              </MenuOption>
              <View style={styles.menuDivider} />
              <MenuOption style={styles.menuItems}>
                <Text style={styles.menuOptionText}>DISCOVER</Text>
                <Switch
                  value={discoverSelected}
                  onValueChange={(value) => {
                    setDiscoverSelected(value);
                  }}
                  trackColor={{ false: COLORS.background_dark, true: COLORS.blue }}
                />
              </MenuOption>
            </MenuOptions>
          </Menu>
        </SafeAreaView>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: COLORS.background_dark,
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  menuOptions: {
    backgroundColor: COLORS.background_dark,
    padding: 10,
    borderColor: COLORS.light_grey,
    borderWidth: 1,
  },
  menuOptionText: {
    color: 'white',
    fontSize: 16,
    padding: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.light_grey,
    marginVertical: 5,
    width: '85%',
    alignSelf: 'center',
  },
  menuItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default MapScreen;
