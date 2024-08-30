import React, { useState, useCallback, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ImageBackground, Dimensions, View, Text, StyleSheet, Button, SafeAreaView, ScrollView, ActivityIndicator, Image, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, onSnapshot, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from "../../../firebase.jsx";
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../../firebase';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { MaterialCommunityIcons, Feather, MaterialIcons } from '@expo/vector-icons';
import AndroidSafeArea from '../../../styles/AndroidSafeArea';
import COLORS from '../../../styles/COLORS'


export default function DetailsScreen() {
    const { id } = useLocalSearchParams();
    const [tripId, stepId] = id.split('-');
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [tabOrder, setTabOrder] = useState([]);
    const [error, setError] = useState('');
    const [mapUrl, setMapUrl] = useState('');
    const [components, setComponents] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState('');

    const [canEdit, setCanEdit] = useState(false);
    const [canDelete, setCanDelete] = useState(false);

    const unsubscribeRef = useRef(null);
    const permissionsUnsubscribeRef = useRef(null);

    const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

    const getTripData = useCallback(() => {

        const stepDocRef = doc(db, "trips", tripId, "steps", stepId);
        unsubscribeRef.current = onSnapshot(stepDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                setTitle(data.title || '');
                setDestination(data.destination || '');
                setStartDate(data.startDate?.toDate() || null);
                setEndDate(data.endDate?.toDate() || null);

                const lat = data.geopoint.latitude;
                const lng = data.geopoint.longitude;
                const pos = lat + ',' + lng;
                const markerColor = '17C0EB';
                setMapUrl(`https://maps.googleapis.com/maps/api/staticmap?center=${pos}&zoom=5&size=600x300&maptype=satellite&markers=color:0x${markerColor}%7C${pos}&key=AIzaSyALiECIgR3kTYQH5YTU75XcL-Xk4ZXcgtU`);

                const tabOrder = data.tabOrder || [];
                setTabOrder(tabOrder);

                setComponents(tabOrder.map((type) => {
                    if (type === 'image') {
                        return { type, uri: data.images.shift(), id: generateUniqueId() };
                    } else if (type === 'comment') {
                        return { type, id: generateUniqueId(), value: data.comments.shift() };
                    }
                }));
            } else {
                console.error("No such document!");
            }
        }, (error) => {
            console.error("Error getting document:", error);
            setError("Failed to load data.");
        });

        const tripDocRef = doc(db, "trips", tripId);
        permissionsUnsubscribeRef.current = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const userId = auth.currentUser?.uid;

                if (userId) {
                    if (userId === data.uid || data.canWrite.includes(userId)) {
                        setCanEdit(true);
                        setCanDelete(true);
                    } else {
                        setCanEdit(false);
                        setCanDelete(false);
                    }
                }
            }
        });
    }, [tripId, stepId]);

    useFocusEffect(
        React.useCallback(() => {
            getTripData();
            return () => {
                if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                }
                if (permissionsUnsubscribeRef.current) {
                    permissionsUnsubscribeRef.current();
                }
            };
        }, [getTripData])
    );

    const handleImagePress = (uri) => {
        setSelectedImageUri(uri);
        setModalVisible(true);
    };

    const deleteStep = async () => {
        try {
            const stepRef = doc(db, 'trips', tripId, 'steps', stepId);
            const stepSnap = await getDoc(stepRef);

            if (!stepSnap.exists()) {
                throw new Error('Step does not exist');
            }

            const stepData = stepSnap.data();
            const images = stepData.images || [];

            if (images.length > 0) {
                const storage = getStorage();

                await Promise.all(images.map(async (imageUrl) => {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                }));
            }

            await deleteDoc(stepRef);
            router.back();
        } catch (error) {
            console.error('Error deleting step: ', error);
        }
    };

    return (
        <MenuProvider skipInstanceCheck>
            <ImageBackground source={mapUrl ? { uri: mapUrl } : require('../../../assets/trip_images.png')} style={styles.imageBackground}>
                <View style={styles.imageOverlay} />
                <SafeAreaView style={[styles.overlay, AndroidSafeArea.AndroidSafeArea]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Feather name="arrow-left" size={30} color="white" />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>{title}</Text>
                        </View>

                        <Menu>
                            <MenuTrigger>
                                <MaterialCommunityIcons name="dots-horizontal" size={30} color="white" />
                            </MenuTrigger>
                            <MenuOptions style={styles.menuOptions}>
                                <MenuOption
                                    style={[styles.menuItems, { opacity: canEdit ? 1 : 0.5 }]}
                                    onSelect={canEdit ? () => router.push(`/(auth)/updateStep/${tripId}-${stepId}`) : null}
                                    disabled={!canEdit}
                                >
                                    <Text style={styles.menuOptionText}>EDIT</Text>
                                    <MaterialIcons style={{ padding: 10 }} name="edit" size={20} color="white" />
                                </MenuOption>
                                <View style={styles.menuDivider} />
                                <MenuOption
                                    style={[styles.menuItems, { opacity: canDelete ? 1 : 0.5 }]}
                                    onSelect={canDelete ? () => deleteStep() : null}
                                    disabled={!canDelete}
                                >
                                    <Text style={styles.menuOptionText}>DELETE</Text>
                                    <MaterialIcons style={{ padding: 10 }} name="delete" size={20} color="white" />
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </View>

                    <View style={styles.destinationContainer}>
                        <Text style={styles.destination}>{destination}</Text>
                    </View>

                    <View style={styles.imageDateContainer}>
                        <MaterialCommunityIcons style={[{ transform: [{ rotate: '20deg' }] }, styles.imageDates]} name="airplane" size={20} color="white" />
                        <Text style={styles.imageDates}> {startDate ? startDate.toLocaleDateString() : 'N/A'}</Text>
                        <MaterialCommunityIcons style={[{ transform: [{ rotate: '70deg' }], marginLeft: 25 }, styles.imageDates]} name="airplane" size={20} color="white" />
                        <Text style={styles.imageDates}> {endDate ? endDate.toLocaleDateString() : 'N/A'}</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>

            <ScrollView style={{marginTop: 20}}>
                <View>
                    {components.map((component) => {
                        if (component.type === 'image') {
                            return (
                                <TouchableOpacity key={component.id} onPress={() => handleImagePress(component.uri)} style={styles.imageContainer}>
                                    <Image source={{ uri: component.uri }} style={styles.image} />
                                </TouchableOpacity>
                            );
                        } else if (component.type === 'comment') {
                            return (
                                <View key={component.id} style={styles.commentContainer}>
                                    <Text style={styles.comment}>{component.value}</Text>
                                </View>
                            );
                        }
                        return null;
                    })}
                </View>

                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                        <Image source={{ uri: selectedImageUri }} style={styles.fullScreenImage} />
                    </View>
                </Modal>
            </ScrollView>
        </MenuProvider>
    );
}

const styles = StyleSheet.create({
    imageBackground: {
        width: '100%',
        height: Dimensions.get('window').height / 4,
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
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
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

    title: {
        color: 'white',
        fontSize: 25,
        textAlign: 'center',
        textTransform: 'uppercase',
    },


    destinationContainer: {
        maxHeight: 100,
        marginHorizontal: 10,
    },

    destination: {
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

    imageContainer: {
        marginBottom: 16,
        backgroundColor: COLORS.background_dark,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5,
    },

    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    commentContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#282828',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5,
    },
    comment: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
    },
    modalCloseText: {
        color: '#fff',
        fontSize: 18,
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
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
