import { Text, View, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import COLORS from '../styles/COLORS';

const StepCard = ({ title, startDate, endDate, isLast, destination, tripCode }) => {

    const handleCardPress = () => {
        // Code pour gérer la pression sur la carte
    };

    return (
        <View style={styles.container}>
            {!isLast && <View style={styles.line} />}
            <View style={styles.cardContainer}>
                <Pressable onPress={handleCardPress}>
                    <View style={styles.cardContent}>
                        <Text style={styles.tripTitle}>{title}</Text>
                        <View style={styles.destinationContainer}>
                            <Entypo name="location-pin" size={20} color="white" />
                            <Text style={styles.tripDestination}>{destination}</Text>
                        </View>
                        <View style={styles.datesContainer}>
                            <MaterialCommunityIcons style={{ transform: [{ rotate: '20deg' }] }} name="airplane" size={20} color="white" />
                            <Text style={styles.tripDates}> {startDate}</Text>
                            <MaterialCommunityIcons style={{ marginLeft: 25, transform: [{ rotate: '70deg' }] }} name="airplane" size={20} color="white" />
                            <Text style={styles.tripDates}> {endDate}</Text>
                        </View>
                    </View>
                </Pressable>
            </View>
        </View>
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
    },

    tripDestination: {
        color: 'white',
        fontSize: 15,
        alignSelf: 'center',
    },

    destinationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },

    datesContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
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
        backgroundColor: COLORS.light_grey, // Couleur de la ligne
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 0, // S'assurer que la ligne est en arrière-plan
    },
});

export default StepCard;
