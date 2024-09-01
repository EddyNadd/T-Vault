import { Stack, useSegments, useRouter } from "expo-router";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../firebase.jsx";
import { FirestoreListenersProvider } from "../components/FirestoreListenerContext.jsx";

// Layout component for the root route
export default function RootLayout() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const segments = useSegments();

     /**
     * Handles changes to the authentication state.
     * Updates user state and stops initializing process.
     * @param {Object} user - The authenticated user object.
     */
    const onAuthStateChanged = (user) => {
        setUser(user);
        if (initializing) {
            setInitializing(false);
        }
    }

    /**
     * Adds an authentication state change listener when the component mounts.
     */
    useEffect(() => {
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    /**
     * Redirects the user based on their authentication status.
     */
    useEffect(() => {
        if (initializing) {
            return;
        }
        const inAuthGroup = segments[0] == '(auth)';

        if (user && !inAuthGroup) {
            router.replace('/(auth)/(tabs)/trips');
        } else if (!user && inAuthGroup) {
            router.replace('/');
        }
    }, [user, initializing]);

    if (initializing) {
        return (
            <GluestackUIProvider mode="dark">
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#1E1E1E"
                }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </GluestackUIProvider>
        );
    }

    return (
        <GluestackUIProvider mode="dark">
            <FirestoreListenersProvider>
                <Stack screenOptions={{ headerShown: false, animation: "none", contentStyle: { backgroundColor: "#1E1E1E" } }} >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="Signup" />
                    <Stack.Screen name="(auth)" />
                </Stack>
            </FirestoreListenersProvider>
        </GluestackUIProvider>
    );
}