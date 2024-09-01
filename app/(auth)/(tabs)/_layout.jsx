import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { Tabs } from 'expo-router';
import TabBar from '../../../components/TabBar';

/**
 *  Main layout for the tabs view
 * @returns 
 */
const _layout = () => {
    /**
     * State to check if the keyboard is visible
     */
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    /**
     * Listen for keyboard events
     * Show the tab bar only when the keyboard is not visible
     */
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            tabBar={props => !isKeyboardVisible ? <TabBar {...props} /> : null}
        >
            <Tabs.Screen
                name="trips"
                options={{ title: 'MY TRIPS' }}
            />
            <Tabs.Screen
                name="discover"
                options={{ title: 'DISCOVER' }}
            />
            <Tabs.Screen
                name="map"
                options={{ title: 'MAP' }}
            />
            <Tabs.Screen
                name="account"
                options={{ title: 'ACCOUNT' }}
            />
        </Tabs>
    );
};

export default _layout;
