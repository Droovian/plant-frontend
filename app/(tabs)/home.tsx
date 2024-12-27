import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, TouchableOpacity } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

export default function Page() {
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