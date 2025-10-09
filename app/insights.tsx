import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  created_at: string;
}

interface SpendingData {
  need: number;
  want: number;
  goal: number;
  income: number;
}

interface MonthlyData {
  month: string;
  monthKey: string;
  income: number;
  expenses: number;
  savings: number;
}

export default function InsightsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const cardBgColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData>({
    need: 0,
    want: 0,
    goal: 0,
    income: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Load transactions
  useEffect(() => {
    loadTransactions();
  }, []);

  // Filter transactions by timeframe with useCallback
  const filterTransactionsByTimeframe = useCallback(() => {
    const now = new Date();
    let filtered = [...transactions];

    if (selectedTimeframe === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.created_at) >= oneWeekAgo);
    } else if (selectedTimeframe === 'month') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = filtered.filter(t => new Date(t.created_at) >= oneMonthAgo);
    } else if (selectedTimeframe === 'year') {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      filtered = filtered.filter(t => new Date(t.created_at) >= oneYearAgo);
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedTimeframe]);

  // Apply timeframe filtering
  useEffect(() => {
    if (transactions.length > 0) {
      filterTransactionsByTimeframe();
    }
  }, [transactions, selectedTimeframe, filterTransactionsByTimeframe]);

  // Calculate spending data with useCallback
  const calculateSpendingData = useCallback(() => {
    const data: SpendingData = {
      need: 0,
      want: 0,
      goal: 0,
      income: 0
    };

    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        data.income += transaction.amount;
      } else {
        data[transaction.category as keyof SpendingData] += transaction.amount;
      }
    });

    setSpendingData(data);
  }, [filteredTransactions]);

  // Calculate monthly data with useCallback
  const calculateMonthlyData = useCallback(() => {
    const monthlyGroups: { [key: string]: { transactions: Transaction[], monthKey: string } } = {};

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });

      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          transactions: [],
          monthKey: displayMonth
        };
      }
      monthlyGroups[monthKey].transactions.push(transaction);
    });

    const monthlyTotals: MonthlyData[] = Object.entries(monthlyGroups).map(([key, group]) => {
      const income = group.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = group.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: group.monthKey,
        monthKey: key,
        income,
        expenses,
        savings: income - expenses
      };
    });

    monthlyTotals.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    setMonthlyData(monthlyTotals.slice(-6));
  }, [filteredTransactions]);

  // Recalculate when filtered transactions change
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      calculateSpendingData();
      calculateMonthlyData();
    } else {
      setSpendingData({ need: 0, want: 0, goal: 0, income: 0 });
      setMonthlyData([]);
    }
  }, [filteredTransactions, calculateSpendingData, calculateMonthlyData]);

  const loadTransactions = async () => {
    try {
      const userId = 'demo-user-mvp-123';
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.log('Error loading transactions:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      need: 'Needs',
      want: 'Wants',
      goal: 'Goals',
      income: 'Income'
    };
    return names[category] || 'Other';
  };

  const getTotalExpenses = () => {
    return spendingData.need + spendingData.want + spendingData.goal;
  };

  const getSavingsRate = () => {
    if (spendingData.income === 0) return 0;
    return ((spendingData.income - getTotalExpenses()) / spendingData.income) * 100;
  };

  const getCategoryPercentage = (amount: number, total: number) => {
    if (total === 0) return 0;
    return (amount / total) * 100;
  };

  // Improved bar chart component
  const BarChart = ({ data, maxValue }: { data: MonthlyData[], maxValue: number }) => {
    const maxBarHeight = 120;
    const safeMaxValue = maxValue > 0 ? maxValue : 1;

    return (
      <View style={styles.barChart}>
        {data.map((month, index) => {
          const incomeHeight = (month.income / safeMaxValue) * maxBarHeight;
          const expensesHeight = (month.expenses / safeMaxValue) * maxBarHeight;

          return (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barContainer}>
                {month.income > 0 && (
                  <View 
                    style={[
                      styles.bar, 
                      styles.incomeBar,
                      { height: Math.max(incomeHeight, 2) }
                    ]} 
                  />
                )}
                {month.expenses > 0 && (
                  <View 
                    style={[
                      styles.bar, 
                      styles.expensesBar,
                      { height: Math.max(expensesHeight, 2) }
                    ]} 
                  />
                )}
                {month.income === 0 && month.expenses === 0 && (
                  <View style={[styles.bar, styles.emptyBar]} />
                )}
              </View>
              <Text style={[styles.monthLabel, { color: textColor }]} numberOfLines={1}>
                {month.month.split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Improved pie chart visualization
  const PieChart = ({ data }: { data: SpendingData }) => {
    const totalExpenses = getTotalExpenses();
    const size = 120;

    if (totalExpenses === 0) {
      return (
        <View style={[styles.pieChart, { width: size, height: size }]}>
          <View style={styles.noDataCircle}>
            <Text style={[styles.noDataText, { color: textColor }]}>No Data</Text>
          </View>
        </View>
      );
    }

    const categories = [
      { key: 'need', value: spendingData.need, color: '#3b82f6' },
      { key: 'want', value: spendingData.want, color: '#ef4444' },
      { key: 'goal', value: spendingData.goal, color: '#8b5cf6' },
    ].filter(cat => cat.value > 0);

    return (
      <View style={[styles.pieChart, { width: size, height: size }]}>
        <View style={styles.pieChartCenter}>
          <Text style={[styles.pieChartTotal, { color: textColor }]}>
            {formatAmount(totalExpenses)}
          </Text>
          <Text style={[styles.pieChartLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
            Total Expenses
          </Text>
        </View>
        
        <View style={styles.concentricCircles}>
          {categories.map((segment, index) => (
            <View
              key={segment.key}
              style={[
                styles.concentricCircle,
                {
                  backgroundColor: segment.color,
                  width: size * (0.2 + (index * 0.25)),
                  height: size * (0.2 + (index * 0.25)),
                  opacity: 0.7 - (index * 0.2)
                }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const timeframes = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' },
  ];

  const maxMonthlyValue = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol 
            size={24} 
            name="chevron.left" 
            color={textColor} 
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Financial Insights</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Timeframe Selector */}
        <View style={[styles.timeframeSelector, { backgroundColor: cardBgColor }]}>
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.id}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe.id && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe.id as any)}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe.id && styles.timeframeTextActive
              ]}>
                {timeframe.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.metricLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              Total Income
            </Text>
            <Text style={[styles.metricValue, { color: '#10b981' }]}>
              {formatAmount(spendingData.income)}
            </Text>
            <Text style={[styles.timeframeIndicator, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
              {selectedTimeframe}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.metricLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              Total Expenses
            </Text>
            <Text style={[styles.metricValue, { color: '#ef4444' }]}>
              {formatAmount(getTotalExpenses())}
            </Text>
            <Text style={[styles.timeframeIndicator, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
              {selectedTimeframe}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.metricLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              Savings Rate
            </Text>
            <Text style={[styles.metricValue, { color: getSavingsRate() >= 0 ? '#10b981' : '#ef4444' }]}>
              {getSavingsRate().toFixed(1)}%
            </Text>
            <Text style={[styles.timeframeIndicator, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
              {selectedTimeframe}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.metricLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              Net Flow
            </Text>
            <Text style={[styles.metricValue, { color: spendingData.income - getTotalExpenses() >= 0 ? '#10b981' : '#ef4444' }]}>
              {formatAmount(spendingData.income - getTotalExpenses())}
            </Text>
            <Text style={[styles.timeframeIndicator, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
              {selectedTimeframe}
            </Text>
          </View>
        </View>

        {/* Spending Breakdown */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <IconSymbol 
              size={24} 
              name="chart.pie.fill" 
              color={textColor} 
            />
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Spending Breakdown ({selectedTimeframe})
            </Text>
          </View>
          
          <View style={styles.breakdownContent}>
            <PieChart data={spendingData} />
            
            <View style={styles.breakdownLegend}>
              {['need', 'want', 'goal'].map((category) => {
                const amount = spendingData[category as keyof SpendingData];
                const percentage = getCategoryPercentage(amount, getTotalExpenses());
                
                if (amount === 0) return null;
                
                return (
                  <View key={category} style={styles.legendItem}>
                    <View style={[styles.colorDot, { backgroundColor: getCategoryColor(category) }]} />
                    <View style={styles.legendDetails}>
                      <Text style={[styles.legendLabel, { color: textColor }]}>
                        {getCategoryName(category)}
                      </Text>
                      <Text style={[styles.legendAmount, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                        {formatAmount(amount)} • {percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
              {getTotalExpenses() === 0 && (
                <Text style={[styles.noDataText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                  No expense data for {selectedTimeframe}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Monthly Trends */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <IconSymbol 
              size={24} 
              name="chart.bar.fill" 
              color={textColor} 
            />
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Monthly Trends
            </Text>
          </View>
          
          {monthlyData.length > 0 ? (
            <>
              <BarChart data={monthlyData} maxValue={maxMonthlyValue} />
              
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.colorDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[styles.legendLabel, { color: textColor }]}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.colorDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={[styles.legendLabel, { color: textColor }]}>Expenses</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.noDataText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                No monthly data available
              </Text>
            </View>
          )}
        </View>

        {/* Financial Insights */}
        <View style={[styles.card, { backgroundColor: cardBgColor }]}>
          <View style={styles.cardHeader}>
            <IconSymbol 
              size={24} 
              name="lightbulb.fill" 
              color={textColor} 
            />
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Financial Insights ({selectedTimeframe})
            </Text>
          </View>
          
          <View style={styles.insightsList}>
            {filteredTransactions.length === 0 ? (
              <Text style={[styles.noDataText, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                No transactions to analyze for {selectedTimeframe}
              </Text>
            ) : (
              <>
                {getSavingsRate() > 20 ? (
                  <View style={styles.insightItem}>
                    <IconSymbol size={20} name="checkmark.circle.fill" color="#10b981" />
                    <Text style={[styles.insightText, { color: textColor }]}>
                      Great job! Your savings rate is healthy at {getSavingsRate().toFixed(1)}%
                    </Text>
                  </View>
                ) : getSavingsRate() > 0 ? (
                  <View style={styles.insightItem}>
                    <IconSymbol size={20} name="exclamationmark.circle.fill" color="#f59e0b" />
                    <Text style={[styles.insightText, { color: textColor }]}>
                      Consider increasing your savings rate for better financial security
                    </Text>
                  </View>
                ) : (
                  <View style={styles.insightItem}>
                    <IconSymbol size={20} name="xmark.circle.fill" color="#ef4444" />
                    <Text style={[styles.insightText, { color: textColor }]}>
                      You&apos;re spending more than you earn. Review your expenses.
                    </Text>
                  </View>
                )}
                
                {getCategoryPercentage(spendingData.want, getTotalExpenses()) > 40 && getTotalExpenses() > 0 && (
                  <View style={styles.insightItem}>
                    <IconSymbol size={20} name="exclamationmark.circle.fill" color="#f59e0b" />
                    <Text style={[styles.insightText, { color: textColor }]}>
                      Your wants spending is high. Consider reducing discretionary expenses.
                    </Text>
                  </View>
                )}
                
                {monthlyData.length >= 2 && monthlyData[monthlyData.length - 1].savings > monthlyData[monthlyData.length - 2].savings && (
                  <View style={styles.insightItem}>
                    <IconSymbol size={20} name="checkmark.circle.fill" color="#10b981" />
                    <Text style={[styles.insightText, { color: textColor }]}>
                      Your savings improved this month! Keep it up.
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Timeframe Selector
  timeframeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeframeTextActive: {
    color: 'white',
  },
  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeframeIndicator: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  // Cards
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  // Pie Chart
  breakdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pieChartTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pieChartLabel: {
    fontSize: 10,
  },
  concentricCircles: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  concentricCircle: {
    borderRadius: 100,
    position: 'absolute',
  },
  noDataCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Bar Chart
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: 16,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    gap: 2,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  incomeBar: {
    backgroundColor: '#10b981',
  },
  expensesBar: {
    backgroundColor: '#ef4444',
  },
  emptyBar: {
    backgroundColor: '#f3f4f6',
    height: 2,
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyChart: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Legends
  breakdownLegend: {
    flex: 1,
    marginLeft: 20,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendDetails: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 12,
  },
  // Insights
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});