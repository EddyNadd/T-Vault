import { Stack, useSegments, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../firebase.jsx";

export default function RootLayout() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const segments = useSegments();

    const onAuthStateChanged = (user) => {
        setUser(user);
        if (initializing) {
            setInitializing(false);
        }
    }

    useEffect(() => {
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    useEffect(() => {
        if (initializing) {
            return;
        }
        const inAuthGroup = segments[0] == '(auth)';

        if (user && !inAuthGroup) {
            router.replace('/(auth)/Home');
        } else if (!user && inAuthGroup) {
            router.replace('/');
        }
    }, [user, initializing]);

    if (initializing) {
        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    return (
        <Stack>
            {// put index routes here
            }
            <Stack.Screen name="index" options={{ animation: "none", headerTitle:"Signin" }}/>
            <Stack.Screen name="Signup" options={{ animation: "none" }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
    );
}