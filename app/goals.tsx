import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  created_at: string;
}

interface NewGoal {
  name: string;
  target_amount: string;
  deadline: string;
}

export default function GoalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const cardBgColor = colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF';
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoal>({
    name: '',
    target_amount: '',
    deadline: '',
  });

  // Load goals from Supabase
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const userId = 'demo-user-mvp-123';
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.log('Error loading goals:', error);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount) {
      Alert.alert('Error', 'Please fill in goal name and target amount');
      return;
    }

    const targetAmount = parseFloat(newGoal.target_amount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    try {
      const userId = 'demo-user-mvp-123';
      const { error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: userId,
            name: newGoal.name,
            target_amount: targetAmount,
            current_amount: 0,
            deadline: newGoal.deadline || null,
            category: 'savings'
          }
        ]);

      if (error) throw error;

      // Success
      setShowCreateModal(false);
      setNewGoal({ name: '', target_amount: '', deadline: '' });
      loadGoals(); // Reload goals
      Alert.alert('Success', 'Goal created successfully!');

    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const handleAddContribution = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount = goal.current_amount + amount;
      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      if (error) throw error;

      // Also create a transaction for this contribution
      const userId = 'demo-user-mvp-123';
      await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount: amount,
            category: 'goal',
            description: `Contribution to ${goal.name}`,
            type: 'expense'
          }
        ]);

      loadGoals(); // Reload goals
      Alert.alert('Success', `Added $${amount} to your goal!`);

    } catch (error) {
      console.error('Error adding contribution:', error);
      Alert.alert('Error', 'Failed to add contribution');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId);

              if (error) throw error;
              loadGoals(); // Reload goals
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal');
            }
          }
        }
      ]
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#10b981'; // Green
    if (percentage >= 75) return '#3b82f6';  // Blue
    if (percentage >= 50) return '#f59e0b';  // Yellow
    return '#ef4444'; // Red
  };

  const handleCustomContribution = (goalId: string) => {
    Alert.prompt(
      'Custom Contribution',
      'Enter amount to add:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: (amount: string | undefined) => {
            const numericAmount = parseFloat(amount || '0');
            if (numericAmount > 0) {
              handleAddContribution(goalId, numericAmount);
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const quickContributions = [10, 25, 50, 100, 200];

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
        <Text style={[styles.title, { color: textColor }]}>Financial Goals</Text>
        <TouchableOpacity 
          style={styles.createButton}
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
        
        {goals.length === 0 ? (
          // Empty State
          <View style={[styles.emptyState, { backgroundColor: cardBgColor }]}>
            <IconSymbol 
              size={64} 
              name="target" 
              color={colorScheme === 'dark' ? '#666' : '#CCC'} 
            />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No Goals Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
              Create your first savings goal to start tracking your progress
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create Your First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Goals List
          goals.map((goal) => {
            const progressPercentage = getProgressPercentage(goal.current_amount, goal.target_amount);
            const progressColor = getProgressColor(progressPercentage);
            
            return (
              <View key={goal.id} style={[styles.goalCard, { backgroundColor: cardBgColor }]}>
                {/* Goal Header */}
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalName, { color: textColor }]}>{goal.name}</Text>
                    <Text style={[styles.goalTarget, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                      Target: {formatAmount(goal.target_amount)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeleteGoal(goal.id)}
                    style={styles.deleteButton}
                  >
                    <IconSymbol 
                      size={16} 
                      name="trash" 
                      color={colorScheme === 'dark' ? '#999' : '#666'} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${progressPercentage}%`,
                          backgroundColor: progressColor
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, { color: textColor }]}>
                    {progressPercentage}%
                  </Text>
                </View>

                {/* Progress Details */}
                <View style={styles.progressDetails}>
                  <Text style={[styles.currentAmount, { color: textColor }]}>
                    {formatAmount(goal.current_amount)} saved
                  </Text>
                  <Text style={[styles.remainingAmount, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    {formatAmount(goal.target_amount - goal.current_amount)} to go
                  </Text>
                </View>

                {/* Quick Contributions */}
                <View style={styles.contributionSection}>
                  <Text style={[styles.contributionTitle, { color: colorScheme === 'dark' ? '#999' : '#666' }]}>
                    Quick Add:
                  </Text>
                  <View style={styles.contributionButtons}>
                    {quickContributions.map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={styles.contributionButton}
                        onPress={() => handleAddContribution(goal.id, amount)}
                      >
                        <Text style={styles.contributionText}>+${amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Custom Contribution */}
                <TouchableOpacity 
                  style={styles.customContributionButton}
                  onPress={() => handleCustomContribution(goal.id)}
                >
                  <Text style={[styles.customContributionText, { color: '#3b82f6' }]}>
                    + Custom Amount
                  </Text>
                </TouchableOpacity>

              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Create New Goal</Text>
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
              <Text style={[styles.inputLabel, { color: textColor }]}>Goal Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: cardBgColor,
                  color: textColor,
                  borderColor: colorScheme === 'dark' ? '#444' : '#DDD'
                }]}
                placeholder="e.g., New Laptop, Vacation, Emergency Fund"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={newGoal.name}
                onChangeText={(text) => setNewGoal({...newGoal, name: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Target Amount</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: cardBgColor,
                  color: textColor,
                  borderColor: colorScheme === 'dark' ? '#444' : '#DDD'
                }]}
                placeholder="e.g., 1000"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                keyboardType="numeric"
                value={newGoal.target_amount}
                onChangeText={(text) => setNewGoal({...newGoal, target_amount: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Deadline (Optional)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: cardBgColor,
                  color: textColor,
                  borderColor: colorScheme === 'dark' ? '#444' : '#DDD'
                }]}
                placeholder="e.g., 2024-12-31"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={newGoal.deadline}
                onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.createGoalButton,
                (!newGoal.name || !newGoal.target_amount) && styles.createGoalButtonDisabled
              ]}
              onPress={handleCreateGoal}
              disabled={!newGoal.name || !newGoal.target_amount}
            >
              <Text style={styles.createGoalButtonText}>Create Goal</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
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
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
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
  // Goal Card
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: 14,
  },
  // Contributions
  contributionSection: {
    marginBottom: 12,
  },
  contributionTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  contributionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contributionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contributionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  customContributionButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  customContributionText: {
    fontSize: 14,
    fontWeight: '500',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  createGoalButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createGoalButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  createGoalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});