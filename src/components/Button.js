import React, { Component } from 'react'
import { TouchableOpacity, Text, Image} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import {colors, fontSizes, images} from '../constants'
import {normalize,split} from '../constants'

const UIButton = (props) =>{
    const {onPress,title,isSelected,color,value} = props
    return <TouchableOpacity
        onPress={onPress}
        style={{
            borderColor: 'black',
            borderWidth: 1,
            height: 45,
            borderRadius: 10,
            marginHorizontal: 17,
            marginVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isSelected == true ? 'white' : color,
            flexDirection:'row'
        }}>
        {
            isSelected == true &&
            <Icon name="check-circle"
                size={18}
                style={{
                    color: 'green',
                    position: 'absolute',
                    left: 10,
                }}
            />
        }
        <Image
            source={value == 1 ? images.fagUSA : value == 2 ? images.fagVN : images.fagJP}
            style={{
                height: normalize(30),
                width: normalize(30),
                marginEnd: 5,
            }} />
        <Text style={{
            color: isSelected == true ? colors.primary : 'black',
            fontWeight: '500'
        }}>{title}</Text>
    </TouchableOpacity>
}
const CLButton = (props) =>{
    const {onPress,title,colorBG,colorBD,colorT,sizeF,sizeBT,sizeB,radius,disabled,height} = props
    return <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={{
            borderColor: colorBD,
            borderWidth: sizeB? sizeB: 1,
            height: height? height: 45,
            width: sizeBT? sizeBT: '90%',
            borderRadius: radius?radius:30,
            marginHorizontal: 14,
            marginVertical: 8,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: colorBG? colorBG:"white"
        }}>
        <Text style={{
            fontSize: sizeF?sizeF:fontSizes.h3,
            color: colorT?colorT:'black',
        }}>{title? title: 'abc'}</Text>
    </TouchableOpacity>
}

export{
    UIButton,
    CLButton
} 
