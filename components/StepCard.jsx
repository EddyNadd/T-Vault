import { Text, View, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import COLORS from '../styles/COLORS';
import { useRouter } from 'expo-router';

/**
 * Step card component that displays a step in a trip.
 * @param {string} title - The title of the step.
 * @param {string} startDate - The start date of the step.
 * @param {string} endDate - The end date of the step.
 * @param {boolean} isLast - Indicates if the step is the last one.
 * @param {string} destination - The destination of the step.
 * @param {string} stepCode - The code of the step.
 * @param {string} tripCode - The code of the trip.
 */
const StepCard = ({ title, startDate, endDate, isLast, destination, stepCode, tripCode }) => {
    const router = useRouter();
    const handleCardPress = () => {
        router.push(`/(auth)/step/${tripCode}-${stepCode}`);
    };

    return (
        <Pressable style={styles.container} onPress={handleCardPress}>
            {!isLast && <View style={styles.line} />}
            <View style={styles.cardContainer}>
                    <View style={styles.cardContent}>
                        <Text style={styles.tripTitle} ellipsizeMode='tail' numberOfLines={1}>{title}</Text>
                        <View style={styles.destinationContainer}>
                            <Entypo name="location-pin" size={20} color="white" />
                            <Text style={styles.tripDestination} ellipsizeMode='tail' numberOfLines={1}>{destination}</Text>
                        </View>
                        <View style={styles.datesContainer}>
                            <MaterialCommunityIcons style={{ transform: [{ rotate: '20deg' }] }} name="airplane" size={20} color="white" />
                            <Text style={styles.tripDates}> {startDate}</Text>
                            <MaterialCommunityIcons style={{ marginLeft: 25, transform: [{ rotate: '70deg' }] }} name="airplane" size={20} color="white" />
                            <Text style={styles.tripDates}> {endDate}</Text>
                        </View>
                    </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '80%',
        position: 'relative',
    },

    cardContainer: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        height: 100,
        borderRadius: 25,
        marginBottom: 50,
        borderColor: COLORS.light_grey,
        borderWidth: 1,
        backgroundColor: COLORS.background_dark,
        zIndex: 1,
    },

    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },

    tripTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        maxWidth: '95%',
    },

    tripDestination: {
        color: 'white',
        fontSize: 15,
        alignSelf: 'center',
        maxWidth: '95%'
    },

    destinationContainer: {
        maxWidth: '90%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },

    datesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },

    tripDates: {
        color: 'white',
        fontSize: 15,
    },

    line: {
        width: 3,
        flex: 1,
        backgroundColor: COLORS.light_grey,
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 0,
    },
});

export default StepCard;
