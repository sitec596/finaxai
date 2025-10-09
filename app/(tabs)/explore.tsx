import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const cardBgColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  // Load recent transactions and goals
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = 'demo-user-mvp-123'; // Same demo user as Add Tab

      // Load last 5 transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Load goals (we'll create this table later)
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .limit(3);

      setRecentTransactions(transactions || []);
      setGoals(goalsData || []);
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  // Calculate spending summary
  const spendingSummary = {
    needs: recentTransactions.filter(t => t.category === 'need').reduce((sum, t) => sum + t.amount, 0),
    wants: recentTransactions.filter(t => t.category === 'want').reduce((sum, t) => sum + t.amount, 0),
    income: recentTransactions.filter(t => t.category === 'income').reduce((sum, t) => sum + t.amount, 0),
  };

  const sections = [
    {
      title: 'Transaction History',
      description: 'View your complete income and expense history',
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
      title: 'Spending Analytics',
      description: 'Detailed charts and insights',
      icon: 'chart.bar.fill',
      onPress: () => router.push('/insights'),
    },
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      need: 'house.fill',
      want: 'gamecontroller.fill',
      goal: 'target',
      income: 'dollarsign.circle.fill'
    };
    return icons[category] || 'questionmark.circle';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      need: '#3b82f6',
      want: '#ef4444', 
      goal: '#8b5cf6',
      income: '#10b981'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background }]}>
      <Text style={[styles.title, { color: textColor }]}>Explore</Text>
      <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
        Your financial dashboard
      </Text>

      <ScrollView style={styles.sectionsContainer} showsVerticalScrollIndicator={false}>
        
        {/* Recent Transactions Preview */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <IconSymbol 
              size={24} 
              name="clock.fill" 
              color={colorScheme === 'dark' ? '#FFF' : '#000'} 
            />
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={[styles.seeAllText, { color: '#3b82f6' }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              No transactions yet. Add your first transaction!
            </Text>
          ) : (
            recentTransactions.map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(transaction.category) }]}>
                    <IconSymbol 
                      size={16} 
                      name={getCategoryIcon(transaction.category) as any} 
                      color="#FFF" 
                    />
                  </View>
                  <View>
                    <Text style={[styles.transactionDescription, { color: textColor }]}>
                      {transaction.description}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text 
                  style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#10b981' : '#ef4444' }
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Goals Preview */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <IconSymbol 
              size={24} 
              name="target" 
              color={colorScheme === 'dark' ? '#FFF' : '#000'} 
            />
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Your Goals
            </Text>
            <TouchableOpacity onPress={() => router.push('/goals')}>
              <Text style={[styles.seeAllText, { color: '#3b82f6' }]}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          {goals.length === 0 ? (
            <View>
              <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                No goals set yet
              </Text>
              <TouchableOpacity 
                style={styles.addGoalButton}
                onPress={() => router.push('/goals')}
              >
                <Text style={styles.addGoalText}>Create Your First Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View>
                  <Text style={[styles.goalName, { color: textColor }]}>{goal.name}</Text>
                  <Text style={[styles.goalTarget, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    Target: {formatAmount(goal.target_amount)}
                  </Text>
                </View>
                <View style={styles.goalProgress}>
                  <Text style={styles.goalProgressText}>
                    {Math.round((goal.current_amount / goal.target_amount) * 100)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Spending Summary */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <IconSymbol 
              size={24} 
              name="chart.pie.fill" 
              color={colorScheme === 'dark' ? '#FFF' : '#000'} 
            />
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Spending Summary
            </Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                Income
              </Text>
              <Text style={[styles.summaryAmount, { color: '#10b981' }]}>
                {formatAmount(spendingSummary.income)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                Needs
              </Text>
              <Text style={[styles.summaryAmount, { color: '#3b82f6' }]}>
                {formatAmount(spendingSummary.needs)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                Wants
              </Text>
              <Text style={[styles.summaryAmount, { color: '#ef4444' }]}>
                {formatAmount(spendingSummary.wants)}
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Sections */}
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
              <IconSymbol 
                size={16} 
                name="chevron.right" 
                color={colorScheme === 'dark' ? '#999' : '#666'} 
              />
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
    marginBottom: 16,
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  // Transaction Styles
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Goal Styles
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  goalName: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalTarget: {
    fontSize: 12,
    marginTop: 2,
  },
  goalProgress: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  addGoalButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addGoalText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Summary Styles
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});