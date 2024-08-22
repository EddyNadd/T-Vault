import { StyleSheet, ActivityIndicator, Image, Button, KeyboardAvoidingView, SafeAreaView, View } from "react-native";
import { auth } from "../firebase.jsx";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Input, InputField } from '@/components/ui/input';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorIcon, FormControlErrorText } from '@/components/ui/form-control';

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const onAuthStateChanged = () => {
        if (initializing) {
            setInitializing(false);
        }
    }

    useEffect(() => {
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    const signUp = async () => {
        router.replace('/Signup');
    }

    const signIn = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Signed in successfully!");
        } catch (error) {
            setError(true);
            console.error("Failed to sign in:", error);
        } finally {
            setLoading(false);
        }
    }

    if (initializing) {
        return (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#1E1E1E"
            }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.main}>
            <KeyboardAvoidingView behavior="padding">
                <Image source={require('../assets/logo_transparent_bg.png')} style={styles.image} resizeMode="contain" />
                <FormControl isInvalid={error}>
                    <FormControlLabel>
                        <FormControlLabelText />
                    </FormControlLabel>
                    <View style={styles.textField}>
                        <Input variant="rounded" size="lg" style={{ marginBottom: 10 }}>
                            <InputField type="email" placeholder="Email" onChangeText={setEmail} value={email} autoCapitalize="none" />
                        </Input>
                        <Input variant="rounded" size="lg">
                            <InputField type="password" placeholder="Password" onChangeText={setPassword} value={password} autoCapitalize="none" />
                        </Input>
                    </View>
                    <FormControlError>
                        <FormControlErrorIcon />
                        <FormControlErrorText>
                            The email or password is incorrect
                        </FormControlErrorText>
                    </FormControlError>
                </FormControl>
                {loading ? (
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                    <>
                        <Button title="Sign In" onPress={signIn} />
                        <Button title="Sign Up" onPress={signUp} />
                    </>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    main: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "90%",
        height: "100%",
        marginHorizontal: "auto",
        justifyContent: "space-around",
        alignItems: "center"
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    textField: {
        width: '100%',
        marginBottom: 10,
    },
});
