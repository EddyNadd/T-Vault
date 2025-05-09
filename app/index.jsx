import { StyleSheet, ActivityIndicator, KeyboardAvoidingView, SafeAreaView, View, Text, Animated } from "react-native";
import { auth } from "../firebase.jsx";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Input, InputField } from '@/components/ui/input';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText, FormControlHelper } from '@/components/ui/form-control';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import colors from "@/styles/COLORS.jsx";
import AndroidSafeArea from '../styles/AndroidSafeArea';

/**
 * Handles user authentication and manages UI for signing in.
 */
export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const imageScale = useRef(new Animated.Value(1)).current;
    const signInMargin = useRef(new Animated.Value(0)).current;

     /**
     * Handles focus event for the input fields.
     * Animates the image scale down and shifts the sign-in button margin.
     */
    const handleFocus = () => {
        Animated.parallel([
            Animated.timing(imageScale, {
                toValue: 0.7,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(signInMargin, {
                toValue: 50,
                duration: 300,
                useNativeDriver: false,
            })
        ]).start();
    };

     /**
     * Handles blur event for the input fields.
     * Resets the image scale and sign-in button margin to original values.
     */
    const handleBlur = () => {
        Animated.parallel([
            Animated.timing(imageScale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(signInMargin, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            })
        ]).start();
    };


    /**
     * Callback function for authentication state changes.
     * Updates the initializing state once authentication is set up.
     */
    const onAuthStateChanged = () => {
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
     * Redirects to the sign-up screen.
     */
    const signUp = async () => {
        router.replace('/Signup');
    }

      /**
     * Handles user sign-in with email and password.
     * Shows loading state and handles authentication errors.
     */
    const signIn = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(true);
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
        <SafeAreaView style={AndroidSafeArea.AndroidSafeArea}>
            <KeyboardAvoidingView behavior="padding" style={styles.main}>
                <View style={styles.imageContainer}>
                    <Animated.Image source={require('../assets/logo_transparent_bg.png')} style={[styles.image, { transform: [{ scale: imageScale }] }]} resizeMode="contain" />
                </View>
                <View style={styles.textFieldContainer}>
                    <FormControl isInvalid={error} style={{ marginBottom: 5 }}>
                        <View style={styles.textField}>
                            <Input variant="rounded" size="xl" style={{ marginBottom: 20 }}>
                                <InputField textContentType="oneTimeCode" type="email" placeholder="Email" onChangeText={setEmail} value={email} autoCapitalize="none" autoCorrect={false} spellCheck="false" onFocus={handleFocus} onBlur={handleBlur} />
                            </Input>
                            <Input variant="rounded" size="xl">
                                <InputField textContentType="oneTimeCode" type="password" placeholder="Password" onChangeText={setPassword} value={password} autoCapitalize="none" onFocus={handleFocus} onBlur={handleBlur} />
                            </Input>
                        </View>
                        <View style={styles.errorContainer}>
                            {error && (
                                <FormControlError>
                                    <FormControlErrorText>
                                        The email or password is incorrect
                                    </FormControlErrorText>
                                </FormControlError>
                            )}
                        </View>
                    </FormControl>
                    {loading ? (
                        <>
                            <Button variant="outline" disabled={true}>
                                <ButtonSpinner />
                                <ButtonText> Please wait...</ButtonText>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button size="md" onPress={signIn} variant="outline" action="primary">
                                <ButtonText>Sign In</ButtonText>
                            </Button>
                        </>
                    )}
                </View>
                <Animated.View style={[styles.signUpContainer, { marginTop: signInMargin }]}>
                    <Text style={{ color: "white", textAlign: 'center' }}>Don't have an account?</Text>
                    <Button size="md" onPress={signUp} variant="link" action="primary" disabled={loading}>
                        <ButtonText style={{ color: colors.blue_dark }}>Sign Up</ButtonText>
                    </Button>
                </Animated.View>
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
        alignItems: 'center'
    },
    textFieldContainer: {
        width: '100%',
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 2
    },
    textField: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        minHeight: 25,
        justifyContent: 'center',
    },
    signUpContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    imageContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
