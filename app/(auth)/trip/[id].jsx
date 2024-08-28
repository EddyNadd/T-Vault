import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ShareTripModal from '../../../components/ShareTripModal';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const [openShare, setOpenShare] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={{ color: "white" }}>Details of user {id}</Text>
      <Button title="Go back" onPress={() => router.back()} />
      <Button title="Open Share Modal" onPress={() => setOpenShare(true)} />
      <ShareTripModal isOpen={openShare} onCancel={()=>setOpenShare(!openShare)} onConfirm={()=>setOpenShare(!openShare)} tripCode={id}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
