import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

const TabBar = ({ state, descriptors, navigation }) => {

    // Replace these with your actual image paths
    const icons = {
        trips: (isFocused) => isFocused 
            ? require('../assets/tabicons/MyTrips_blue.png') 
            : require('../assets/tabicons/MyTrips_grey.png'),
        map: (isFocused) => isFocused 
            ? require('../assets/tabicons/Map_blue.png') 
            : require('../assets/tabicons/Map_grey.png'),
        discover: (isFocused) => isFocused 
            ? require('../assets/tabicons/Discover_blue.png') 
            : require('../assets/tabicons/Discover_grey.png'),
        account: (isFocused) => isFocused 
            ? require('../assets/tabicons/Account_blue.png') 
            : require('../assets/tabicons/Account_grey.png'),
    }

    return (
        <View style={styles.tabbar}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacity
                        key={route.name}
                        style={styles.tabbarItem}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                    >
                        <Image 
                            source={icons[route.name](isFocused)} 
                            style={styles.icon} 
                        />
                        <Text style={{ color: isFocused ? '#17C0EB' : '#737373', fontSize: 10 }}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
        borderCurve: 'continuous',
        shadowColor: '#737373',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        shadowOpacity: 0.2,
    },

    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },

    icon: {
        width: 35, // Adjust size as needed
        height: 35, // Adjust size as needed
        resizeMode: 'contain', // Ensure the image fits within the given dimensions
    }
})
export default TabBar
