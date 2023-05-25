import React, { useState, useEffect, useCallback, useRef } from "react";
import { Text, Image, View, TouchableOpacity, Keyboard, KeyboardAvoidingView, TextInput, ImageBackground, ScrollView, FlatList, Modal, StyleSheet, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome5"
import { colors, fontSizes, icons, images, normalize, split } from "../../constants"
import RequestItem from "./RequestItem";
import Category from "./Category";
import { Dropdown, CLButton } from '../../components'
import {
    auth,
    firebaseDatabase,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
    ref,
    get,
    set,
    orderByChild,
    uploadBytes,
    getDownloadURL,
    storageRef,
    storage,
    app,
    onValue,
    child,
    equalTo,
    query,
    update,
} from "../../../firebase/firebase"
import useMap from '../FullMap/FullMap'
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';

import AsyncStorage from '@react-native-async-storage/async-storage'
import Credentials from '../../../Credentials'
import { distanceTwoGeo } from '../../utilies'
/** 
 - ListView from a map of objects
 - FlatList
 */
const GOOGLE_MAPS_APIKEY = Credentials.APIkey_Direction;

const getDirections = (origin, destination) => {
    console.log("API direction RUNNING...................!");
    return new Promise(async (resolve, reject) => {
        try {
            console.log("API direction RUNNING...................!");
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/directions/json',
                {
                    params: {
                        origin: origin,
                        destination: destination,
                        key: GOOGLE_MAPS_APIKEY,
                    },
                }
            );
            console.log("-----------------------------------")
            console.log(response)
            const routes = response.data.routes;
            console.log("-----------------------------------")
            console.log(routes)
            if (routes && routes.length > 0) {
                const points = routes[0].overview_polyline.points;
                const decodedPoints = decodePolyline(points);
                console.log("-----------------------------------")
                console.log(routes[0])
                const direction = {
                    summary: routes[0].summary,
                    startAddress: routes[0].legs[0].start_address,
                    endAddress: routes[0].legs[0].end_address,
                    distance: routes[0].legs[0].distance,
                    duration: routes[0].legs[0].duration,
                    steps: routes[0].legs[0].steps,
                    route: decodedPoints,
                    state: '0',
                    timestamp: new Date().getTime(),
                };
                console.log("Direction OK! URL:", direction);
                resolve(direction);
            } else {
                console.error('Error building directions!');
                resolve(null);
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
            resolve(null);
        }
    });
};

const decodePolyline = (encodedPolyline) => {
    const polyline = require('@mapbox/polyline');
    const decoded = polyline.decode(encodedPolyline);
    return decoded.map((coordinate) => ({
        latitude: coordinate[0],
        longitude: coordinate[1],
    }));
};

const getUserIDByTokken = async () => {
    const accessToken = await AsyncStorage.getItem('token');
    const dbRef = ref(firebaseDatabase, "users");
    const dbQuery = query(dbRef, orderByChild("accessToken"), equalTo(accessToken));
    const data = await get(dbQuery);
    const userID = Object.keys(data.val())[0];
    return userID;
}

const WaitingScreen = () => {
    return (
        <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={{
                color: 'black',
            }}>
                Waiting for location...</Text>
            <Image source={images.logo} style={{ height: normalize(200), width: normalize(200) }} />
        </View>
    );
};

const SmartCal = (props) => {

    const [typeSelected, setTypeSelected] = useState(null);
    const [optionSort, setOptionSort] = useState(false);
    //constant
    const { primary, zalert, success, warning, inactive } = colors
    const [destination,setDestination] = useState(null);

    //element init
    const { navigation } = props
    const { FullMap, currentLocation, getCurrentPosition, checkLocationPermission } = useMap();

    //element function
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [searchText, setSearchText] = useState('')
    const filterRequest = useCallback(() => requests.filter(eachRequest =>
        eachRequest.name.toLowerCase().includes(searchText.toLowerCase())
        && (typeSelected == null || eachRequest.type == typeSelected))
        .sort((a, b) => {
            if (optionSort) {
                const distanceA = distanceTwoGeo(currentLocation, a.type === 1 ? a.geo1 : a.geo2);
                const distanceB = distanceTwoGeo(currentLocation, b.type === 1 ? b.geo1 : b.geo2);
                if (distanceA < distanceB) 
                    return -1;
                else
                    return 1;
            }
            else {
                if (a.timestamp > b.timestamp)
                    return -1;
                else
                    return 1;
            }
        })
        , [searchText, typeSelected, requests, optionSort])


    useEffect(() => {
        console.log("__________Init listRequest__________");
        checkLocationPermission();
        getCurrentPosition();
    }, [])

    const inside = (currentLocation, destination, geo1 , geo2) => {
        const minLat = Math.min(currentLocation.latitude, destination.latitude);
        const maxLat = Math.max(currentLocation.latitude, destination.latitude);
        const minLong = Math.min(currentLocation.longitude, destination.longitude);
        const maxLong = Math.max(currentLocation.longitude, destination.longitude);
        return (
            geo1.latitude >= minLat &&
            geo1.latitude <= maxLat &&
            geo1.longitude >= minLong &&
            geo1.longitude <= maxLong &&
            geo2.latitude >= minLat &&
            geo2.latitude <= maxLat &&
            geo2.longitude >= minLong &&
            geo2.longitude <= maxLong &&
            distanceTwoGeo(geo1,currentLocation)<distanceTwoGeo(geo2,currentLocation)
        );
    };

    useEffect(() => {
        if (currentLocation,destination) {
            const dbRef = ref(firebaseDatabase, 'request')
            onValue(dbRef, async (snapshot) => {
                if (snapshot.exists()) {
                    console.log('Importing data to listRequest')
                    const userID = await getUserIDByTokken();
                    let snapshotObject = snapshot.val()
                    setRequests(Object.keys(snapshotObject)
                        .filter(k => snapshotObject[k].typeRequest === 1
                        && k.split('-')[0] != userID
                        && inside(currentLocation,destination,snapshotObject[k].geo1,snapshotObject[k].geo2)
                        )
                        .map(eachKey => {
                            let eachObject = snapshotObject[eachKey]
                            const time = new Date(eachObject.timestamp).toLocaleString();
                            return {
                                requestId: eachKey,
                                name: eachObject.title,
                                url: eachObject.photo,
                                status: eachObject.requestStatus,
                                price: eachObject.price,
                                type: eachObject.typeRequest,
                                des: eachObject.des,
                                geo1: eachObject.geo1,
                                geo2: eachObject.geo2,
                                direction: eachObject.direction,
                                accepted: userID == eachObject.requestStatus,
                                timestamp: eachObject.timestamp,
                                time: time,
                                mine: eachKey.split('-')[0] == userID,
                            }
                        }))
                } else {
                    console.log('No data available')
                }
            })
        }
    }, [currentLocation])

    //func render requests
    const renderNotRequest = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{
                    color: 'black',
                    fontSize: fontSizes.h2,
                    alignSelf: 'center',
                }}>
                    No Request found!
                </Text>
            </View>
        );
    };
    const renderRequestList = () => {
        return (
            <FlatList
                data={filterRequest()}
                renderItem={({ item }) => <RequestItem
                    onPress={() => {
                        const userID = item.requestId.split("-")[0];
                        handleTapRequest(item);
                    }}
                    screen="RequestList"
                    request={item}
                    currentLocation={currentLocation}
                />}
                keyExtractor={eachRequest => eachRequest.requestId}
            />
        );
    };

    const handleTapRequest = async (item) => {
        if (item.mine) {
            console.log("1");
            navigation.navigate("MyRequest", { request: item });
        }
        else {
            if (item.accepted) {
                console.log("2");
                navigation.navigate("RequestDetail", { request: item });
            }
            else {
                console.log("3");
                setSelectedRequest(item);
                setModalVisible(true);
            }
        }
    }

    const handleCloseRequest = () => {
        setModalVisible(false);
        setSelectedRequest(null);
    }

    const acceptRequest = async () => {
        if (selectedRequest) {
            const {
                requestId,
                status,
                geo1,
                geo2,
                type,
            } = selectedRequest;
            const userID = await getUserIDByTokken();
            if (status == 0) {
                if (currentLocation && userID) {
                    if (type === 2 || true) {
                        const origin = `${currentLocation.latitude.toFixed(6)},${currentLocation.longitude.toFixed(6)}`;
                        let destination = "";
                        let direction = null;
                        if (type === 1)
                            destination = `${geo1.latitude.toFixed(6)},${geo1.longitude.toFixed(6)}`;
                        if (type === 2)
                            destination = `${geo2.latitude.toFixed(6)},${geo2.longitude.toFixed(6)}`;
                        if (destination != "")
                            direction = await getDirections(origin, destination, currentLocation);
                        if (!direction) {
                            debugger
                            console.error("Get direction failed!");
                            return;
                        }
                        set(ref(firebaseDatabase, `direction/${userID}/${requestId}`), direction)
                            .then(async () => {
                                console.log("Direction update!.");
                                const userID = await getUserIDByTokken();
                                const requestRef = ref(firebaseDatabase, `request/${requestId}`);
                                update(requestRef, { requestStatus: userID })
                                    .then(() => {
                                        console.log("Accepted request! GOGOGO TIP!.");
                                    })
                                    .catch((error) => {
                                        console.error("Error updating request status: ", error);
                                    });
                            })
                            .catch((error) => {
                                console.error("Error updating direction: ", error);
                            });
                    }
                }
                else {
                    console.error("Current location is null!");
                }

            }
            else {
                alert("Request in process!");
            }
        }
        else {
            console.error("No request selected!");
        }
        setModalVisible(false);
        setSelectedRequest(null);
    }

    return currentLocation ? <View style={{
        backgroundColor: 'white',
        flex: 1
    }}>
        <View style={{ height: normalize(95) }}>
            <View style={{
                marginHorizontal: split.s4,
                marginVertical: split.s5,
            }}>
                <Text style={{
                    color: primary,
                    fontSize: normalize(18),
                    fontWeight: 'bold',
                    padding: 10,
                }}>Request List</Text>
            </View>
            <View style={{ height: 1, backgroundColor: primary }} />
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: split.s3,
                marginTop: split.s4,
            }}>
                <Icon name={"search"}
                    size={20}
                    color={'black'}
                    marginStart={5}
                    style={{
                        position: 'absolute'
                    }}
                />
                <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCorrect={false}
                    style={{
                        backgroundColor: colors.inactive,
                        flex: 1,
                        height: normalize(36),
                        borderRadius: 5,
                        opacity: 0.6,
                        color: "black",
                        paddingStart: 30
                    }}
                />
                <Icon name={"bars"}
                    size={30}
                    color={"black"}
                    marginStart={5}
                    onPress={()=>setOptionSort(!optionSort)}
                />
            </View>
        </View>
        <View style={{
            height: normalize(80),
            //backgroundColor:'purple'
        }}>
            <View style={{ height: 1, backgroundColor: primary }} />
            <FlatList
                data={categories}
                horizontal={true}
                renderItem={({ item }) => <Category
                    category={item}
                    onPress={() => {
                        if (item.value == 0) {
                            navigation.navigate("MyRequestList");
                        }
                        else {
                            setTypeSelected(item.value == typeSelected ? null : item.value);
                        }
                    }} />}
                style={{
                    flex: 1
                }} />
            <View style={{ height: 1, backgroundColor: primary }} />
        </View>
        <Modal visible={modalVisible} animationType="fade" transparent={true}  >
            <View style={{ flex: 1, justifyContent: 'center' }}>
                {modalVisible && selectedRequest && (
                    <View style={styles.container}>
                        <View style={{
                            flexDirection: 'row',
                            marginBottom: split.s4,
                        }}>
                            {selectedRequest.type == 2 && <Image
                                style={{
                                    width: normalize(130),
                                    height: normalize(130),
                                    resizeMode: 'cover',
                                    borderRadius: 15,
                                    marginRight: split.s3,
                                }}
                                source={{ uri: selectedRequest.url }}
                            />}
                            <View style={{
                                flex: 1,
                                //backgroundColor:'green',
                                marginRight: split.s3,
                            }}>
                                <Text style={{
                                    color: 'black',
                                    fontSize: fontSizes.h4,
                                    fontWeight: 'bold'
                                }}>{selectedRequest.name}</Text>
                                <View style={{ height: 1, backgroundColor: 'black' }} />
                                <Text style={{
                                    color: 'black',
                                    fontSize: fontSizes.h4,
                                }}>Price: {selectedRequest.price} vnd</Text>
                                <Text style={{
                                    color: 'black',
                                    fontSize: fontSizes.h4,
                                }}>Mô tả: {selectedRequest.des}</Text>
                                {selectedRequest.type == 1 && <View>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Distance: {selectedRequest.direction.distance.text}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Duration: {selectedRequest.direction.duration.text}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Từ: {selectedRequest.direction.startAddress}</Text>
                                    <Text style={{
                                        color: 'black',
                                        fontSize: fontSizes.h4,
                                    }}>Tới: {selectedRequest.direction.endAddress}</Text>
                                </View>}
                            </View>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'black' }} />
                        <FullMap
                            geo1={selectedRequest.geo1}
                            geo2={selectedRequest.geo2}
                            direction={selectedRequest.direction}
                            type={selectedRequest.type}
                            screen="ListRequest"
                        />
                    </View>
                )}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>
                    <CLButton title="Accept" sizeBT={"35%"} height={normalize(30)}
                        onPress={() => acceptRequest()} />
                    <CLButton title="Close Modal" sizeBT={"35%"} height={normalize(30)}
                        onPress={() => handleCloseRequest()} />
                </View>
            </View>
        </Modal>
        {filterRequest().length > 0 ? renderRequestList() : renderNotRequest()}
    </View> : <WaitingScreen />
}


const styles = StyleSheet.create({
    container: {
        height: normalize(340),
        width: "90%",
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignSelf: 'center',
        padding: split.s4,
        borderWidth: 1,
        borderColor: 'black',
    },
});
export default SmartCal