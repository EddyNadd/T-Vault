import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View, Text, StyleSheet, ImageBackground, Dimensions, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../../../firebase';
import { doc, onSnapshot, updateDoc, arrayRemove, deleteDoc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import COLORS from '../../../styles/COLORS';
import StepCard from '../../../components/StepCard';
import ShareTripModal from '../../../components/ShareTripModal';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import TripModal from '@/components/TripModal';
import AndroidSafeArea from '../../../styles/AndroidSafeArea';


export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const [openShare, setOpenShare] = useState(false);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comment, setComment] = useState('');
  const [image, setImage] = useState('');
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripModal, setTripModal] = useState(false);
  const [currentStartDate, setCurrentStartDate] = useState('');
  const [currentEndDate, setCurrentEndDate] = useState('');

  const [canEdit, setCanEdit] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const [isLoadingStep, setIsLoadingStep] = useState(false);

  const unsubscribeRef = useRef(null);
  const stepsUnsubscribeRef = useRef(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (isLoadingStep) return;
      const docRef = doc(db, 'trips', id);

      unsubscribeRef.current = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const tripData = docSnap.data();
          setTitle(tripData.title);
          setStartDate(tripData.startDate.toDate().toLocaleDateString());
          setEndDate(tripData.endDate.toDate().toLocaleDateString());
          setComment(tripData.comment);
          setImage(tripData.image);
          const [startDay, startMonth, startYear] = tripData.startDate.toDate().toLocaleDateString().split('.').map(Number);
          const [endDay, endMonth, endYear] = tripData.endDate.toDate().toLocaleDateString().split('.').map(Number);
          setCurrentStartDate(new Date(startYear, startMonth - 1, startDay));
          setCurrentEndDate(new Date(endYear, endMonth - 1, endDay));

          const userId = auth.currentUser.uid;
          if (userId === tripData.uid) {
            setCanEdit(true);
            setCanShare(true);
            setCanDelete(true);
          } else if (tripData.canWrite.includes(userId)) {
            setCanEdit(true);
          }

          fetchTripSteps();
        } else {
          console.log('No such document!');
          setLoading(false);
          router.back();
        }
      }, (error) => {
        console.error('Error fetching trip details: ', error);
        setLoading(false);
      });
    };

    const fetchTripSteps = async () => {
      if (isLoadingStep) return;
      try {
        const stepsRef = collection(db, 'trips', id, 'steps');

        stepsUnsubscribeRef.current = onSnapshot(stepsRef, (stepsSnapshot) => {
          const fetchedSteps = stepsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.startDate.seconds - b.startDate.seconds);
          setSteps(fetchedSteps);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching steps: ', error);
        setLoading(false);
      }
    };

    if (id && !isLoadingStep) {
      fetchTripDetails();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (stepsUnsubscribeRef.current) {
        stepsUnsubscribeRef.current();
      }
    };
  }, [id, isLoadingStep]);

  const quitTrip = async () => {
    try {
      const tripRef = doc(db, 'trips', id);

      if (canEdit) {
        await updateDoc(tripRef, {
          canWrite: arrayRemove(auth.currentUser.uid),
        });
      } else {
        await updateDoc(tripRef, {
          canRead: arrayRemove(auth.currentUser.uid),
        });
      }

      router.back();
    } catch (error) {
      console.error('Error quitting trip: ', error);
    }
  };

  const deleteTrip = async () => {
    try {
      const allStepsRef = collection(db, 'trips', id, 'steps');
      const allStepsSnap = await getDocs(allStepsRef);
      const image = [];

      allStepsSnap.forEach(async (stepDoc) => {
        const stepData = stepDoc.data();
        const images = stepData.images;
        if (images.length > 0) {
          await Promise.all(images.map(async (imageUrl) => {
            const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef);
            }));
        }
      });


      allStepsSnap.forEach(async (stepDoc) => {
        await deleteDoc(stepDoc.ref);
      });


      const tripRef = doc(db, 'trips', id);

      const tripSnap = await getDoc(tripRef);
      if (!tripSnap.exists()) {
        throw new Error('Trip does not exist');
      }

      const tripData = tripSnap.data();
      const imageUrl = tripData.image;

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }

      await deleteDoc(tripRef);
    } catch (error) {
      console.error('Error deleting trip: ', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleAddStep = async () => {
    try {
      setIsLoadingStep(true);
      const stepId = Math.random().toString(36).substr(2, 6);
      router.push({pathname: `/(auth)/updateStep/${id}-${stepId}-new`});
    } catch (error) {
      console.error(error);
    }
    finally {
      setIsLoadingStep(false);
    }
  }

  return (
    <MenuProvider skipInstanceCheck>
      <View style={styles.container}>
        <ImageBackground source={{ uri: image }} style={styles.imageBackground}>
          <View style={styles.imageOverlay} />
          <SafeAreaView style={[styles.overlay, AndroidSafeArea.AndroidSafeArea]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Feather name="arrow-left" size={30} color="white" />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.imageTitle}>
                  {title}
                </Text>
              </View>

              <Menu>
                <MenuTrigger>
                  <MaterialCommunityIcons name="dots-horizontal" size={30} color="white" />
                </MenuTrigger>
                <MenuOptions style={styles.menuOptions}>
                  <MenuOption
                    style={[styles.menuItems, { opacity: canShare ? 1 : 0.5 }]}
                    onSelect={canShare ? () => setOpenShare(true) : null}
                    disabled={!canShare}
                  >
                    <Text style={styles.menuOptionText}>SHARE</Text>
                    <MaterialIcons style={{ padding: 10 }} name="share" size={20} color="white" />
                  </MenuOption>
                  <View style={styles.menuDivider} />
                  <MenuOption
                    style={[styles.menuItems, { opacity: canEdit ? 1 : 0.5 }]}
                    onSelect={canEdit ? () => { setTripModal(true) } : null}
                    disabled={!canEdit}
                  >
                    <Text style={styles.menuOptionText}>EDIT</Text>
                    <MaterialIcons style={{ padding: 10 }} name="edit" size={20} color="white" />
                  </MenuOption>
                  <View style={styles.menuDivider} />
                  <MenuOption
                    style={styles.menuItems}
                    onSelect={canDelete ? () => deleteTrip() : () => quitTrip()}
                  >
                    <Text style={styles.menuOptionText}>{canDelete ? 'DELETE' : 'QUIT'}</Text>
                    <MaterialIcons style={{ padding: 10 }} name="delete" size={20} color="white" />
                  </MenuOption>
                </MenuOptions>
              </Menu>
              <ShareTripModal isOpen={openShare} onCancel={() => setOpenShare(false)} onConfirm={() => setOpenShare(false)} tripCode={id} />
            </View>

            <View style={styles.commentContainer}>
              <ScrollView>
                <Text style={styles.imageComment}>{comment}</Text>
              </ScrollView>
            </View>

            <View style={styles.imageDateContainer}>
              <MaterialCommunityIcons style={[{ transform: [{ rotate: '20deg' }] }, styles.imageDates]} name="airplane" size={20} color="white" />
              <Text style={styles.imageDates}> {startDate}</Text>
              <MaterialCommunityIcons style={[{ transform: [{ rotate: '70deg' }], marginLeft: 25 }, styles.imageDates]} name="airplane" size={20} color="white" />
              <Text style={styles.imageDates}> {endDate}</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
        <View style={styles.scrollContainer}>
          <ImageBackground source={require('../../../assets/trip_images.png')} style={styles.tripImageBackground}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  title={step.title}
                  startDate={new Date(step.startDate.seconds * 1000).toLocaleDateString()}
                  endDate={new Date(step.endDate.seconds * 1000).toLocaleDateString()}
                  destination={step.destination}
                  isLast={index === steps.length - 1 && !canEdit}
                  stepCode={step.id}
                  tripCode={id}
                />
              ))}
              {canEdit && <TouchableOpacity style={styles.addStepButton} onPress={() => handleAddStep()} disabled={isLoadingStep} >
                {isLoadingStep ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.addStepText}>ADD STEP</Text>
                )}
              </TouchableOpacity>
              }
            </ScrollView>
          </ImageBackground>
        </View>
        <TripModal isOpen={tripModal} onClose={() => setTripModal(false)} currentTripId={id} currentTitle={title} currentComment={comment} currentStartDate={startDate} currentEndDate={endDate} currentImage={image} />
      </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    width: '100%',
    height: Dimensions.get('window').height / 3,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: {
      height: 6,
    },
    shadowOpacity: 0.2,
    elevation: 5,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    marginVertical: 20,
    width: '90%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleContainer: {
    maxWidth: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageTitle: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  commentContainer: {
    maxHeight: 100,
    marginHorizontal: 10,
  },

  imageComment: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },

  imageDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageDates: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
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

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: 50,
    paddingBottom: 150,
  },

  addStepButton: {
    backgroundColor: COLORS.blue,
    padding: 10,
    borderRadius: 5,
    margin: 1,
    width: 150,
    alignItems: 'center',
  },

  addStepText: {
    color: 'white',
    fontSize: 16,
  },

  tripImageBackground: {
    height: Dimensions.get('window').height * 2 / 3,
    width: '100%',
  },
});
