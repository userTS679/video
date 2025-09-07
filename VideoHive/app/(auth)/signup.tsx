import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronDown, Calendar, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

const COLLEGES = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'BITS Pilani', 'NSIT Delhi',
  'DTU Delhi', 'VIT Vellore', 'Manipal University', 'SRM University',
  'Amity University', 'Lovely Professional University', 'Other'
];

const INTERESTS = [
  '🎮 Gaming', '🎵 Music', '🎬 Movies', '⚽ Sports', '🎨 Art', '✈️ Travel',
  '📚 Reading', '💻 Tech', '📸 Photography', '🍕 Food', '🏃 Fitness', '🎭 Theater'
];

export default function SignUpScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [showCollegePicker, setShowCollegePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuthStore();

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Oops! 😅', 'Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch 🔒', 'Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password 💪', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      Alert.alert('Almost there! 🎯', 'Please fill in all your details');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!college || !year || selectedInterests.length === 0) {
      Alert.alert('Last step! 🏁', 'Please complete your profile');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      handleSignUp();
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    
    try {
      await signUp(email, password);
      // Additional profile data will be saved after successful signup
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Signup Failed 😔', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests(prev => [...prev, interest]);
    } else {
      Alert.alert('Interest Limit 🎯', 'You can select up to 5 interests');
    }
  };

  const renderStep1 = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 1 of 3</Text>
        <Text style={styles.title}>Let's get started! 🚀</Text>
        <Text style={styles.subtitle}>Create your account credentials</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📧 Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@college.edu"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🔒 Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a strong password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoComplete="new-password"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🔐 Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoComplete="new-password"
          />
        </View>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 2 of 3</Text>
        <Text style={styles.title}>Tell us about yourself! 😊</Text>
        <Text style={styles.subtitle}>We'll help you connect with the right people</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>👤 First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>👤 Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🎂 Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>⚧ Gender</Text>
          <View style={styles.genderContainer}>
            {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.genderOption, gender === option && styles.selectedGender]}
                onPress={() => setGender(option)}
              >
                <Text style={[styles.genderText, gender === option && styles.selectedGenderText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 3 of 3</Text>
        <Text style={styles.title}>Almost done! 🎉</Text>
        <Text style={styles.subtitle}>Let's complete your college profile</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>🏫 College/University</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCollegePicker(true)}
          >
            <Text style={[styles.pickerText, !college && styles.placeholderText]}>
              {college || 'Select your college'}
            </Text>
            <ChevronDown size={20} color="#6B46C1" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>📚 Year of Study</Text>
          <View style={styles.yearContainer}>
            {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.yearOption, year === option && styles.selectedYear]}
                onPress={() => setYear(option)}
              >
                <Text style={[styles.yearText, year === option && styles.selectedYearText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🎯 Interests (select up to 5)</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  selectedInterests.includes(interest) && styles.selectedInterest
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.selectedInterestText
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>✨ Tell us about yourself (optional)</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="What makes you unique? Share your vibe! 😎"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={150}
          />
          <Text style={styles.characterCount}>{bio.length}/150</Text>
        </View>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.disabledButton]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Creating Account... 🔄' : step === 3 ? 'Join ChillConnect! 🎉' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/signin" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      {/* College Picker Modal */}
      <Modal
        visible={showCollegePicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCollegePicker(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select College</Text>
            <TouchableOpacity onPress={() => setShowCollegePicker(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={COLLEGES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.collegeOption}
                onPress={() => {
                  setCollege(item);
                  setShowCollegePicker(false);
                }}
              >
                <Text style={styles.collegeOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D1B69',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    fontSize: 16,
    color: '#2D1B69',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedGender: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedGenderText: {
    color: '#FFFFFF',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  pickerText: {
    fontSize: 16,
    color: '#2D1B69',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  yearContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedYear: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedYearText: {
    color: '#FFFFFF',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedInterest: {
    backgroundColor: '#FFE066',
    borderColor: '#FFE066',
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedInterestText: {
    color: '#2D1B69',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B46C1',
  },
  backButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  linkText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#64748B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D1B69',
  },
  modalDone: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
  },
  collegeOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  collegeOptionText: {
    fontSize: 16,
    color: '#2D1B69',
  },
});