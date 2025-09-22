import { View, Text } from 'react-native';

export default function TransactionsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Transactions Screen</Text>
      <Text>Your transaction history will appear here</Text>
    </View>
  );
}