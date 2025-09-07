import React, { useState, useEffect } from 'react';
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
import { ArrowLeft } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';

type Choice = 'rock' | 'paper' | 'scissors';

const CHOICES: { value: Choice; emoji: string; label: string }[] = [
  { value: 'rock', emoji: '🪨', label: 'Rock' },
  { value: 'paper', emoji: '📄', label: 'Paper' },
  { value: 'scissors', emoji: '✂️', label: 'Scissors' },
];

export default function RockPaperScissorsGame() {
  const [myChoice, setMyChoice] = useState<Choice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'tie' | null>(null);
  
  const scaleAnim = new Animated.Value(1);
  
  const { gameState, updateGameState, endGame } = useGameStore();

  useEffect(() => {
    // Simulate opponent choice (in real app, this would come from the other player)
    if (myChoice && !opponentChoice) {
      const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].value;
      setTimeout(() => {
        setOpponentChoice(randomChoice);
        determineWinner(myChoice, randomChoice);
      }, 1000);
    }
  }, [myChoice]);

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animate countdown
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  };

  const makeChoice = (choice: Choice) => {
    setMyChoice(choice);
    setShowResult(false);
    startCountdown();
  };

  const determineWinner = (playerChoice: Choice, opponentChoice: Choice) => {
    let result: 'win' | 'lose' | 'tie';
    
    if (playerChoice === opponentChoice) {
      result = 'tie';
    } else if (
      (playerChoice === 'rock' && opponentChoice === 'scissors') ||
      (playerChoice === 'paper' && opponentChoice === 'rock') ||
      (playerChoice === 'scissors' && opponentChoice === 'paper')
    ) {
      result = 'win';
    } else {
      result = 'lose';
    }
    
    setRoundResult(result);
    setShowResult(true);
    
    // Update game state
    const newState = {
      ...gameState,
      round: gameState.round + 1,
      playerAScore: result === 'win' ? gameState.playerAScore + 1 : gameState.playerAScore,
      playerBScore: result === 'lose' ? gameState.playerBScore + 1 : gameState.playerBScore,
    };
    
    updateGameState(newState);
    
    // Check if game is over
    if (newState.round > newState.maxRounds || 
        newState.playerAScore >= 2 || 
        newState.playerBScore >= 2) {
      setTimeout(() => {
        const gameResult = {
          winner: newState.playerAScore > newState.playerBScore ? 'player' : 'opponent',
          finalScore: { player: newState.playerAScore, opponent: newState.playerBScore },
        };
        endGame(gameResult);
        
        Alert.alert(
          'Game Over!',
          `${gameResult.winner === 'player' ? 'You won!' : 'You lost!'} Final score: ${gameResult.finalScore.player} - ${gameResult.finalScore.opponent}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }, 2000);
    } else {
      // Reset for next round
      setTimeout(() => {
        setMyChoice(null);
        setOpponentChoice(null);
        setShowResult(false);
      }, 3000);
    }
  };

  const getChoiceEmoji = (choice: Choice | null) => {
    return CHOICES.find(c => c.value === choice)?.emoji || '❓';
  };

  const getResultText = () => {
    switch (roundResult) {
      case 'win': return 'You Win This Round! 🎉';
      case 'lose': return 'You Lose This Round 😔';
      case 'tie': return 'It\'s a Tie! 🤝';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Rock Paper Scissors</Text>
      </View>
      <View style={styles.gameContent}>
        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Round {gameState?.round || 1} of {gameState?.maxRounds || 3}
          </Text>
          <Text style={styles.scoreText}>
            You {gameState?.playerAScore || 0} - {gameState?.playerBScore || 0} Opponent
          </Text>
        </View>
        {/* Game Area */}
        <View style={styles.gameArea}>
          {isCountingDown ? (
            <Animated.View style={[styles.countdownContainer, { transform: [{ scale: scaleAnim }] }]}> 
              <Text style={styles.countdownText}>{countdown || 'GO!'}</Text>
            </Animated.View>
          ) : showResult ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{getResultText()}</Text>
              <View style={styles.choicesContainer}>
                <View style={styles.choiceResult}>
                  <Text style={styles.choiceLabel}>You</Text>
                  <Text style={styles.choiceEmoji}>{getChoiceEmoji(myChoice)}</Text>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={styles.choiceResult}>
                  <Text style={styles.choiceLabel}>Opponent</Text>
                  <Text style={styles.choiceEmoji}>{getChoiceEmoji(opponentChoice)}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                {myChoice ? 'Waiting for opponent...' : 'Choose your move!'}
              </Text>
            </View>
          )}
        </View>
        {/* Choice Buttons */}
        {!myChoice && !isCountingDown && (
          <View style={styles.choicesGrid}>
            {CHOICES.map((choice) => (
              <TouchableOpacity
                key={choice.value}
                style={styles.choiceButton}
                onPress={() => makeChoice(choice.value)}
              >
                <Text style={styles.choiceButtonEmoji}>{choice.emoji}</Text>
                <Text style={styles.choiceButtonLabel}>{choice.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  gameContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
  },
  choicesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  choiceResult: {
    alignItems: 'center',
  },
  choiceLabel: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
  },
  choiceEmoji: {
    fontSize: 64,
  },
  vs: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  instructionContainer: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
  },
  choicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  choiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: 100,
  },
  choiceButtonEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  choiceButtonLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});