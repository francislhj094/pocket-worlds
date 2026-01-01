import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { useGame } from '@/contexts/GameContext';
import { AvatarCustomization } from '@/types/game';
import { SKIN_TONES, FACES, HAIR_STYLES, HAIR_COLORS, OUTFITS } from '@/constants/gameData';

const CubicAvatar = ({ avatar, size = 200 }: { avatar: AvatarCustomization; size?: number }) => {
  
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Rect x="50" y="30" width="100" height="100" rx="12" fill={avatar.skinTone} stroke="#000" strokeWidth="3" />
      
      {avatar.hairStyle === 'short' && (
        <Path d="M 50 30 Q 50 10, 100 10 Q 150 10, 150 30 L 150 50 L 50 50 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
      )}
      {avatar.hairStyle === 'long' && (
        <>
          <Path d="M 50 30 Q 50 10, 100 10 Q 150 10, 150 30 L 150 80 L 50 80 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Rect x="45" y="60" width="20" height="40" rx="10" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Rect x="135" y="60" width="20" height="40" rx="10" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
        </>
      )}
      {avatar.hairStyle === 'curly' && (
        <>
          <Circle cx="60" cy="25" r="15" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Circle cx="85" cy="20" r="15" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Circle cx="115" cy="20" r="15" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Circle cx="140" cy="25" r="15" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
        </>
      )}
      {avatar.hairStyle === 'spiky' && (
        <>
          <Path d="M 60 40 L 55 10 L 65 35 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Path d="M 80 40 L 75 5 L 85 35 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Path d="M 100 40 L 95 8 L 105 35 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Path d="M 120 40 L 115 5 L 125 35 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Path d="M 140 40 L 135 10 L 145 35 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
        </>
      )}
      {avatar.hairStyle === 'bun' && (
        <>
          <Path d="M 50 30 Q 50 15, 100 15 Q 150 15, 150 30 L 150 45 L 50 45 Z" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
          <Circle cx="100" cy="15" r="20" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
        </>
      )}
      {avatar.hairStyle === 'afro' && (
        <Circle cx="100" cy="40" r="60" fill={avatar.hairColor} stroke="#000" strokeWidth="2" />
      )}
      
      {avatar.face === 'happy' && (
        <>
          <Circle cx="75" cy="70" r="8" fill="#000" />
          <Circle cx="125" cy="70" r="8" fill="#000" />
          <Path d="M 70 95 Q 100 105, 130 95" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {avatar.face === 'cool' && (
        <>
          <Rect x="60" y="65" width="30" height="12" rx="6" fill="#000" />
          <Rect x="110" y="65" width="30" height="12" rx="6" fill="#000" />
          <Path d="M 75 95 L 125 95" stroke="#000" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {avatar.face === 'excited' && (
        <>
          <Circle cx="75" cy="65" r="10" fill="#000" />
          <Circle cx="125" cy="65" r="10" fill="#000" />
          <Circle cx="100" cy="95" r="12" fill="#000" />
        </>
      )}
      
      <Rect x="60" y="140" width="80" height="60" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : avatar.outfit === 'sporty' ? '#ef4444' : '#6366f1'} stroke="#000" strokeWidth="3" />
      <Rect x="30" y="145" width="30" height="50" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : avatar.outfit === 'sporty' ? '#ef4444' : '#6366f1'} stroke="#000" strokeWidth="2" />
      <Rect x="140" y="145" width="30" height="50" rx="8" fill={avatar.outfit === 'casual' ? '#3b82f6' : avatar.outfit === 'sporty' ? '#ef4444' : '#6366f1'} stroke="#000" strokeWidth="2" />
    </Svg>
  );
};

export default function AvatarCreator() {
  const router = useRouter();
  const { profile, updateAvatar, completeAvatarCreator } = useGame();
  const [currentAvatar, setCurrentAvatar] = React.useState<AvatarCustomization>(profile.avatar);
  const [step, setStep] = React.useState(0);

  const steps = [
    { title: 'Skin Tone', options: SKIN_TONES, key: 'skinTone' as const },
    { title: 'Face', options: FACES.filter(f => f.free).map(f => f.id), key: 'face' as const },
    { title: 'Hair Style', options: HAIR_STYLES.filter(h => h.free).map(h => h.id), key: 'hairStyle' as const },
    { title: 'Hair Color', options: HAIR_COLORS, key: 'hairColor' as const },
    { title: 'Outfit', options: OUTFITS.filter(o => o.free).map(o => o.id), key: 'outfit' as const },
  ];

  const currentStep = steps[step];

  const handleSelect = (value: string) => {
    setCurrentAvatar({ ...currentAvatar, [currentStep.key]: value });
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      updateAvatar(currentAvatar);
      completeAvatarCreator();
      router.replace('/home');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Your Avatar</Text>
        <Text style={styles.subtitle}>Step {step + 1} of {steps.length}</Text>

        <View style={styles.avatarPreview}>
          <CubicAvatar avatar={currentAvatar} size={180} />
        </View>

        <Text style={styles.stepTitle}>{currentStep.title}</Text>

        <View style={styles.optionsGrid}>
          {currentStep.options.map((option, index) => {
            const isSelected = currentAvatar[currentStep.key] === option;
            const isColor = currentStep.key === 'skinTone' || currentStep.key === 'hairColor';

            return (
              <Pressable
                key={index}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  isColor && styles.colorOption,
                ]}
                onPress={() => handleSelect(option)}
              >
                {isColor ? (
                  <View style={[styles.colorSwatch, { backgroundColor: option }]} />
                ) : (
                  <Text style={styles.optionText}>{option}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.navigation}>
          {step > 0 && (
            <Pressable style={styles.navButton} onPress={handleBack}>
              <Text style={styles.navButtonText}>Back</Text>
            </Pressable>
          )}
          <Pressable style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.navButtonText}>
              {step < steps.length - 1 ? 'Next' : 'Start Playing!'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 30,
  },
  avatarPreview: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#14b8a6',
    marginBottom: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  colorOption: {
    padding: 8,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    paddingHorizontal: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#a855f7',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
