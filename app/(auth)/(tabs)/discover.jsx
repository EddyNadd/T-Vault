import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, TouchableOpacity, StyleSheet, View, ScrollView } from "react-native";
import Header from '../../../components/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import COLORS from '../../../styles/COLORS';
import AddDiscoverTrip from '../../../components/AddDiscorverTrip'
import TripCard from '../../../components/TripCard';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { useFirestoreListeners } from '@/components/FirestoreListenerContext';
import AndroidSafeArea from '../../../styles/AndroidSafeArea';

/**
 * Discover view component that displays a list of trips shared or invited to the user.
 */

const discover = () => {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [trips, setTrips] = useState([]);
  const currentListeners = useRef([]);
  const { listenersRef } = useFirestoreListeners();
  const tripsSharedMap = useRef(new Map());
  const tripsInvitMap = useRef(new Map());

  /**
   * Toggle the action sheet
   */
  const toggleActionSheet = () => {
    setShowActionsheet(!showActionsheet);
  };

  /**
   * Fetch the trips from the database
   */
  useEffect(() => {
    const sharedQuery = query(
      collection(db, "Trips"),
      where('canRead', 'array-contains', auth.currentUser.uid)
    );

    /**
     * Query to fetch the trips where the user is invited
     */
    const invitQuery = query(
      collection(db, "Trips"),
      where('invitRead', 'array-contains', auth.currentUser.uid)
    );

    /**
     * Fetch the users from the database
     * @param {*} uids 
     * @returns users
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
     * @param {*} snapshot
     * @param {*} type
     */
    const updateTripsMap = (snapshot, type) => {
      snapshot.docChanges().forEach((change) => {
        const tripData = change.doc.data();
        if (change.type === 'modified' || change.type === 'added') {
          if (type === 'shared') {
            tripsSharedMap.current.set(change.doc.id, { id: change.doc.id, ...tripData });
            // This delete is here to avoid duplicates in the final array
            tripsInvitMap.current.delete(change.doc.id);
          } else if (type === 'invit') {
            tripsInvitMap.current.set(change.doc.id, { id: change.doc.id, ...tripData });
          }
        } else if (change.type === 'removed') {
          if (type === 'shared') {
            tripsSharedMap.current.delete(change.doc.id);
          } else if (type === 'invit') {
            tripsInvitMap.current.delete(change.doc.id);
          }
        }
      });
    };

 /**
 * Processes and sorts trips based on invitation and sharing status,
 * enriches trip data with usernames, and updates the state.
 */
    const processTrips = async () => {
      const invitArray = Array.from(tripsInvitMap.current.values());
      const readArray = Array.from(tripsSharedMap.current.values());
      readArray.forEach((trip) => {
        if (trip.canWrite.includes(auth.currentUser.uid)) {
          readArray.splice(readArray.indexOf(trip), 1);
        }
      });
      invitArray.sort((a, b) => b.startDate.seconds - a.startDate.seconds);
      readArray.sort((a, b) => b.startDate.seconds - a.startDate.seconds);
      const allTrips = invitArray.concat(readArray);
      const userUids = Array.from(new Set(allTrips.map((trip) => trip.uid)));
      const users = await fetchUsers(userUids);

      const enrichedTrips = allTrips.map((trip) => ({
        ...trip,
        username: users[trip.uid],
      }));

      setTrips(enrichedTrips);
    };

   /**
 * Sets up listeners for shared and invited trips using Firebase Firestore's onSnapshot.
 * Updates the trips map and processes trips whenever a snapshot changes.
 */
    const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
      updateTripsMap(snapshot, 'shared');
      processTrips();
    });

    const unsubscribeInvit = onSnapshot(invitQuery, (snapshot) => {
      updateTripsMap(snapshot, 'invit');
      processTrips();
    });

    listenersRef.current.push(unsubscribeShared, unsubscribeInvit);
    currentListeners.current.push(unsubscribeShared, unsubscribeInvit);

    return () => {
      currentListeners.current.forEach((unsubscribe) => unsubscribe());
      currentListeners.current = [];
    };
  }, []);

  /**
   * Custpm button component for the header
   */
  const CustomButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={toggleActionSheet}>
      <FontAwesome5 name="plus" size={20} color="white" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, AndroidSafeArea.AndroidSafeArea]}>
      <Header
        logoSource={require('../../../assets/logo_transparent_bg.png')}
        title="DISCOVER"
        ButtonComponent={CustomButton}
      />

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
              isInvitation={trip.invitRead != null && auth.currentUser != null ? trip.invitRead.includes(auth.currentUser.uid) && !trip.canRead.includes(auth.currentUser.uid) : false}
              tripCode={trip.id}
              editableTrip={false}
            />
          );
        })}
      </ScrollView>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E1E' }}>
        <AddDiscoverTrip isOpen={showActionsheet} onClose={toggleActionSheet} />
      </View>
    </SafeAreaView>
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 100,
  },
});

export default discover;
