import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from "react-native";
import i18n from '../../../i18n';
import { useNavigation, StackActions } from '@react-navigation/native'
import {
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    firebaseDatabase,
    ref,
    set,
    update,
} from "../../../firebase/firebase"
import AsyncStorage from '@react-native-async-storage/async-storage'


const userLogin = () => {

    const navigation = useNavigation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState(null)
    const [passwordError, setPasswordError] = useState(null)
    const [showPassword, setShowPassword] = useState(true)
    const [registeredEmail, setRegisteredEmail] = useState(false)

    function validateCredentials() {
        let result = true;

        setEmailError(null);
        setPasswordError(null);

        if (!email) {
            setEmailError(i18n.t('emailErr1'));
            result = false;
        }
        if (!password) {
            setPasswordError(i18n.t('passErr1'));
            result = false;
        }
        return result;
    }

    function signInAction() {
        if (validateCredentials()) {
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    const unsubscribe = onAuthStateChanged(auth, async (responseUser) => {
                        if (responseUser) {
                            console.log("Auth successfully!");
                            AsyncStorage.setItem('token', responseUser.accessToken)
                                .then(() => {
                                    console.log("Logined to app");
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'UItab' }],
                                    });
                                    //navigation.dispatch(StackActions.replace('UItab'));
                                    console.log("Set Token successfully!");
                                }).catch(() => {
                                    console.log("Error set Token!");
                                })
                            const fcmToken = await AsyncStorage.getItem("fcmToken");
                            const userRef = ref(firebaseDatabase, `users/${responseUser.uid}`);
                            update(userRef, { accessToken: responseUser.accessToken })
                                .then(() => {
                                    console.log("Update accessToken's user successfully!.");
                                })
                                .catch((error) => {
                                    console.log("Error updating accessToken's user: ", error);
                                });
                            update(userRef, { expirationTime: responseUser.stsTokenManager.expirationTime })
                            .then(() => {
                                console.log("Update expirationTime's user successfully!.");
                            })
                            .catch((error) => {
                                console.log("Error updating expirationTime's user: ", error);
                            });
                            update(userRef, { emailVerified: responseUser.emailVerified })
                            .then(() => {
                                console.log("Update emailVerified's user successfully!.");
                            })
                            .catch((error) => {
                                console.log("Error updating emailVerified's user: ", error);
                            });
                            if (fcmToken) {
                                update(userRef, { fcmToken: fcmToken })
                                    .then(() => {
                                        console.log("Update fcmToken's user successfully!.");
                                    })
                                    .catch((error) => {
                                        console.log("Error updating fcmToken's user: ", error);
                                    });
                            }
                        }
                    })
                    unsubscribe();
                })
                .catch((error) => {
                    console.log("Error sign in: ", error);
                    Alert.alert(error.name, error.message, [{ text: 'Ok' }])
                });
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        emailError,
        passwordError,
        signInAction,
    }

}

export default userLogin