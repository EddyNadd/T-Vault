import { StyleSheet, KeyboardAvoidingView, Text, SafeAreaView, View, Animated, useWindowDimensions } from "react-native";
import { auth, db } from "../firebase.jsx";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDocs, setDoc, collection, query, where, documentId } from "firebase/firestore";
import { useState, useRef } from "react";
import { router } from "expo-router";
import { Input, InputField } from '@/components/ui/input';
import { FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText, FormControlHelper } from '@/components/ui/form-control';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import colors from "@/styles/COLORS.jsx";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const { height } = useWindowDimensions();
    const [errorText, setErrorText] = useState("");

    const imageFlex = useRef(new Animated.Value(2)).current;
    const imageScale = useRef(new Animated.Value(1)).current;
    const signInMargin = useRef(new Animated.Value(0)).current;
    const inputMargin = useRef(new Animated.Value(20)).current;

    const handleFocus = () => {
        Animated.parallel([
            Animated.timing(imageFlex, {
                toValue: height < 900 ? 1 : 1.5,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(imageScale, {
                toValue: 0.7,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(signInMargin, {
                toValue: 50,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(inputMargin, {
                toValue: height < 700 ? 10 : 20,
                duration: 300,
                useNativeDriver: false,
            })
        ]).start();
    };

    const handleBlur = () => {
        Animated.parallel([
            Animated.timing(imageFlex, {
                toValue: 2,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(imageScale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(signInMargin, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(inputMargin, {
                toValue: 20,
                duration: 300,
                useNativeDriver: false,
            })
        ]).start();
    };

    const signUp = async () => {
        setLoading(true);
        try {
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            requestedUser = await getDocs(query(collection(db, "Users"), where(documentId(), "==", username)));
            if (!requestedUser.empty) {
                throw new Error("Username already exists!");
            }
            await createUserWithEmailAndPassword(auth, email, password);
            updateProfile(auth.currentUser, { displayName: username })
            await setDoc(doc(db, "Users", username), {
                uid: auth.currentUser.uid
            });
            await setDoc(doc(db, "UID", auth.currentUser.uid), {
                uid: username
            });
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setErrorText("The email address is already in use by another account.");
            } else if (error.code === 'auth/invalid-email') {
                setErrorText("The email address is badly formatted.");
            } else if (error.code === 'auth/weak-password') {
                setErrorText("Password must be at least 6 characters long.");
            } else if (error.message === "Passwords do not match") {
                setErrorText("Passwords do not match.");
            } else if (error.message === "Username already taken!") {
                setErrorText("Username already exists!");
            } else {
                setErrorText("An unexpected error occurred. Please try again.");
            }
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    const signIn = async () => {
        router.replace('/');
    }

    return (
        <SafeAreaView>
            <KeyboardAvoidingView style={styles.main} behavior="padding">
                <Animated.View style={[styles.imageContainer, { flex: imageFlex }]}>
                    <Animated.Image source={require('../assets/logo_transparent_bg.png')} style={[styles.image, { transform: [{ scale: imageScale }] }]} resizeMode="contain" />
                </Animated.View>
                <View style={styles.textFieldContainer}>
                    <FormControl isInvalid={error} style={{ marginBottom: 5 }}>
                        <FormControlLabel>
                            <FormControlLabelText />
                        </FormControlLabel>
                        <View style={styles.textField} behavior="padding">
                            <Animated.View style={[styles.textField, { marginBottom: inputMargin }]}>
                                <Input variant="rounded" size="xl">
                                    <InputField textContentType="oneTimeCode" type="email" placeholder="Username" onChangeText={setUsername} value={username} autoCapitalize="none" autoCorrect={false} spellCheck="fasle" onFocus={handleFocus} onBlur={handleBlur} />
                                </Input>
                            </Animated.View>
                            <Animated.View style={[styles.textField, { marginBottom: inputMargin }]}>
                                <Input variant="rounded" size="xl">
                                    <InputField textContentType="oneTimeCode" type="email" placeholder="Email" onChangeText={setEmail} value={email} autoCapitalize="none" autoCorrect={false} spellCheck="false" onFocus={handleFocus} onBlur={handleBlur} />
                                </Input>
                            </Animated.View>
                            <Animated.View style={[styles.textField, { marginBottom: inputMargin }]}>
                                <Input variant="rounded" size="xl">
                                    <InputField textContentType="oneTimeCode" type="password" placeholder="Password" onChangeText={setPassword} value={password} autoCapitalize="none" onFocus={handleFocus} onBlur={handleBlur} />
                                </Input>
                            </Animated.View>
                            <Input variant="rounded" size="xl">
                                <InputField textContentType="oneTimeCode" type="password" placeholder="Confirm password" onChangeText={setConfirmPassword} value={confirmPassword} autoCapitalize="none" onFocus={handleFocus} onBlur={handleBlur} />
                            </Input>
                        </View>
                        <View style={styles.errorContainer}>
                            {error && (
                                <FormControlError>
                                    <FormControlErrorText>
                                       {errorText}
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
                            <Button size="md" onPress={signUp} variant="outline" action="primary">
                                <ButtonText>Sign Up</ButtonText>
                            </Button>
                        </>
                    )}
                </View>
                <Animated.View style={[styles.signInContainer, { marginTop: signInMargin }]}>
                    <Text style={{ color: "white", textAlign: 'center' }}>Already have an account?</Text>
                    <Button size="md" onPress={signIn} variant="link" action="primary" disabled={loading}>
                        <ButtonText style={{ color: colors.blue_dark }}>Sign In</ButtonText>
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
        alignItems: "center",
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
    signInContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    imageContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
