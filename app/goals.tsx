import { View, Text } from 'react-native';

export default function GoalsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Goals Screen</Text>
      <Text>Your financial goals will appear here</Text>
    </View>
  );
}