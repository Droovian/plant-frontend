import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, TouchableOpacity } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { useState, useEffect } from 'react'
import Push from '@/components/Push';

export default function Page() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation(){
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const { user } = useUser()
  const { signOut } = useAuth()

  const handleSignOut = () => {
     signOut();
     router.replace("/(auth)/sign-in");
  }

  return (
    <SafeAreaView className='flex-1 items-center justify-center'>
      <SignedIn>
        <Text className='text-2xl'>Hello {user?.emailAddresses[0].emailAddress}</Text>

        {/* <Push /> */}
        <TouchableOpacity onPress={() => router.push("/(root)/virtual-garden")}>
          <View className='my-5 bg-[#5B8E55] p-5 rounded-md'>
            <Text className='text-white text-xl'>Create your layout</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut}
        className="justify-center items-center w-20 h-10 rounded-full bg-red-700"
        >
          <Text className='text-white'>Sign out</Text>
        </TouchableOpacity>



       
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
    </SafeAreaView>
  )
}