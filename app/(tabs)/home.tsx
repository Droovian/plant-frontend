import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

const Home = () => {
  return (
    <SafeAreaView style={styles.parentContainer}>
        <View>
            <Text style={styles.header}>Welcome to Home</Text>
        </View>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
    parentContainer:{
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header:{
        color: '#000000',
        fontSize: 30
    }
})