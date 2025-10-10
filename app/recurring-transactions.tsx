import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { 
  recurringTransactionsService, 
  RecurringTransaction, 
  CreateRecurringTransactionFormData
} from '@/lib/recurringTransactions';

export default function RecurringTransactionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const cardBgColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [dueTransactions, setDueTransactions] = useState<RecurringTransaction[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [newTransaction, setNewTransaction] = useState<CreateRecurringTransactionFormData>({
    name: '',
    amount: '',
    category: 'need',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Load recurring transactions
  useEffect(() => {
    loadRecurringTransactions();
  }, []);

  const loadRecurringTransactions = async () => {
    try {
      const userId = 'demo-user-mvp-123';
      const transactions = await recurringTransactionsService.getRecurringTransactions(userId);
      const due = await recurringTransactionsService.getDueRecurringTransactions(userId);
      
      setRecurringTransactions(transactions);
      setDueTransactions(due);
    } catch (error) {
      console.error('Error loading recurring transactions:', error);
      Alert.alert('Error', 'Failed to load recurring transactions');
    }
  };

  const handleCreateRecurringTransaction = async () => {
    if (!newTransaction.name || !newTransaction.amount) {
      Alert.alert('Error', 'Please fill in name and amount');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newTransaction.start_date)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    // Validate category and frequency
    const validCategories = ['need', 'want', 'goal', 'income'];
    const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
    
    if (!validCategories.includes(newTransaction.category)) {
      Alert.alert('Error', 'Please select a valid category');
      return;
    }

    if (!validFrequencies.includes(newTransaction.frequency)) {
      Alert.alert('Error', 'Please select a valid frequency');
      return;
    }

    setLoading(true);
    try {
      const userId = 'demo-user-mvp-123';
      
      // Convert form data to database data
      const dbData = {
        ...newTransaction,
        amount: amount
      };
      
      await recurringTransactionsService.createRecurringTransaction(userId, dbData);

      setShowCreateModal(false);
      setNewTransaction({
        name: '',
        amount: '',
        category: 'need',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      loadRecurringTransactions();
      Alert.alert('Success', 'Recurring transaction created!');
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      Alert.alert('Error', 'Failed to create recurring transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (recurringTransaction: RecurringTransaction) => {
    setActionLoading(recurringTransaction.id);
    try {
      await recurringTransactionsService.createTransactionFromRecurring(recurringTransaction);
      loadRecurringTransactions();
      Alert.alert('Success', 'Transaction created from template!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create transaction');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRecurringTransaction = (id: string) => {
    Alert.alert(
      'Delete Recurring Transaction',
      'Are you sure you want to delete this recurring transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(id);
            try {
              await recurringTransactionsService.deleteRecurringTransaction(id);
              loadRecurringTransactions();
            } catch (error) {
              console.error('Error deleting recurring transaction:', error);
              Alert.alert('Error', 'Failed to delete recurring transaction');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setActionLoading(id);
    try {
      await recurringTransactionsService.toggleRecurringTransaction(id, !isActive);
      loadRecurringTransactions();
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
      Alert.alert('Error', 'Failed to update recurring transaction');
    } finally {
      setActionLoading(null);
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
      need: 'Need',
      want: 'Want',
      goal: 'Goal',
      income: 'Income'
    };
    return names[category] || 'Other';
  };

  const getFrequencyText = (frequency: string) => {
    const texts: { [key: string]: string } = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return texts[frequency] || frequency;
  };

  const categories = [
    { id: 'need', name: 'Need', icon: 'house.fill' },
    { id: 'want', name: 'Want', icon: 'gamecontroller.fill' },
    { id: 'goal', name: 'Goal', icon: 'target' },
    { id: 'income', name: 'Income', icon: 'dollarsign.circle.fill' },
  ];

  const frequencies = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'yearly', name: 'Yearly' },
  ];

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
        <Text style={[styles.title, { color: textColor }]}>Recurring</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <IconSymbol 
            size={20} 
            name="plus" 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Due Transactions */}
        {dueTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Due Transactions
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              Tap to create transactions
            </Text>
            
            {dueTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={[styles.dueCard, { backgroundColor: cardBgColor }]}
                onPress={() => handleCreateTransaction(transaction)}
                disabled={actionLoading === transaction.id}
              >
                <View style={styles.dueCardContent}>
                  <View style={styles.dueCardLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(transaction.category) }]}>
                      <IconSymbol 
                        size={16} 
                        name={transaction.category === 'income' ? 'dollarsign.circle.fill' : 
                              transaction.category === 'goal' ? 'target' : 
                              transaction.category === 'want' ? 'gamecontroller.fill' : 'house.fill'} 
                        color="#FFF" 
                      />
                    </View>
                    <View style={styles.dueCardTextContainer}>
                      <Text style={[styles.transactionName, { color: textColor }]}>
                        {transaction.name}
                      </Text>
                      <Text style={[styles.transactionDetails, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                        {getFrequencyText(transaction.frequency)} • {getCategoryName(transaction.category)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.dueCardRight}>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'income' ? '#10b981' : '#ef4444' }
                    ]}>
                      {formatAmount(transaction.amount)}
                    </Text>
                    {actionLoading === transaction.id ? (
                      <ActivityIndicator size="small" color={transaction.type === 'income' ? '#10b981' : '#ef4444'} />
                    ) : (
                      <IconSymbol 
                        size={20} 
                        name="plus.circle.fill" 
                        color={transaction.type === 'income' ? '#10b981' : '#ef4444'} 
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* All Recurring Transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            All Recurring Transactions
          </Text>
          
          {recurringTransactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBgColor }]}>
              <IconSymbol 
                size={48} 
                name="repeat" 
                color={colorScheme === 'dark' ? '#666' : '#CCC'} 
              />
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                No Recurring Transactions
              </Text>
              <Text style={[styles.emptyDescription, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                Create your first recurring transaction to automate your finances
              </Text>
            </View>
          ) : (
            recurringTransactions.map((transaction) => (
              <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: cardBgColor }]}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(transaction.category) }]}>
                      <IconSymbol 
                        size={16} 
                        name={transaction.category === 'income' ? 'dollarsign.circle.fill' : 
                              transaction.category === 'goal' ? 'target' : 
                              transaction.category === 'want' ? 'gamecontroller.fill' : 'house.fill'} 
                        color="#FFF" 
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionName, { color: textColor }]}>
                        {transaction.name}
                      </Text>
                      <Text style={[styles.transactionDetails, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                        {getFrequencyText(transaction.frequency)} • {getCategoryName(transaction.category)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#10b981' : '#ef4444' }
                  ]}>
                    {formatAmount(transaction.amount)}
                  </Text>
                </View>
                
                <View style={styles.transactionActions}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      transaction.is_active ? styles.disableButton : styles.enableButton
                    ]}
                    onPress={() => handleToggleActive(transaction.id, transaction.is_active)}
                    disabled={actionLoading === transaction.id}
                  >
                    {actionLoading === transaction.id ? (
                      <ActivityIndicator size="small" color="#6b7280" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {transaction.is_active ? 'Disable' : 'Enable'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.createActionButton]}
                    onPress={() => handleCreateTransaction(transaction)}
                    disabled={actionLoading === transaction.id}
                  >
                    {actionLoading === transaction.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.actionButtonText}>Create Now</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteRecurringTransaction(transaction.id)}
                    disabled={actionLoading === transaction.id}
                  >
                    {actionLoading === transaction.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <IconSymbol 
                        size={16} 
                        name="trash" 
                        color="#EF4444" 
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>New Recurring Transaction</Text>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)}
              style={styles.closeButton}
            >
              <IconSymbol 
                size={24} 
                name="xmark" 
                color={textColor} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: cardBgColor,
                  color: textColor,
                  borderColor: colorScheme === 'dark' ? '#444' : '#DDD'
                }]}
                placeholder="e.g., Rent, Netflix, Salary"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={newTransaction.name}
                onChangeText={(text) => setNewTransaction({...newTransaction, name: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Amount</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: cardBgColor,
                  color: textColor,
                  borderColor: colorScheme === 'dark' ? '#444' : '#DDD'
                }]}
                placeholder="0.00"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                keyboardType="numeric"
                value={newTransaction.amount}
                onChangeText={(text) => setNewTransaction({...newTransaction, amount: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: cardBgColor, marginRight: index % 2 === 0 ? 8 : 0 },
                      newTransaction.category === category.id && styles.categoryOptionSelected
                    ]}
                    onPress={() => setNewTransaction({...newTransaction, category: category.id})}
                  >
                    <IconSymbol 
                      size={20} 
                      name={category.icon as any} 
                      color={newTransaction.category === category.id ? getCategoryColor(category.id) : (colorScheme === 'dark' ? '#999' : '#666')} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      { color: newTransaction.category === category.id ? getCategoryColor(category.id) : (colorScheme === 'dark' ? '#999' : '#666') }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {frequencies.map((frequency, index) => (
                  <TouchableOpacity
                    key={frequency.id}
                    style={[
                      styles.frequencyOption,
                      { backgroundColor: cardBgColor, marginRight: index % 2 === 0 ? 8 : 0 },
                      newTransaction.frequency === frequency.id && styles.frequencyOptionSelected
                    ]}
                    onPress={() => setNewTransaction({...newTransaction, frequency: frequency.id as any})}
                  >
                    <Text style={[
                      styles.frequencyOptionText,
                      { color: newTransaction.frequency === frequency.id ? '#3b82f6' : (colorScheme === 'dark' ? '#999' : '#666') }
                    ]}>
                      {frequency.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Start Date</Text>
              <Text style={[styles.inputHelp, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                Format: YYYY-MM-DD (e.g., {new Date().toISOString().split('T')[0]})
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: cardBgColor,
                  color: textColor,
                  borderColor: colorScheme === 'dark' ? '#444' : '#DDD'
                }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={newTransaction.start_date}
                onChangeText={(text) => setNewTransaction({...newTransaction, start_date: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: cardBgColor,
                  color: textColor,
                  borderColor: colorScheme === 'dark' ? '#444' : '#DDD'
                }]}
                placeholder="Additional details"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={newTransaction.description}
                onChangeText={(text) => setNewTransaction({...newTransaction, description: text})}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.createRecurringButton,
                (!newTransaction.name || !newTransaction.amount) && styles.createRecurringButtonDisabled
              ]}
              onPress={handleCreateRecurringTransaction}
              disabled={!newTransaction.name || !newTransaction.amount || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.createRecurringButtonText}>
                  Create Recurring Transaction
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
  addButton: {
    backgroundColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  dueCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dueCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dueCardTextContainer: {
    marginLeft: 12,
  },
  dueCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  disableButton: {
    backgroundColor: '#fef3c7',
  },
  enableButton: {
    backgroundColor: '#d1fae5',
  },
  createActionButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    flex: 0.5,
    marginRight: 0,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputHelp: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryOption: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  categoryOptionSelected: {
    borderColor: '#3b82f6',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  frequencyOption: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  frequencyOptionSelected: {
    borderColor: '#3b82f6',
  },
  frequencyOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  createRecurringButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createRecurringButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  createRecurringButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});