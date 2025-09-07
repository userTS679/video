import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { X, Loader } from 'lucide-react-native';
import { useCallStore } from '@/store/callStore';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('Finding your perfect study buddy...');
  const [dots, setDots] = useState('');
  const [searchTime, setSearchTime] = useState(0);
  const spinValue = new Animated.Value(0);
  
  const { isSearching, stopSearch, currentCall } = useCallStore();

  useEffect(() => {
    // Animate the loading spinner
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Animate the dots
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Change search text periodically
    const textOptions = [
      'Finding your perfect study buddy... 📚',
      'Looking for your coffee chat partner... ☕',
      'Discovering your next best friend... 🤝',
      'Finding someone with your vibe... ✨',
      'Connecting you with fellow students... 🎆',
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % textOptions.length;
      setSearchText(textOptions[textIndex]);
    }, 3000);

    // Timer for search duration
    const timer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    // Simulate finding a match after some time
    const matchTimeout = setTimeout(() => {
      router.replace('/calling/video-call');
    }, Math.random() * 8000 + 7000); // 7-15 seconds

    return () => {
      spinAnimation.stop();
      clearInterval(dotInterval);
      clearInterval(textInterval);
      clearInterval(timer);
      clearTimeout(matchTimeout);
    };
  }, []);

  useEffect(() => {
    // Navigate to call screen when a call is found
    if (currentCall) {
      router.replace('/calling/video-call');
    }
  }, [currentCall]);

  const handleCancel = () => {
    Alert.alert(
      'Stop Looking? 😢',
      'Are you sure you want to cancel your search for awesome people?',
      [
        { text: 'Keep Looking! 🚀', style: 'cancel' },
        { 
          text: 'Stop Search', 
          style: 'destructive',
          onPress: () => {
            stopSearch();
            router.replace('/(tabs)');
          }
        },
      ]
    );
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <X size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.searchContent}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <Loader size={48} color="#ffffff" />
          </Animated.View>
          
          <Text style={styles.searchText}>
            {searchText}{dots}
          </Text>
          
          <Text style={styles.subtitle}>
            We're finding someone who shares your interests
          </Text>

          <Text style={styles.timer}>🕰️ {Math.floor(searchTime / 60).toString().padStart(2, '0')}:{(searchTime % 60).toString().padStart(2, '0')}</Text>

          <View style={styles.tips}>
            <Text style={styles.tipTitle}>💡 Pro Tips While You Wait:</Text>
            <Text style={styles.tip}>• Make sure you're in a well-lit area 💡</Text>
            <Text style={styles.tip}>• Check your internet connection 📶</Text>
            <Text style={styles.tip}>• Think of interesting conversation starters 💬</Text>
            <Text style={styles.tip}>• Be yourself and have fun! 😊</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B46C1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  spinner: {
    marginBottom: 32,
  },
  searchText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  tips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFE066',
    textAlign: 'center',
    marginBottom: 32,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tip: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
});