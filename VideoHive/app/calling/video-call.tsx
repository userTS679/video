import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  RotateCcw,
  Heart,
  Flag,
  Gamepad2,
  MessageCircle,
  Sparkles,
} from 'lucide-react-native';
import { useCallStore } from '@/store/callStore';
import { useGameStore } from '@/store/gameStore';
import { generateIcebreakers } from '@/lib/groq';
import { VideoCallView } from '@/components/VideoCallView';

export default function VideoCallScreen() {
  const videoCallRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showReady, setShowReady] = useState(true);
  const [bothReady, setBothReady] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [currentIcebreaker, setCurrentIcebreaker] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  const {
    currentCall,
    connectedUser,
    friendPressed,
    otherUserFriendPressed,
    endCall,
    pressFriend,
    reportUser,
    channelName,
    agoraToken,
  } = useCallStore();
  
  const { startGame, isGameActive, gameType } = useGameStore();

  useEffect(() => {
    // Load initial icebreaker
    loadIcebreaker();
    
    // Start call duration timer when connected
    let timer: NodeJS.Timeout;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUserJoined = (uid: number) => {
    setIsConnected(true);
    setBothReady(true);
    setShowReady(false);
  };

  const handleUserLeft = (uid: number) => {
    setIsConnected(false);
    Alert.alert(
      'User Left',
      'The other person has left the call.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const handleCallError = (error: any) => {
    Alert.alert(
      'Call Error',
      'There was an issue with the video call. Please try again.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const loadIcebreaker = async () => {
    // For now, use predefined college-friendly icebreakers
    const collegeIcebreakers = [
      "What's your major and what made you choose it? 📚",
      "If you could have any superpower during exams, what would it be? ⚡",
      "What's the most interesting class you've taken this semester? 🤔",
      "Coffee or tea to survive those late-night study sessions? ☕",
      "What's your go-to stress relief activity during finals? 😅",
      "If you could swap lives with any fictional character for a day, who would it be? 🎭",
      "What's your favorite campus spot to hang out? 🏫",
      "What song always gets you hyped up? 🎵"
    ];
    
    const randomIcebreaker = collegeIcebreakers[Math.floor(Math.random() * collegeIcebreakers.length)];
    setCurrentIcebreaker(randomIcebreaker);
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Call', 
          style: 'destructive',
          onPress: async () => {
            await endCall();
            router.replace('/(tabs)');
          }
        },
      ]
    );
  };

  const handleFriendPress = async () => {
    try {
      await pressFriend();
      Alert.alert(
        'Friendship vibes sent!',
        'If they feel the connection too, you will become friends and can keep chatting!'
      );
    } catch (error: any) {
      Alert.alert('Oops!', error.message || 'Failed to send friend request');
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      videoCallRef.current?.unmuteAudio();
    } else {
      videoCallRef.current?.muteAudio();
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (isVideoOff) {
      videoCallRef.current?.unmuteVideo();
    } else {
      videoCallRef.current?.muteVideo();
    }
    setIsVideoOff(!isVideoOff);
  };

  const handleStartGame = async (gameType: 'rock_paper_scissors' | 'trivia' | 'emoji_guess') => {
    if (!currentCall) return;
    
    try {
      await startGame(gameType, currentCall.id);
      setShowGameMenu(false);
      router.push(`/calling/games/${gameType}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start game');
    }
  };

  const handleReport = async (reason: string, description?: string) => {
    try {
      await reportUser(reason, description);
      Alert.alert('Report Submitted', 'Thank you for helping keep our community safe.');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit report');
    }
  };

  const renderReadyModal = () => (
    <Modal visible={showReady} transparent>
      <View style={styles.readyModalContainer}>
        <View style={styles.readyModal}>
          <Text style={styles.readyTitle}>Get Ready!</Text>
          <Text style={styles.readyText}>
            Your video will be blurred until both of you are ready
          </Text>
          
          <TouchableOpacity
            style={styles.readyButton}
            onPress={() => {
              setShowReady(false);
              setBothReady(true);
            }}
          >
            <Text style={styles.readyButtonText}>I'm Ready!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderGameMenu = () => (
    <Modal visible={showGameMenu} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.gameMenuContainer}>
        <View style={styles.gameMenuHeader}>
          <Text style={styles.gameMenuTitle}>Choose a Game</Text>
          <TouchableOpacity onPress={() => setShowGameMenu(false)}>
            <Text style={styles.gameMenuClose}>Close</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.gameMenuContent}>
          <TouchableOpacity
            style={styles.gameOption}
            onPress={() => handleStartGame('rock_paper_scissors')}
          >
            <Text style={styles.gameOptionTitle}>✂️ Rock Paper Scissors</Text>
            <Text style={styles.gameOptionDesc}>Classic game, best of 3 rounds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.gameOption}
            onPress={() => handleStartGame('trivia')}
          >
            <Text style={styles.gameOptionTitle}>🧠 Quick Trivia</Text>
            <Text style={styles.gameOptionDesc}>3 quick questions, test your knowledge</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.gameOption}
            onPress={() => handleStartGame('emoji_guess')}
          >
            <Text style={styles.gameOptionTitle}>😀 Emoji Guess</Text>
            <Text style={styles.gameOptionDesc}>Describe words using emojis</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderReportModal = () => (
    <Modal visible={showReport} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.reportModalContainer}>
        <View style={styles.reportModalHeader}>
          <Text style={styles.reportModalTitle}>Report User</Text>
          <TouchableOpacity onPress={() => setShowReport(false)}>
            <Text style={styles.reportModalClose}>Cancel</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.reportModalContent}>
          {[
            'Inappropriate behavior',
            'Harassment',
            'Spam',
            'Fake profile',
            'Underage',
            'Other',
          ].map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.reportOption}
              onPress={() => {
                setShowReport(false);
                handleReport(reason.toLowerCase().replace(' ', '_'));
              }}
            >
              <Text style={styles.reportOptionText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  if (!currentCall || !connectedUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Call not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Video Views */}
      <View style={styles.videoContainer}>
        {/* Remote Video (Main) */}
        <View style={[styles.remoteVideo, !bothReady && styles.blurredVideo]}>
          <Text style={styles.videoPlaceholder}>
            {connectedUser.display_name}'s video
            {!bothReady ? ' (Blurred)' : ''}
          </Text>
        </View>
        
        {/* Local Video (Small) */}
        <View style={[styles.localVideo, !bothReady && styles.blurredVideo]}>
          <Text style={styles.localVideoText}>
            You{!bothReady ? ' (Blurred)' : ''}
          </Text>
        </View>
      </View>

      {/* Icebreaker */}
      {currentIcebreaker && bothReady && (
        <View style={styles.icebreakerContainer}>
          <MessageCircle size={16} color="#8B5CF6" />
          <Text style={styles.icebreakerText}>{currentIcebreaker}</Text>
          <TouchableOpacity onPress={loadIcebreaker}>
            <RotateCcw size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.activeControl]}
          onPress={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff size={24} color="#ffffff" /> : <Mic size={24} color="#ffffff" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isVideoOff && styles.activeControl]}
          onPress={() => setIsVideoOff(!isVideoOff)}
        >
          {isVideoOff ? <VideoOff size={24} color="#ffffff" /> : <Video size={24} color="#ffffff" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <RotateCcw size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowGameMenu(true)}
        >
          <Gamepad2 size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.friendButton, friendPressed && styles.friendPressed]}
          onPress={handleFriendPress}
          disabled={friendPressed}
        >
          <Heart size={24} color="#ffffff" fill={friendPressed ? "#ffffff" : "none"} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.reportButton]}
          onPress={() => setShowReport(true)}
        >
          <Flag size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Phone size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {renderReadyModal()}
      {renderGameMenu()}
      {renderReportModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  blurredVideo: {
    opacity: 0.5,
  },
  videoPlaceholder: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  localVideoText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  icebreakerContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icebreakerText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeControl: {
    backgroundColor: '#ef4444',
  },
  friendButton: {
    backgroundColor: '#10b981',
  },
  friendPressed: {
    backgroundColor: '#059669',
  },
  reportButton: {
    backgroundColor: '#f59e0b',
  },
  endCallButton: {
    backgroundColor: '#ef4444',
  },
  readyModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  readyModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  readyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  readyButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  readyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  gameMenuContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gameMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  gameMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  gameMenuClose: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  gameMenuContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  gameOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
  },
  gameOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  gameOptionDesc: {
    fontSize: 14,
    color: '#666',
  },
  reportModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  reportModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reportModalClose: {
    fontSize: 16,
    color: '#666',
  },
  reportModalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  reportOption: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  reportOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginHorizontal: 32,
    marginTop: 32,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});