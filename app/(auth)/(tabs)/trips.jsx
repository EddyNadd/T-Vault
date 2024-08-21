import { StyleSheet, Text, Button, View } from "react-native";
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

const trips = () => {
  const router = useRouter();
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E1E'}}>
      <Text style={{color: 'white'}}>MY TRIPS PAGE</Text>
      <Link href="/" asChild>
        <Button onPress={()=>router.back()} title="INDEX" />
      </Link>
    </View>
  )
}

export default trips