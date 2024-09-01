import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import COLORS from '../styles/COLORS'

/**
 * TabBar component that displays the navigation tabs at the bottom of the screen.
 * @param {object} props.state - The state of the tab bar.
 * @param {object} props.descriptors - The descriptors of the tab bar.
 * @param {object} props.navigation - The navigation object.
 */
const TabBar = ({ state, descriptors, navigation }) => {

    // Icons for the tab bar
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
                        <Text style={{ color: isFocused ? COLORS.blue : COLORS.light_grey, fontSize: 10 }}>
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
        backgroundColor: COLORS.background_dark,
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
        borderCurve: 'continuous',
        shadowColor: COLORS.light_grey,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 10,
        shadowOpacity: 0.2,
        elevation: 5,
    },

    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },

    icon: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
    }
})
export default TabBar