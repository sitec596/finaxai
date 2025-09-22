import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const cardBgColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';

  const sections = [
    {
      title: 'Transactions',
      description: 'View your income and expense history',
      icon: 'list.bullet',
      onPress: () => router.push('/transactions'),
    },
    {
      title: 'Financial Goals',
      description: 'Track your savings targets and progress',
      icon: 'target',
      onPress: () => router.push('/goals'),
    },
    {
      title: 'Insights & Analytics',
      description: 'Premium financial insights and trends',
      icon: 'chart.bar.fill',
      onPress: () => router.push('/insights'),
      premium: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background }]}>
      <Text style={[styles.title, { color: textColor }]}>Explore</Text>
      <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
        Manage your finances in one place
      </Text>

      <ScrollView style={styles.sectionsContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card, 
              { 
                backgroundColor: cardBgColor,
              }
            ]}
            onPress={section.onPress}
          >
            <View style={styles.cardHeader}>
              <IconSymbol 
                size={24} 
                name={section.icon as any} 
                color={colorScheme === 'dark' ? '#FFF' : '#000'} 
              />
              <Text style={[styles.cardTitle, { color: textColor }]}>
                {section.title}
              </Text>
              {section.premium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardDescription, { color: colorScheme === 'dark' ? '#CCC' : '#666' }]}>
              {section.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  sectionsContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
});