import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Users, MessageCircle, UserPlus } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { supabase, Friendship, User } from '@/lib/supabase';

interface FriendItem extends User {
  friendship_created_at: string;
}

export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    loadFriends();
  }, [user]);

  const loadFriends = async (refresh = false) => {
    if (!user) return;
    
    if (!refresh) setIsLoading(true);
    if (refresh) setIsRefreshing(true);
    
    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user_a:users!friendships_user_a_id_fkey(*),
          user_b:users!friendships_user_b_id_fkey(*)
        `)
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extract friend profiles (the user who is NOT the current user)
      const friendProfiles: FriendItem[] = friendships?.map(friendship => {
        const friend = friendship.user_a_id === user.id 
          ? friendship.user_b 
          : friendship.user_a;
        
        return {
          ...friend,
          friendship_created_at: friendship.created_at,
        };
      }) || [];

      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleChatWithFriend = async (friend: FriendItem) => {
    if (!user) return;
    
    try {
      // Check if conversation exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user_a_id.eq.${user.id},user_b_id.eq.${friend.id}),and(user_a_id.eq.${friend.id},user_b_id.eq.${user.id})`)
        .single();

      if (existingConversation) {
        router.push(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user_a_id: Math.min(user.id, friend.id) === user.id ? user.id : friend.id,
            user_b_id: Math.max(user.id, friend.id) === user.id ? user.id : friend.id,
          })
          .select()
          .single();

        if (error) throw error;
        
        router.push(`/chat/${newConversation.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderFriendItem = ({ item: friend }: { item: FriendItem }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {friend.display_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.display_name}</Text>
        {friend.bio && <Text style={styles.friendBio}>{friend.bio}</Text>}
        <Text style={styles.friendDate}>
          Friends since {new Date(friend.friendship_created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => handleChatWithFriend(friend)}
      >
        <MessageCircle size={20} color="#8B5CF6" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UserPlus size={64} color="#cccccc" />
      <Text style={styles.emptyStateTitle}>No friends yet</Text>
      <Text style={styles.emptyStateText}>
        Start video calls and press the heart button when you meet someone you'd like to be friends with!
      </Text>
      <TouchableOpacity
        style={styles.startCallButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.startCallButtonText}>Start Video Call</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>
          {friends.length} friend{friends.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          friends.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadFriends(true)}
            tintColor="#8B5CF6"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  friendAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  friendBio: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  friendDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 24,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  startCallButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startCallButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});