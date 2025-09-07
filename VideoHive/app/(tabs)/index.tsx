import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Video, Filter, Zap, Users } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useCallStore } from '@/store/callStore';
import { supabase } from '@/lib/supabase';

const INTERESTS = [
  'Music', 'Gaming', 'Movies', 'Sports', 'Art', 'Travel',
  'Food', 'Books', 'Technology', 'Photography',
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'All'];

export default function HomeScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(['All']);
  const [ageRange, setAgeRange] = useState([18, 30]);
  
  const { user } = useAuthStore();
  const { startSearch, isSearching, stopSearch } = useCallStore();

  useEffect(() => {
    // Initialize matchmaking logic - create a simple matching system
    initializeMatchmaking();
  }, []);

  const initializeMatchmaking = async () => {
    // Set up real-time subscription for matchmaking
    const channel = supabase.channel('matchmaking')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matchmaking_queue'
      }, handleNewQueueEntry)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNewQueueEntry = async (payload: any) => {
    if (!user) return;
    
    const newEntry = payload.new;
    if (newEntry.user_id === user.id) return; // Skip own entries

    // Simple matching logic - in production, this would be more sophisticated
    const { data: existingEntries } = await supabase
      .from('matchmaking_queue')
      .select('*')
      .neq('user_id', newEntry.user_id);

    if (existingEntries && existingEntries.length > 0) {
      // Found a match! Create a call
      const otherEntry = existingEntries[0];
      await createCall(user.id, otherEntry.user_id);
      
      // Clean up queue entries
      await supabase
        .from('matchmaking_queue')
        .delete()
        .in('user_id', [user.id, otherEntry.user_id]);
    }
  };

  const createCall = async (callerId: string, calleeId: string) => {
    try {
      const channelName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: call, error } = await supabase
        .from('calls')
        .insert({
          caller_id: callerId,
          callee_id: calleeId,
          channel_name: channelName,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;

      // Notify both users (in a real app, use push notifications)
      console.log('Call created:', call);
    } catch (error) {
      console.error('Error creating call:', error);
    }
  };

  const handleStartCall = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    try {
      const filters = {
        interests: selectedInterests,
        genders: selectedGenders,
        ageRange,
      };

      await startSearch(filters);
      router.push('/calling/search');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start searching');
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const toggleGender = (gender: string) => {
    if (gender === 'All') {
      setSelectedGenders(['All']);
    } else {
      const newGenders = selectedGenders.filter(g => g !== 'All');
      if (selectedGenders.includes(gender)) {
        const filtered = newGenders.filter(g => g !== gender);
        setSelectedGenders(filtered.length === 0 ? ['All'] : filtered);
      } else {
        setSelectedGenders([...newGenders, gender]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hey {user?.display_name || 'there'}! 👋
          </Text>
          <Text style={styles.subtitle}>Ready to meet someone new?</Text>
        </View>

        {/* Main Call Button */}
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleStartCall}
          disabled={isSearching}
        >
          <View style={styles.callButtonContent}>
            <Video size={32} color="#ffffff" />
            <Text style={styles.callButtonText}>
              {isSearching ? 'Searching...' : 'Start Video Call'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#8B5CF6" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/friends')}
          >
            <Users size={20} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Zap size={24} color="#10b981" />
            <Text style={styles.statNumber}>1.2k</Text>
            <Text style={styles.statLabel}>Online Now</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>50k+</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </View>

        {/* Community Rooms (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Interests</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.interestTags}>
              {INTERESTS.slice(0, 5).map((interest) => (
                <View key={interest} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Interests</Text>
              <View style={styles.filterOptions}>
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.filterChip,
                      selectedInterests.includes(interest) && styles.selectedChip,
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedInterests.includes(interest) && styles.selectedChipText,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Gender Preference</Text>
              <View style={styles.filterOptions}>
                {GENDERS.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.filterChip,
                      selectedGenders.includes(gender) && styles.selectedChip,
                    ]}
                    onPress={() => toggleGender(gender)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedGenders.includes(gender) && styles.selectedChipText,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Age Range</Text>
              <Text style={styles.ageRangeText}>
                {ageRange[0]} - {ageRange[1]} years
              </Text>
              {/* TODO: Add slider component for age range */}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D1B69',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B46C1',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 32,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  callButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 32,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D1B69',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D1B69',
    marginBottom: 16,
  },
  interestTags: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  interestTag: {
    backgroundColor: '#FFE066',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FFE066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  interestTagText: {
    color: '#2D1B69',
    fontSize: 14,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalDone: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  filterSection: {
    marginVertical: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#ffffff',
  },
  ageRangeText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
});