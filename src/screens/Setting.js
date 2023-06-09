import React, { useEffect, useState, useRef } from "react"
import { View, Text, Switch, TouchableOpacity, TextInput, Modal, StyleSheet, Image, Alert } from "react-native"
import { colors, fontSizes, icons, images, normalize, split } from "../constants"
import Icon from 'react-native-vector-icons/FontAwesome5'
import {
    auth,
    firebaseDatabase,
    ref,
    uploadBytes,
    getDownloadURL,
    storageRef,
    storage,
    update,
    updatePassword,
} from "../../firebase/firebase"
import { Camera, useCameraDevices } from 'react-native-vision-camera'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Picker } from '@react-native-picker/picker'
import { StackActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CLButton } from '../components'
import ImageResizer from 'react-native-image-resizer';
import i18n from '../../i18n'
import { passRegex, phoneRegex } from '../utilies'
import { getUserByTokken } from '../service/UserService'
import { checkCameraPermission } from '../service/CameraService'


const Setting = (props) => {

    //constant
    const camera = useRef(null);
    const devices = useCameraDevices('wide-angle-camera')
    const device = devices.front
    const { navigation } = props
    const { primary, inactive, success, warning, zalert, placeholder } = colors

    //func
    const [init, setInit] = useState(0);
    const [selectedOption, setSelectedOption] = useState(i18n.locale == 'vi' ? 2 : i18n.locale == 'jp' ? 3 : 1);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
    const [modalPhoneVisible, setModalPhoneVisible] = useState(false);
    const [newPassword, setNewPassword] = useState(null);
    const [reNewPassword, setReNewPassword] = useState(null);
    const [errorPassword, setErrorPassword] = useState(null);
    const [errorRePassword, setErrorRePassword] = useState(null);
    const [newPhone, setNewPhone] = useState(null);
    const [errorPhone, setErrorPhone] = useState(null);

    //data user
    const [user, setUser] = useState(null);
    const [photoPath, setPhotoPath] = useState(null);
    const [fullName, setFullName] = useState(null);


    useEffect(() => {
        console.log("__________Init setting__________");
        checkCameraPermission();
        getUserByTokken().then((user) => {
            setUser(user);
        })
    }, [init])


    const handlePressCamera = async () => {
        console.log('-------Press camera--------');
        try {
            const photo = await camera.current.takePhoto({});
            const filePath = "file://" + photo.path;
            const resizedImage = await ImageResizer.createResizedImage(filePath, 800, 800, 'JPEG', 80);
            const { uri: resizedUri, path } = resizedImage;
            console.log(`uri photo:${resizedUri}`);
            setPhotoPath(resizedUri);
        } catch (e) {
            console.log(e)
        }
    };

    const updatePhotoUser = async () => {
        if (photoPath) {
            const uploadedImageUrl = await uploadImage(photoPath);
            const userRef = ref(firebaseDatabase, `users/${user.userID}`);
            update(userRef, { photo: uploadedImageUrl })
                .then(() => {
                    console.log("Update photo's user successfully!.");
                    setPhotoPath(null);
                    setInit(init + 1);
                })
                .catch((error) => {
                    console.log("Error updating photo's user: ", error);
                });
        }
        else {
            console.log("PhotoPath is null!");
        }
        setModalVisible(false);
    }

    const updateNameUser = async () => {
        if (fullName) {
            const userRef = ref(firebaseDatabase, `users/${user.userID}`);
            update(userRef, { name: fullName })
                .then(() => {
                    console.log("Update name's user successfully!.");
                    setFullName(null);
                    setInit(init + 1);
                })
                .catch((error) => {
                    console.log("Error updating name's user: ", error);
                });
        }
        else {
            console.log("PhotoPath is null!");
        }
    }

    const uploadImage = async (uri) => {
        try {
            const ref = storageRef(storage, `UserPhoto/${user.userID}/${user.userID}.jpg`);
            const fileData = await fetch(uri);
            const bytes = await fileData.blob();
            const snapshot = await uploadBytes(ref, bytes, { contentType: 'image/jpeg' });
            const url = await getDownloadURL(snapshot.ref);
            console.log("Uploaded OK! URL:", url);
            return url;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    const handleChangePassword = () => {
        let result = true;

        setErrorPassword(null);
        setErrorRePassword(null);

        if (!newPassword) {
            result = false;
            setErrorPassword(i18n.t('passErr1'))
        } else if (passRegex.test(newPassword) !== true) {
            setErrorPassword(i18n.t('passErr2'))
            result = false
        }

        if (!reNewPassword) {
            result = false;
            setErrorRePassword(i18n.t('repassErr1'))
        } else if (reNewPassword !== newPassword) {
            setErrorRePassword(i18n.t('repassErr2'))
            result = false
        }

        if (result) {
            const user = auth.currentUser;
            updatePassword(user, newPassword)
                .then(() => {
                    setModalPasswordVisible(false);
                    console.log("change your password successfull!");
                    setNewPassword(null);
                    setReNewPassword(null);
                    return Alert.alert(
                        i18n.t('st_changePasswordT'),
                        i18n.t('st_changePasswordD'),
                        [
                            {
                                text: "OK",
                            },
                        ]
                    );
                })
                .catch((error) => {
                    console.log(`Error change password:${error}`);
                })
        }
    }

    const handleChangePhone = () => {
        let result = true;

        setErrorPhone(null);

        if (!newPhone) {
            result = false;
            setErrorPassword(i18n.t('mobileErr1'))
        } else if (phoneRegex.test(newPhone) !== true) {
            setErrorPassword(i18n.t('mobileErr2'))
            result = false
        }

        if (result) {
            const userRef = ref(firebaseDatabase, `users/${user.userID}`);
            update(userRef, { phone: newPhone })
                .then(() => {
                    setModalPhoneVisible(false);
                    console.log("Update phone number's user successfully!.");
                    setNewPhone(null);
                    setInit(init + 1);
                })
                .catch((error) => {
                    console.log("Error updating phone number's user: ", error);
                    setNewPhone(null);
                });
        }
    }

    const showConfirmDialog = () => {
        return Alert.alert(
            i18n.t('st_logoutT'),
            i18n.t('st_logoutD'),
            [
                {
                    text: i18n.t('p_yes'),
                    onPress: async () => {
                        auth.signOut()
                        await AsyncStorage.removeItem('token');
                        navigation.dispatch(StackActions.replace('Login'));
                        console.log("Sign out!");
                    },
                },
                {
                    text: i18n.t('p_no'),
                },
            ]
        );
    };

    return <KeyboardAwareScrollView
        enableResetScrollToCoords={true}
        contentContainerStyle={{ flexGrow: 1 }}
    >
        <View style={{
            paddingHorizontal: split.s4,
            paddingVertical: split.s5,
            backgroundColor: primary,
        }}>
            <Text style={{
                color: "white",
                fontSize: normalize(18),
                fontWeight: 'bold',
                padding: 10,
            }}>Settings</Text>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10,
            marginTop: 5,
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>{i18n.t('st_update')}</Text>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                    borderColor: primary,
                    borderWidth: 1,
                    height: 35,
                    width: '80%',
                    borderRadius: 10,
                    marginHorizontal: 17,
                    marginVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: primary
                }}>
                <Text style={{
                    fontSize: fontSizes.h5,
                    color: 'white',
                }}>{i18n.t('st_openCamera')}</Text>
            </TouchableOpacity>
            <Modal visible={modalVisible} animationType="slide">
                <View style={{
                    flex: 1,
                    marginHorizontal: 5
                }}>
                    <Text style={{
                        color: 'black',
                        fontSize: normalize(20),
                        fontWeight: 'bold',
                        padding: 10
                    }}>Your Photo</Text>
                    <View style={{ height: 1, backgroundColor: primary }} />
                </View>
                <View style={{
                    flex: 2,
                    justifyContent: 'space-around',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <Image
                        source={user ? { uri: user.photo || images.uriUserPhoto } : images.userPhoto}
                        style={{
                            width: "30%",
                            height: "80%",
                            alignSelf: "center",
                            borderRadius: 90,
                        }}
                    />
                    <CLButton
                        title={i18n.t('st_update')}
                        sizeBT="20%"
                        height="30%"
                        colorBG={photoPath != null ? primary : inactive}
                        colorBD={"white"}
                        colorT={photoPath != null ? "white" : "black"}
                        disabled={photoPath == null}
                        onPress={updatePhotoUser} />
                    <Image
                        source={photoPath ? { uri: photoPath } : images.userPhoto}
                        style={{
                            width: "30%",
                            height: "80%",
                            alignSelf: "center",
                            borderRadius: 90,
                        }}
                    />
                </View>
                <View style={{ flex: 8, justifyContent: 'center' }}>
                    {device && (
                        <View style={{ flex: 1, backgroundColor: 'black' }}>
                            <Camera
                                ref={camera}
                                style={{
                                    height: "85%",
                                    width: "100%",
                                    marginBottom: split.s3,
                                }}
                                device={device}
                                isActive={true}
                                preset="medium"
                                photo={true}
                            />
                            <TouchableOpacity
                                //onPress={handlePressCamera}
                                onPress={() => {
                                    handlePressCamera();
                                    console.log(photoPath);
                                }}
                            >
                                <View
                                    style={{
                                        borderWidth: 2,
                                        borderColor: "white",
                                        height: 50,
                                        width: 50,
                                        borderRadius: 30,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginBottom: 20,
                                        alignSelf: 'center',
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    <CLButton title={i18n.t('p_close')}
                        onPress={() => {
                            setPhotoPath(null);
                            setModalVisible(false)
                        }} />
                </View>
            </Modal>
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 15
        }}>
            <Text style={{
                fontSize: fontSizes.h4,
                color: primary,
            }}>{i18n.t('st_displayName')}</Text>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <TextInput
                    autoCorrect={false}
                    placeholder={user ? user.name || "Full Name" : "Full Name"}
                    placeholderTextColor={placeholder}
                    value={fullName}
                    onChangeText={setFullName}
                    style={{
                        color: 'black',
                        flex: 1,
                        //backgroundColor:'red'
                    }} />
                <TouchableOpacity
                    onPress={updateNameUser}
                    style={{
                        padding: normalize(10),
                        borderWidth: 1,
                        borderColor: primary,
                        backgroundColor: primary,
                        borderRadius: 20,
                    }}>
                    <Text style={{ color: "white" }}>Change</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        <View style={{
            flex: 15,
            marginHorizontal: 10,
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h4,
                fontWeight: '500'
            }}>{i18n.t('st_theme')}</Text>
            <View style={{
                flexDirection: 'row',
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Icon name='adjust' size={20} />
                <Text style={{
                    fontSize: fontSizes.h5,
                    color: 'black',
                    marginStart: 5
                }}>{i18n.t('st_enableDark')}</Text>
                <View style={{ flex: 1 }} />
                <Switch />
            </View>
        </View>
        <View style={{
            borderWidth: 1,
            borderColor: 'black',
            borderRadius: 7,
            width: normalize(300),
            flexDirection: 'row',
            alignItems: 'center',
            paddingStart: 10,
            marginHorizontal: 10,
            flex: 20,
        }}>
            {/* <Text style={{ fontSize: fontSizes.h5, color: "#191970" }}>Ngôn ngữ |</Text> */}
            <Image
                source={selectedOption == 1 ? images.fagUSA : selectedOption == 2 ? images.fagVN : images.fagJP}
                style={{
                    height: normalize(30),
                    width: normalize(30),
                }} />
            <Picker
                selectedValue={selectedOption}
                style={{
                    flex: 1,
                    height: 50,
                    color: 'black',
                }}
                onValueChange={(itemValue, itemIndex) => {
                    setSelectedOption(itemValue);
                    i18n.locale = itemValue == 1 ? 'en' : itemValue == 2 ? 'vi' : 'jp';
                }}
            >
                <Picker.Item label={i18n.t('w_item1')} value={1} />
                <Picker.Item label={i18n.t('w_item2')} value={2} />
                <Picker.Item label={i18n.t('w_item3')} value={3} />
            </Picker>
        </View>
        <View style={{
            marginHorizontal: 10,
            flex: 15,
            //backgroundColor:"red"
        }}>
            <TouchableOpacity style={{
                marginTop: 15,
                flexDirection: 'row',
                paddingVertical: 10,
                alignItems: 'center',
                //backgroundColor:"green",
                borderTopWidth: 1,
                borderBottomWidth: 1,
            }} onPress={async () => {
                setModalPasswordVisible(true);
            }}>
                <Icon
                    name='unlock-alt'
                    style={{ marginStart: 10 }}
                    size={16} color={'black'}
                />
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h6,
                    color: 'black',
                    paddingStart: 10,
                }}>{i18n.t('st_changePassword')}</Text>
                <View style={{ flex: 1 }} />
                <Icon
                    name='chevron-right'
                    style={{
                        paddingEnd: 10,
                        opacity: 0.5,
                    }}
                    size={normalize(15)} color={'black'}
                />
            </TouchableOpacity>
            <Modal visible={modalPasswordVisible} animationType="fade" transparent={true}  >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={styles.container}>
                        <View>
                            <View style={{ backgroundColor: primary, padding: "5%", marginBottom: normalize(10) }}>
                                <Text style={{ color: 'black', fontSize: fontSizes.h3 }}>{i18n.t('st_changePassword')}</Text>
                            </View>
                            <Text style={{
                                color: 'red',
                                fontSize: fontSizes.h5,
                                marginStart: normalize(90)
                            }}>{errorPassword}</Text>
                            <View style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                marginHorizontal: split.s3,
                                marginVertical: split.s3,
                                //backgroundColor:'red'
                            }}>
                                <Text style={{
                                    fontSize: fontSizes.h5,
                                    color: "black",
                                    width: normalize(62)
                                }}>{i18n.t('st_newPassword')}:</Text>
                                <TextInput style={{
                                    borderWidth: 1,
                                    borderColor: 'black',
                                    borderRadius: 5,
                                    width: normalize(160),
                                    marginHorizontal: 10,
                                    color: "black",
                                }}
                                    numberOfLines={1}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    autoCorrect={false}
                                    placeholder={i18n.t('st_newPasswordD')}
                                    placeholderTextColor={inactive}
                                />
                            </View>
                            <Text style={{
                                color: 'red',
                                fontSize: fontSizes.h5,
                                marginStart: normalize(90)
                            }}>{errorRePassword}</Text>
                            <View style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                marginHorizontal: split.s3,
                                marginVertical: split.s3,
                                //backgroundColor:'red'
                            }}>
                                <Text style={{
                                    fontSize: fontSizes.h5,
                                    color: "black",
                                    width: normalize(62)
                                }}>{i18n.t('st_retypePassword')}:</Text>
                                <TextInput style={{
                                    borderWidth: 1,
                                    borderColor: 'black',
                                    borderRadius: 5,
                                    width: normalize(160),
                                    marginHorizontal: 10,
                                    color: "black",
                                }}
                                    numberOfLines={1}
                                    value={reNewPassword}
                                    onChangeText={setReNewPassword}
                                    autoCorrect={false}
                                    placeholder={i18n.t('st_reNewPasswordD')}
                                    placeholderTextColor={inactive}
                                />
                            </View>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                            <CLButton title={i18n.t('st_update')} sizeBT={"35%"} height={normalize(30)} colorBG={primary} colorT={"white"}
                                onPress={() => {
                                    handleChangePassword();
                                }} />
                            <CLButton title={i18n.t('st_cancel')} sizeBT={"35%"} height={normalize(30)} colorBG={primary} colorT={"white"}
                                onPress={() => setModalPasswordVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
        <View style={{
            marginHorizontal: 10,
            flex: 15,
            //backgroundColor:"red"
        }}>
            <TouchableOpacity style={{
                marginTop: 15,
                flexDirection: 'row',
                paddingVertical: 10,
                alignItems: 'center',
                //backgroundColor:"green",
                borderTopWidth: 1,
                borderBottomWidth: 1,
            }} onPress={async () => {
                setModalPhoneVisible(true);
            }}>
                <Icon
                    name='mobile-alt'
                    style={{ marginStart: 10 }}
                    size={16} color={'black'}
                />
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h6,
                    color: 'black',
                    paddingStart: 10,
                }}>{i18n.t('st_changePhone')}</Text>
                <View style={{ flex: 1 }} />
                <Icon
                    name='chevron-right'
                    style={{
                        paddingEnd: 10,
                        opacity: 0.5,
                    }}
                    size={normalize(15)} color={'black'}
                />
            </TouchableOpacity>
            <Modal visible={modalPhoneVisible} animationType="fade" transparent={true}  >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={styles.container}>
                        <View>
                            <View style={{ backgroundColor: primary, padding: "5%", marginBottom: normalize(10) }}>
                                <Text style={{ color: 'black', fontSize: fontSizes.h3 }}>{i18n.t('st_changePhone')}</Text>
                            </View>
                            <Text style={{
                                color: 'red',
                                fontSize: fontSizes.h5,
                                marginStart: normalize(90)
                            }}>{errorPhone}</Text>
                            <View style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                marginHorizontal: split.s3,
                                marginVertical: split.s3,
                                //backgroundColor:'red'
                            }}>
                                <Text style={{
                                    fontSize: fontSizes.h5,
                                    color: "black",
                                    width: normalize(62)
                                }}>{i18n.t('st_phone')}:</Text>
                                <TextInput style={{
                                    borderWidth: 1,
                                    borderColor: 'black',
                                    borderRadius: 5,
                                    width: normalize(160),
                                    marginHorizontal: 10,
                                    color: "black",
                                }}
                                    numberOfLines={1}
                                    value={newPhone}
                                    onChangeText={setNewPhone}
                                    autoCorrect={false}
                                    placeholder={user ? user.phone || "phone number" : "phone number"}
                                    placeholderTextColor={inactive}
                                />
                            </View>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                            <CLButton title={i18n.t('st_update')} sizeBT={"35%"} height={normalize(30)} colorBG={primary} colorT={"white"}
                                onPress={() => {
                                    handleChangePhone();
                                }} />
                            <CLButton title={i18n.t('st_cancel')} sizeBT={"35%"} height={normalize(30)} colorBG={primary} colorT={"white"}
                                onPress={() => setModalPhoneVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
        <View style={{
            marginHorizontal: 10,
            flex: 15,
            //backgroundColor:"red"
        }}>
            <TouchableOpacity style={{
                marginTop: 15,
                flexDirection: 'row',
                paddingVertical: 10,
                alignItems: 'center',
                //backgroundColor:"green",
                borderTopWidth: 1,
                borderBottomWidth: 1,
            }} onPress={async () => {
                showConfirmDialog();
            }}>
                <Icon
                    name='sign-out-alt'
                    style={{ marginStart: 10 }}
                    size={16} color={'black'}
                />
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h6,
                    color: 'black',
                    paddingStart: 10,
                }}>{i18n.t('st_signOut')}</Text>
                <View style={{ flex: 1 }} />
                <Icon
                    name='chevron-right'
                    style={{
                        paddingEnd: 10,
                        opacity: 0.5,
                    }}
                    size={normalize(15)} color={'black'}
                />
            </TouchableOpacity>
        </View>
        {user && <View style={{
            //backgroundColor: 'purple',
            margin: split.s2,
            paddingHorizontal: split.s3,
            paddingVertical: split.s1,
            borderColor: primary,
            borderWidth: 1,
            borderRadius: 20,
            flex: 30
        }}>
            <Text style={{
                color: primary,
                fontSize: fontSizes.h2,
                fontWeight: '500',
                alignSelf: 'center',
                //backgroundColor:"green"
            }}>{i18n.t('st_account')}</Text>
            <View style={{
                flexDirection: "row",
                //backgroundColor:"red"
            }}>
                <Image
                    //source={user ? { uri: user.photo || images.uriUserPhoto } : images.userPhoto}
                    source={{ uri: user.photo || images.uriUserPhoto }}
                    style={{
                        width: "35%",
                        //height: "60%",
                        height: normalize(105),
                        alignSelf: "center",
                        borderRadius: 90,
                    }}
                />
                <View style={{
                    flex: 1,
                    //backgroundColor:"green",
                    margin: split.s1,
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: '600',
                    }}>{i18n.t('st_email')}:</Text>
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: '600',
                        alignSelf: 'center'
                    }}>{user.email}</Text>
                    <View style={{ height: normalize(8) }} />
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: '600',
                    }}>{i18n.t('st_name')}: {user.name || "NULL!"}</Text>
                    <Text style={{
                        color: "black",
                        fontSize: fontSizes.h4,
                        fontWeight: '600',
                    }}>{i18n.t('st_verify')}: {user.emailVerified ? "Yes" : "No"}</Text>
                </View>
            </View>
        </View>}
        <View style={{
            flex: 10,
        }} />
    </KeyboardAwareScrollView>
}

const styles = StyleSheet.create({
    pickerContainer: {
        margin: 20,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        height: 50,
        width: 350,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        marginBottom: 60,
    },
    picker: {
        flex: 1,
        height: 50,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        marginHorizontal: '10%',
        backgroundColor: 'white',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderWidth: 1,
        paddingBottom: '5%',
    },
});

export default Setting

