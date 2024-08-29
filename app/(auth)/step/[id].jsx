import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Button, SafeAreaView, ScrollView, ActivityIndicator, Image, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from "../../../firebase.jsx";
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function DetailsScreen({ isOpen }) {
    const { id } = useLocalSearchParams();
    const [tripId, stepId] = id.split('-');
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDateString, setStartDateString] = useState('Departure date');
    const [endDateString, setEndDateString] = useState('Return date');
    const [tabOrder, setTabOrder] = useState([]);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState('');

    const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

    const getTripData = async () => {
        try {
            const docRef = doc(db, "trips", tripId, "steps", stepId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();

                setTitle(data.title || '');
                setDestination(data.destination || '');
                setStartDate(data.startDate?.toDate() || null);
                setEndDate(data.endDate?.toDate() || null);

                const tabOrder = data.tabOrder || [];
                setTabOrder(tabOrder);

                setComponents(data.tabOrder.map((type) => {
                    if (type === 'image') {
                        return { type, uri: data.images.shift(), id: generateUniqueId() };
                    } else if (type === 'comment') {
                        return { type, id: generateUniqueId(), value: data.comments.shift() };
                    }
                }));
            } else {
                console.error("No such document!");
            }
        } catch (error) {
            console.error("Error getting document:", error);
            setError("Failed to load data.");
        }
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            setLoading(true);
            setError(null);
            getTripData();
        }, [tripId, stepId])
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

                // Log image URLs for verification
                images.forEach((imageUrl) => {
                    console.log('Deleting image:', imageUrl);
                });

                // Delete each image in the step
                await Promise.all(images.map(async (imageUrl) => {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                }));
            }

            // Delete the Firestore document after the images are deleted
            await deleteDoc(stepRef);
            router.back();
        } catch (error) {
            console.error('Error deleting step: ', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text>Error: {error}</Text>
            </View>
        );
    }

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-GB');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.destination}>{destination}</Text>
                    <View style={styles.datesContainer}>
                        <Text style={styles.date}>{startDate ? formatDate(startDate) : startDateString}</Text>
                        <Text style={styles.date}>{endDate ? formatDate(endDate) : endDateString}</Text>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    {components.map((component) => {
                        if (component.type === 'image') {
                            return (
                                <TouchableOpacity key={component.id} onPress={() => handleImagePress(component.uri)}>
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

                <Button title="Go back" onPress={() => router.back()} />
                <Button title="Edit" onPress={() => router.push(`/(auth)/updateStep/${tripId}-${stepId}`)} />
                <Button title="Delete" onPress={() => deleteStep()} />

                {/* Modal to show full-screen image */}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    contentContainer: {
        display: 'flex',
        padding: 16,
    },
    header: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#fff',
    },
    destination: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#fff',
    },
    datesContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 16,
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#fff',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    commentContainer: {
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#1E1E1E',
        borderRadius: 4,
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
});
