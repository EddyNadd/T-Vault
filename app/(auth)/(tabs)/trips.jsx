import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, View } from "react-native";
import Header from '../../../components/Header';
import TripModal from '../../../components/TripModal';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import TripCard from '../../../components/TripCard';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { useFirestoreListeners } from '../../../components/FirestoreListenerContext';
import {useRouter } from "expo-router";
import AndroidSafeArea from '../../../styles/AndroidSafeArea';

/**
 *  Trips view component that displays a list of trips owned, shared, or invited to by the user.
 */
const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const { listenersRef } = useFirestoreListeners();
  const currentListeners = useRef([]);
  const tripsOwnedMap = useRef(new Map());
  const tripsSharedMap = useRef(new Map());
  const tripsInvitMap = useRef(new Map());

  const router = useRouter();
  /**
   * Toggle the action sheet
   */
  const toggleActionSheet = () => {
    setShowActionsheet(!showActionsheet);
  };

  /**
   * Custom button component for the header
   */
  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={toggleActionSheet}>
      <FontAwesome5 name="plus" size={20} color="white" />
    </TouchableOpacity>
  );

  /**
   * Fetch the trips from the database 
   */
  useEffect(() => {
    const ownerQuery = query(
      collection(db, "Trips"),
      where('uid', '==', auth.currentUser.uid)
    );

    /**
     *  Query to fetch the trips where the user can write
     */
    const sharedQuery = query(
      collection(db, "Trips"),
      where('canWrite', 'array-contains', auth.currentUser.uid)
    );

    /**
     * Query to fetch the trips where the user is invited
     */
    const invitQuery = query(
      collection(db, "Trips"),
      where('invitWrite', 'array-contains', auth.currentUser.uid)
    ); 

    /**
     * Fetch the users from the database by their uids
     * @param {string} uids 
     */
    const fetchUsers = async (uids) => {
      if (uids.length === 0) return {};
      let users = {};
      for (const uid of uids) {
        const docRef = doc(db, 'UID', uid);
        const docSnap = await getDoc(docRef);
        users[uid] = docSnap.exists() ? docSnap.data().username : 'Unknown';
      }
      return users;
    };

    /**
     * Update the trips map
     * @param {*} snapshot - The snapshot of the trips
     * @param {*} type - The type of the trip
     */ 
    const updateTripsMap = (snapshot, type) => {
      snapshot.docChanges().forEach((change) => {
        const tripData = change.doc.data();
        if (change.type === 'modified' || change.type === 'added') {
          if (type === 'owner') {
            tripsOwnedMap.current.set(change.doc.id, { id: change.doc.id, ...tripData });
          } else if (type === 'shared') {
            tripsSharedMap.current.set(change.doc.id, { id: change.doc.id, ...tripData });
            // This delete is here to avoid duplicates in the final array
            tripsInvitMap.current.delete(change.doc.id);
          } else if (type === 'invit') {
            tripsInvitMap.current.set(change.doc.id, { id: change.doc.id, ...tripData });
          }
        } else if (change.type === 'removed') {
          if (type === 'owner') {
            tripsOwnedMap.current.delete(change.doc.id);
          } else if (type === 'shared') {
            tripsSharedMap.current.delete(change.doc.id);
          } else if (type === 'invit') {
            tripsInvitMap.current.delete(change.doc.id);
          }
        }
      });
    };

    /**
     * Process the trips and sort them by start date
     */
    const processTrips = async () => {
      const invitArray = Array.from(tripsInvitMap.current.values());
      const writeArray = Array.from(tripsSharedMap.current.values()).concat(Array.from(tripsOwnedMap.current.values()));
      invitArray.sort((a, b) => b.startDate.seconds - a.startDate.seconds);
      writeArray.sort((a, b) => b.startDate.seconds - a.startDate.seconds);
      const allTrips = invitArray.concat(writeArray);
      const userUids = Array.from(new Set(allTrips.map((trip) => trip.uid)));
      const users = await fetchUsers(userUids);

      const enrichedTrips = allTrips.map((trip) => ({
        ...trip,
        username: users[trip.uid],
      }));

      setTrips(enrichedTrips);
    };

    /**
     * Listen for changes in the owner trips
     * @param {*} snapshot - The snapshot of the owner trips
     * @param {*} type - The type of the trip
     */
    const unsubscribeOwner = onSnapshot(ownerQuery, (snapshot) => {
      updateTripsMap(snapshot, 'owner');
      processTrips();
    });

    /**
     *  Listen for changes in the shared trips
     * @param {*} snapshot - The snapshot of the shared trips
     * @param {*} type - The type of the trip
     */
    const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
      updateTripsMap(snapshot, 'shared');
      processTrips();
    });

    /**
     * Listen for changes in the invited trips
     * @param {*} snapshot - The snapshot of the invited trips
     * @param {*} type - The type of the trip
    */
    const unsubscribeInvit = onSnapshot(invitQuery, (snapshot) => {
      updateTripsMap(snapshot, 'invit');
      processTrips();
    });

    // Add the listeners to the listenersRef and currentListeners
    listenersRef.current.push(unsubscribeOwner, unsubscribeShared, unsubscribeInvit);
    currentListeners.current.push(unsubscribeOwner, unsubscribeShared, unsubscribeInvit);

    // Remove the listeners when the component is unmounted
    return () => {
      currentListeners.current.forEach((unsubscribe) => unsubscribe());
      currentListeners.current = [];
    };
  }, []);

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={AndroidSafeArea.AndroidSafeArea}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="MY TRIPS"
        ButtonComponent={CustomButton}
      />
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {trips.map((trip) => {
          let ownerLabel = "My trip";
          if ((trip.canWrite.length > 0 || trip.canRead.length > 0 || trip.shared) && auth.currentUser != null) {
            if (trip.uid === auth.currentUser.uid) {
              ownerLabel = "My trip (shared)";
            } else {
              ownerLabel = `Trip shared by ${trip.username}`;
            }
          }
          return (
            <TripCard
              key={trip.id}
              imageSource={{ uri: trip.image }}
              title={trip.title}
              owner={ownerLabel}
              startDate={new Date(trip.startDate.seconds * 1000).toLocaleDateString()}
              endDate={new Date(trip.endDate.seconds * 1000).toLocaleDateString()}
              shared={(trip.canWrite.length > 0 || trip.canRead.length > 0 || trip.shared) ? "users" : "user"}
              isInvitation={trip.invitWrite != null && auth.currentUser != null ? trip.invitWrite.includes(auth.currentUser.uid) && !trip.canWrite.includes(auth.currentUser.uid) && trip.uid != auth.currentUser.uid : false}
              tripCode={trip.id}
              editableTrip={true}
            />
          );
        })}
      </ScrollView>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E1E' }}>
        <TripModal isOpen={showActionsheet} onClose={toggleActionSheet} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background_dark,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100,
  },
  addButton: {
    backgroundColor: COLORS.blue_dark,
    padding: 5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Trips;
