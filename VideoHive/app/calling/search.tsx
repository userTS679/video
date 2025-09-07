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
  const [searchText, setSearchText] = useState('Searching for someone awesome...');
  const [dots, setDots] = useState('');
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
      'Searching for someone awesome...',
      'Finding your next connection...',
      'Looking for the perfect match...',
      'Discovering new friends...',
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % textOptions.length;
      setSearchText(textOptions[textIndex]);
    }, 3000);

    return () => {
      spinAnimation.stop();
      clearInterval(dotInterval);
      clearInterval(textInterval);
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
      'Cancel Search',
      'Are you sure you want to stop searching?',
      [
        { text: 'Keep Searching', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: () => {
            stopSearch();
            router.back();
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

          <View style={styles.tips}>
            <Text style={styles.tipTitle}>While you wait:</Text>
            <Text style={styles.tip}>• Make sure you're in a well-lit area</Text>
            <Text style={styles.tip}>• Check your internet connection</Text>
            <Text style={styles.tip}>• Think of interesting conversation starters</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
  },
  tips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  tip: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 20,
  },
});