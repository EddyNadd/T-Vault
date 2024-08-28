import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Button, SafeAreaView, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../../../firebase.jsx";

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

    const generateUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

    useEffect(() => {
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

                    // Ensure data.tabOrder is an array
                    const tabOrder = data.tabOrder || [];
                    setTabOrder(tabOrder);

                    const images = data.images || [];
                    const comments = data.comments || [];

                    // Create components based on tabOrder
                    setComponents(data.tabOrder.map((type) => {
                        if (type === 'image') {
                            return { type, uri: data.images.shift(), id: generateUniqueId() };
                        } else if (type === 'comment') {
                            return { type, id: generateUniqueId(), value: data.comments.shift() };
                        }
                    }
                    ));
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error getting document:", error);
                setError("Failed to load data.");
            }
            setLoading(false);
        };

        if (isOpen) {
            setTitle('');
            setDestination('');
            setStartDate(null);
            setEndDate(null);
        }
        
        getTripData();
    }, [isOpen, tripId, stepId]);

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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.label}>Title:</Text>
                <Text style={styles.value}>{title}</Text>

                <Text style={styles.label}>Destination:</Text>
                <Text style={styles.value}>{destination}</Text>

                <Text style={styles.label}>Start Date:</Text>
                <Text style={styles.value}>{startDate ? startDate.toDateString() : startDateString}</Text>

                <Text style={styles.label}>End Date:</Text>
                <Text style={styles.value}>{endDate ? endDate.toDateString() : endDateString}</Text>

                {components.map((component) => {
                    if (component.type === 'image') {
                        return <Image key={component.id} source={{ uri: component.uri }} style={styles.image} />;
                    } else if (component.type === 'comment') {
                        return (
                            <View key={component.id} style={styles.commentContainer}>
                                <Text style={styles.comment}>{component.value}</Text>
                            </View>
                        );
                    }
                    return null;
                })}

                <Button title="Go back" onPress={() => router.back()} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        marginBottom: 16,
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
        backgroundColor: '#f9f9f9', 
        borderRadius: 4, 
    },
    comment: {
        fontSize: 16,
        color: '#333',
    },
});
