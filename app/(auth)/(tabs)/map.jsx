import React, { useRef, useState, useEffect } from 'react';
import { Platform, Image, View, StyleSheet, Text, SafeAreaView, Switch } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { auth, db } from '../../../firebase';
import { collection, query, where, onSnapshot, or, getDocs } from 'firebase/firestore';
import { useFirestoreListeners } from '../../../components/FirestoreListenerContext';
import { useRouter } from 'expo-router';
import AndroidSafeArea from '../../../styles/AndroidSafeArea';

const MapScreen = () => {
  const [myTripsSelected, setMyTripsSelected] = useState(true);
  const [discoverSelected, setDiscoverSelected] = useState(false);
  const [tripsToShow, setTripsToShow] = useState([]);
  const myTripsMap = useRef(new Map());
  const discoverMap = useRef(new Map());
  const stepListeners = useRef(new Map());
  const { listenersRef } = useFirestoreListeners();
  const currentListeners = useRef([]);
  const router = useRouter();

  useEffect(() => {
    const userId = auth.currentUser.uid;

    const myTripsQuery = query(
      collection(db, "trips"),
      or(
        where('uid', '==', userId),
        where('canWrite', 'array-contains', userId)
      )
    );

    const discoverQuery = query(
      collection(db, "trips"),
      where('canRead', 'array-contains', userId)
    );

    const processTrips = () => {
      myTripsMap.current.forEach((myTrip, myTripId) => {
        discoverMap.current.delete(myTripId);
      });
    };

    const updateTripsMap = (snapshot, type) => {
      snapshot.docChanges().forEach((change) => {
        const tripId = change.doc.id;
        const tripData = change.doc.data();
        
        if (change.type === 'modified' || change.type === 'added') {
          if (type === 'myTrips') {
            myTripsMap.current.set(tripId, tripData);
          } else if (type === 'discover') {
            discoverMap.current.set(tripId, tripData);
          }
          attachStepListener(tripId);
        } else if (change.type === 'removed') {
          if (type === 'myTrips') {
            myTripsMap.current.delete(tripId);
          } else if (type === 'discover') {
            discoverMap.current.delete(tripId);
          }
          detachStepListener(tripId);
        }
      });
    };

    const unsubscribeMyTripsQuery = onSnapshot(myTripsQuery, (snapshot) => {
      updateTripsMap(snapshot, "myTrips");
      processTrips();
      fetchTripsToShow();
    });

    const unsubscribeDiscoverQuery = onSnapshot(discoverQuery, (snapshot) => {
      updateTripsMap(snapshot, "discover");
      processTrips();
      fetchTripsToShow();
    });

    listenersRef.current.push(unsubscribeMyTripsQuery, unsubscribeDiscoverQuery);
    currentListeners.current.push(unsubscribeMyTripsQuery, unsubscribeDiscoverQuery);

    return () => {
      currentListeners.current.forEach((unsubscribe) => unsubscribe());
      currentListeners.current = [];
      stepListeners.current.forEach((unsubscribe) => unsubscribe());
      stepListeners.current.clear();
    };
  }, [myTripsSelected, discoverSelected]);

  const attachStepListener = (tripId) => {
    if (stepListeners.current.has(tripId)) return;

    const stepsQuery = collection(db, `trips/${tripId}/steps`);
    const unsubscribe = onSnapshot(stepsQuery, () => {
      fetchTripsToShow();
    });

    stepListeners.current.set(tripId, unsubscribe);
  };

  const detachStepListener = (tripId) => {
    const unsubscribe = stepListeners.current.get(tripId);
    if (unsubscribe) {
      unsubscribe();
      stepListeners.current.delete(tripId);
    }
  };

  const fetchTripsToShow = async () => {
    const trips = [];

    if (myTripsSelected) {
      for (const [tripId, trip] of myTripsMap.current) {
        const stepsSnapshot = await getDocs(collection(db, `trips/${tripId}/steps`));
        const steps = stepsSnapshot.docs.map(stepDoc => stepDoc.data());
        steps.forEach((step, index) => {
          step.id = stepsSnapshot.docs[index].id;
        });
        trips.push({ trip, tripId, steps });
      }
    }

    if (discoverSelected) {
      for (const [tripId, trip] of discoverMap.current) {
        const stepsSnapshot = await getDocs(collection(db, `trips/${tripId}/steps`));
        const steps = stepsSnapshot.docs.map(stepDoc => stepDoc.data());
        steps.forEach((step, index) => {
          step.id = stepsSnapshot.docs[index].id;
        });
        trips.push({ trip, tripId, steps });
      }
    }

    setTripsToShow(trips);
  };

  const handleMarkerPress = (stepCode) => {
    router.push(`/(auth)/step/${stepCode}`);
  };

  const handleLinePress = (tripCode) => {
    router.push(`/(auth)/trip/${tripCode}`);
  };

  const renderMarkersAndPolylines = () => {
    return tripsToShow.map(({ trip, tripId, steps }) => {
      if (steps.length === 0) return null;
      const sortedSteps = steps.sort((a, b) => a.startDate.toMillis() - b.startDate.toMillis());

      const markers = sortedSteps.map((step, index) => {
        const imageMarker = step.images.length > 0 ? {uri: step.images[Math.floor(Math.random() * step.images.length)]} : require('../../../assets/defaultMarker.png');;
        return (
          <Marker
            key={`${tripId}-${index}`}
            coordinate={{ latitude: step.geopoint.latitude, longitude: step.geopoint.longitude }}
            onPress={() => handleMarkerPress(step.id)}
          >
            <View style={styles.customMarker}>
              <Image source={imageMarker} style={styles.markerImage} />
            </View>
          </Marker>
        );
      });

      const polylineCoords = sortedSteps.map(step => ({
        latitude: step.geopoint.latitude,
        longitude: step.geopoint.longitude
      }));

      return (
        <React.Fragment key={tripId}>
          {markers}
          <Polyline
            coordinates={polylineCoords}
            strokeColor={COLORS.blue_dark}
            strokeWidth={3}
            onPress={() => handleLinePress(tripId)}
            tappable={true}
          />
        </React.Fragment>
      );
    });
  };

  return (
    <MenuProvider skipInstanceCheck>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 46.99763183905308,
            longitude: 6.938745394653198,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
          mapType={Platform.OS === 'ios' ? 'hybridFlyover' : 'hybrid'}
          zoomEnabled={true}
          scrollEnabled={true}
        >
          {renderMarkersAndPolylines()}
        </MapView>

        <SafeAreaView style={AndroidSafeArea.AndroidSafeArea}>
          <Menu style={{ width: 60, height: 60, margin: 20 }}>
            <MenuTrigger style={styles.filterButton}>
              <Feather name="settings" size={30} color={COLORS.blue} />
            </MenuTrigger>
            <MenuOptions style={styles.menuOptions}>
              <MenuOption style={styles.menuItems}>
                <Text style={styles.menuOptionText}>MY TRIPS</Text>
                <Switch
                  value={myTripsSelected}
                  onValueChange={(value) => setMyTripsSelected(value)}
                  trackColor={{ false: COLORS.background_dark, true: COLORS.blue }}
                />
              </MenuOption>
              <View style={styles.menuDivider} />
              <MenuOption style={styles.menuItems}>
                <Text style={styles.menuOptionText}>DISCOVER</Text>
                <Switch
                  value={discoverSelected}
                  onValueChange={(value) => setDiscoverSelected(value)}
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
});

export default MapScreen;
