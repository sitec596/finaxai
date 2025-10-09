import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal,
  RefreshControl
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

export default function TransactionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const cardBgColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Transactions', icon: 'list.bullet' },
    { id: 'need', name: 'Needs', icon: 'house.fill' },
    { id: 'want', name: 'Wants', icon: 'gamecontroller.fill' },
    { id: 'goal', name: 'Goals', icon: 'target' },
    { id: 'income', name: 'Income', icon: 'dollarsign.circle.fill' },
  ];

  // Filter transactions function with useCallback to prevent infinite re-renders
  const filterTransactions = useCallback(() => {
    let filtered = transactions;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toString().includes(searchQuery)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedCategory, searchQuery]);

  // Load transactions from Supabase
  useEffect(() => {
    loadTransactions();
  }, []);

  // Filter transactions when search or category changes
  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]); // Now filterTransactions is properly included

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionId);

              if (error) throw error;

              // Remove from local state
              setTransactions(transactions.filter(t => t.id !== transactionId));
              setShowActionModal(false);
              setSelectedTransaction(null);
              
              Alert.alert('Success', 'Transaction deleted successfully!');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };

  const formatAmount = (amount: number, type: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(type === 'income' ? amount : -amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      need: 'Need',
      want: 'Want',
      goal: 'Goal',
      income: 'Income'
    };
    return names[category] || 'Other';
  };

  const getTotalAmount = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);
  };

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
        <Text style={[styles.title, { color: textColor }]}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: cardBgColor }]}>
        <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
          Net Balance
        </Text>
        <Text style={[
          styles.summaryAmount,
          { color: getTotalAmount() >= 0 ? '#10b981' : '#ef4444' }
        ]}>
          {formatAmount(Math.abs(getTotalAmount()), getTotalAmount() >= 0 ? 'income' : 'expense')}
        </Text>
        <Text style={[styles.transactionCount, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
          {transactions.length} transactions total
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBgColor }]}>
        <IconSymbol 
          size={20} 
          name="magnifyingglass" 
          color={colorScheme === 'dark' ? '#999' : '#666'} 
        />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search transactions..."
          placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol 
              size={20} 
              name="xmark.circle.fill" 
              color={colorScheme === 'dark' ? '#999' : '#666'} 
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryFilterButton,
              { backgroundColor: cardBgColor },
              selectedCategory === category.id && styles.categoryFilterButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <IconSymbol 
              size={16} 
              name={category.icon as any} 
              color={selectedCategory === category.id ? '#3b82f6' : (colorScheme === 'dark' ? '#999' : '#666')} 
            />
            <Text style={[
              styles.categoryFilterText,
              { color: selectedCategory === category.id ? '#3b82f6' : (colorScheme === 'dark' ? '#999' : '#666') }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView 
        style={styles.transactionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              size={64} 
              name="doc.text" 
              color={colorScheme === 'dark' ? '#666' : '#CCC'} 
            />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              {transactions.length === 0 ? 'No Transactions Yet' : 'No Matching Transactions'}
            </Text>
            <Text style={[styles.emptyDescription, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              {transactions.length === 0 
                ? 'Your transactions will appear here once you start adding them.'
                : 'Try changing your search or filter criteria.'
              }
            </Text>
            {transactions.length === 0 && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.emptyButtonText}>Add Your First Transaction</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={[styles.transactionItem, { backgroundColor: cardBgColor }]}
              onPress={() => {
                setSelectedTransaction(transaction);
                setShowActionModal(true);
              }}
            >
              <View style={styles.transactionLeft}>
                <View 
                  style={[
                    styles.categoryIcon, 
                    { backgroundColor: getCategoryColor(transaction.category) }
                  ]}
                >
                  <IconSymbol 
                    size={16} 
                    name={getCategoryIcon(transaction.category) as any} 
                    color="#FFF" 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionDescription, { color: textColor }]}>
                    {transaction.description}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <Text style={[styles.transactionCategory, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                      {getCategoryName(transaction.category)}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
                      {formatDate(transaction.created_at)} • {formatTime(transaction.created_at)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text 
                style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? '#10b981' : '#ef4444' }
                ]}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowActionModal(false);
          setSelectedTransaction(null);
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Transaction Details</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowActionModal(false);
                setSelectedTransaction(null);
              }}
              style={styles.closeButton}
            >
              <IconSymbol 
                size={24} 
                name="xmark" 
                color={textColor} 
              />
            </TouchableOpacity>
          </View>

          {selectedTransaction && (
            <View style={styles.modalContent}>
              <View style={[styles.detailCard, { backgroundColor: cardBgColor }]}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    Description
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {selectedTransaction.description}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    Amount
                  </Text>
                  <Text 
                    style={[
                      styles.detailValue,
                      { color: selectedTransaction.type === 'income' ? '#10b981' : '#ef4444' }
                    ]}
                  >
                    {formatAmount(selectedTransaction.amount, selectedTransaction.type)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    Category
                  </Text>
                  <View style={styles.categoryBadge}>
                    <IconSymbol 
                      size={12} 
                      name={getCategoryIcon(selectedTransaction.category) as any} 
                      color="#FFF" 
                    />
                    <Text style={styles.categoryBadgeText}>
                      {getCategoryName(selectedTransaction.category)}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    Date & Time
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {formatDate(selectedTransaction.created_at)} at {formatTime(selectedTransaction.created_at)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    Type
                  </Text>
                  <Text style={[styles.detailValue, { color: textColor }]}>
                    {selectedTransaction.type === 'income' ? 'Income' : 'Expense'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteTransaction(selectedTransaction.id)}
              >
                <IconSymbol 
                  size={20} 
                  name="trash" 
                  color="#EF4444" 
                />
                <Text style={styles.deleteButtonText}>Delete Transaction</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
  // Summary Card
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionCount: {
    fontSize: 14,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  // Category Filter
  categoryFilter: {
    marginBottom: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryFilterButtonActive: {
    borderColor: '#3b82f6',
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Transactions List
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  // Modal
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});