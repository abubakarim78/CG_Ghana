import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Pressable,
  Switch,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { router } from 'expo-router';
import { useReportsStore, useAuthStore, useOfflineStore } from '../../src/store';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { GlassButton } from '../../src/components/glass/GlassButton';
import { GlassInput } from '../../src/components/glass/GlassInput';
import { RiskMeter } from '../../src/components/ui/RiskMeter';
import { computeRiskScore, shouldAutoEscalate } from '../../src/services/riskScoring';
import { GHANA_DISTRICTS } from '../../src/mock/geography';
import { CaseType, GhanaLocation } from '../../src/types/models';
import { getCaseTypeLabel } from '../../src/utils/formatters';
import { getNextCaseId } from '../../src/hooks/useLocalCaseId';
import { LocationMapPicker } from '../../src/components/ui/LocationMapPicker';
import { detectCurrentLocation, findNearestDistrict } from '../../src/utils/locationUtils';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Camera,
  MapPin,
  Crosshair,
  User,
  AlertTriangle,
  Shield,
  CheckCircle,
  Activity,
  Hash,
  Globe,
} from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = ['Case Type', 'Child Info', 'Location', 'Details', 'Review & Submit'];

interface CaseTypeOption {
  type: CaseType;
  icon: string;
  label: string;
}

const CASE_TYPES: CaseTypeOption[] = [
  { type: 'child_labour_agriculture', icon: '🌾', label: 'Agriculture' },
  { type: 'child_labour_fishing', icon: '🐟', label: 'Fishing' },
  { type: 'child_labour_mining', icon: '⛏️', label: 'Mining' },
  { type: 'child_labour_domestic', icon: '🏠', label: 'Domestic Work' },
  { type: 'child_labour_manufacturing', icon: '🏭', label: 'Manufacturing' },
  { type: 'child_labour_street', icon: '🚶', label: 'Street Labour' },
  { type: 'trafficking_labour', icon: '🔗', label: 'Labour Trafficking' },
  { type: 'trafficking_sexual', icon: '⚠️', label: 'Sexual Trafficking' },
  { type: 'trafficking_domestic', icon: '🚪', label: 'Domestic Trafficking' },
  { type: 'neglect', icon: '💔', label: 'Neglect' },
  { type: 'early_marriage', icon: '💒', label: 'Early Marriage' },
  { type: 'physical_abuse', icon: '✋', label: 'Physical Abuse' },
];

const DEMO_TRANSCRIPTION =
  'Child observed working at a construction site near the main market. Appears to be around 10 years old. No adult guardian present. Child was carrying heavy cement bags.';

// Case IDs are generated via AsyncStorage-persisted counter in getNextCaseId()

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ReportScreen() {
  const { addReport } = useReportsStore();

  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Step 0 — Case Type
  const [selectedType, setSelectedType] = useState<CaseType | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [dangerTriage, setDangerTriage] = useState({
    withPerp: false,
    recentViolence: false,
    noBasicNeeds: false,
  });

  // Step 1 — Child Info
  const [childAge, setChildAge] = useState(10);
  const [childGender, setChildGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [childDescription, setChildDescription] = useState('');

  // Step 2 — Location
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [locationText, setLocationText] = useState('');
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  // Step 3 — Details
  const [description, setDescription] = useState('');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'done'>('idle');

  // Step 3 — Photos
  const [photos, setPhotos] = useState<string[]>([]);

  // Step 4 — Review
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Risk score (recomputed on every relevant change)
  const [riskScore, setRiskScore] = useState(0);

  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recompute risk score whenever inputs change
  useEffect(() => {
    const draft = {
      type: selectedType ?? undefined,
      isEmergency,
      childAge,
      childGender,
      childDescription,
      description,
      photos,
      isAnonymous,
      dangerTriage,
      locationText,
    };
    setRiskScore(computeRiskScore(draft as any));
  }, [
    selectedType,
    isEmergency,
    childAge,
    dangerTriage,
    description,
    isAnonymous,
    childGender,
    childDescription,
    locationText,
    photos,
  ]);

  // Cleanup voice timer on unmount
  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------

  function canAdvance(): boolean {
    if (currentStep === 0) return selectedType !== null;
    if (currentStep === 2) return selectedDistrict !== '';
    return true;
  }

  function goNext() {
    if (!canAdvance()) {
      const messages: Record<number, string> = {
        0: 'Please select a case type before continuing.',
        2: 'Please select a district before continuing.',
      };
      Alert.alert('Required', messages[currentStep] ?? 'Please complete this step.');
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  function goBack() {
    if (currentStep === 0) {
      router.back();
    } else {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  // ---------------------------------------------------------------------------
  // GPS detection
  // ---------------------------------------------------------------------------

  async function handleDetectGPS() {
    setIsDetectingGPS(true);
    const detected = await detectCurrentLocation();
    if (detected) {
      setMapCoords({ lat: detected.lat, lng: detected.lng });
      setSelectedDistrict(detected.district);
      setLocationText(detected.address);
    } else {
      Alert.alert('Location Unavailable', 'Could not detect your location. Please select manually.');
    }
    setIsDetectingGPS(false);
  }

  // ---------------------------------------------------------------------------
  // Voice input
  // ---------------------------------------------------------------------------

  function handleVoicePress() {
    if (voiceState === 'listening') return;
    if (voiceState === 'done') {
      setVoiceState('idle');
      return;
    }
    setVoiceState('listening');
    voiceTimerRef.current = setTimeout(() => {
      setVoiceState('done');
      setDescription(DEMO_TRANSCRIPTION);
    }, 2000);
  }

  // ---------------------------------------------------------------------------
  // Photo helpers
  // ---------------------------------------------------------------------------

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to attach photos.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotos((prev) => (prev.length < 4 ? [...prev, uri] : prev));
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotos((prev) => (prev.length < 4 ? [...prev, uri] : prev));
    }
  }

  function handleAddPhotoSlot() {
    Alert.alert('Add Photo', 'How would you like to add a photo?', [
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSubmit() {
    const newId = await getNextCaseId();

    const districtObj = GHANA_DISTRICTS.find((d) => d.name === selectedDistrict);
    const location: GhanaLocation = {
      district: selectedDistrict || 'Unknown',
      region: districtObj?.region ?? 'Unknown',
      lat: districtObj?.lat ?? 5.6037,
      lng: districtObj?.lng ?? -0.187,
      description: locationText || undefined,
    };

    const draft = {
      type: selectedType ?? undefined,
      isEmergency,
      childAge,
      childGender,
      childDescription,
      description,
      photos,
      isAnonymous,
      dangerTriage,
      locationText,
    };

    const autoEscalate = shouldAutoEscalate(draft as any);
    const priority =
      riskScore >= 75
        ? 'critical'
        : riskScore >= 50
        ? 'high'
        : riskScore >= 25
        ? 'medium'
        : 'low';

    const now = new Date().toISOString();

    addReport({
      id: newId,
      type: selectedType!,
      childAge,
      childGender,
      location,
      description,
      photos,
      isAnonymous,
      isEmergency: isEmergency || autoEscalate,
      status: 'submitted',
      priority: priority as any,
      riskScore,
      reportedAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `${newId}-t1`,
          status: 'submitted',
          timestamp: now,
          title: 'Case Submitted',
          description: 'Report received by ChildGuard Ghana system.',
          isSystemEvent: true,
        },
      ],
    });

    router.push({
      pathname: '/(reporter)/submitted',
      params: { caseId: newId },
    });
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderProgressBar() {
    return (
      <View style={styles.progressWrapper}>
        <View style={styles.progressSegments}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                {
                  backgroundColor:
                    i <= currentStep ? COLORS.primary[500] : COLORS.neutral[700],
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressLabel}>
          Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep]}
        </Text>
      </View>
    );
  }

  function renderStep0() {
    return (
      <View style={styles.stepContent}>
        {/* Heading */}
        <View style={styles.stepHeader}>
          <Flag size={20} color={COLORS.primary[300]} />
          <Text style={styles.stepTitle}>What type of case is this?</Text>
        </View>
        <Text style={styles.stepSubtitle}>
          Select the category that best describes the situation.
        </Text>

        {/* Case type grid */}
        <View style={styles.caseTypeGrid}>
          {CASE_TYPES.map((ct) => {
            const isSelected = selectedType === ct.type;
            return (
              <TouchableOpacity
                key={ct.type}
                style={[
                  styles.caseTypePill,
                  isSelected && styles.caseTypePillSelected,
                ]}
                onPress={() => setSelectedType(ct.type)}
                activeOpacity={0.75}
              >
                <Text style={styles.caseTypeIcon}>{ct.icon}</Text>
                <Text
                  style={[
                    styles.caseTypeLabel,
                    isSelected && styles.caseTypeLabelSelected,
                  ]}
                  numberOfLines={2}
                >
                  {ct.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Emergency toggle */}
        <GlassCard variant={isEmergency ? 'emergency' : 'default'} style={styles.emergencyCard}>
          <View style={styles.emergencyRow}>
            <AlertTriangle
              size={22}
              color={isEmergency ? COLORS.emergency[300] : COLORS.warning}
            />
            <View style={styles.emergencyTextBlock}>
              <Text style={styles.emergencyTitle}>Child in Immediate Danger?</Text>
              <Text style={styles.emergencySubtitle}>
                Activates emergency escalation
              </Text>
            </View>
            <Switch
              value={isEmergency}
              onValueChange={setIsEmergency}
              thumbColor={isEmergency ? COLORS.emergency[300] : COLORS.neutral[400]}
              trackColor={{
                false: COLORS.neutral[700],
                true: COLORS.emergency[600],
              }}
              ios_backgroundColor={COLORS.neutral[700]}
            />
          </View>
        </GlassCard>

        {/* Triage questions */}
        <View style={styles.triageSection}>
          <Text style={styles.triageSectionTitle}>Triage Questions</Text>
          {[
            {
              key: 'withPerp' as const,
              question: 'Currently with perpetrator?',
            },
            {
              key: 'recentViolence' as const,
              question: 'Violence in last 24 hours?',
            },
            {
              key: 'noBasicNeeds' as const,
              question: 'Lacks food or shelter?',
            },
          ].map(({ key, question }) => (
            <GlassCard key={key} style={styles.triageCard}>
              <View style={styles.triageRow}>
                <Text style={styles.triageQuestion}>{question}</Text>
                <View style={styles.triageToggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.triageToggle,
                      dangerTriage[key] && styles.triageToggleYes,
                    ]}
                    onPress={() =>
                      setDangerTriage((prev) => ({ ...prev, [key]: true }))
                    }
                  >
                    <Text
                      style={[
                        styles.triageToggleText,
                        dangerTriage[key] && styles.triageToggleTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.triageToggle,
                      !dangerTriage[key] && styles.triageToggleNo,
                    ]}
                    onPress={() =>
                      setDangerTriage((prev) => ({ ...prev, [key]: false }))
                    }
                  >
                    <Text
                      style={[
                        styles.triageToggleText,
                        !dangerTriage[key] && styles.triageToggleTextNo,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      </View>
    );
  }

  function renderStep1() {
    return (
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <User size={20} color={COLORS.primary[300]} />
          <Text style={styles.stepTitle}>Child Information</Text>
        </View>
        <Text style={styles.stepSubtitle}>
          Approximate details help assess risk. All fields are optional.
        </Text>

        {/* Age selector */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Approximate Age</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ageSelectorRow}
          >
            {Array.from({ length: 17 }, (_, i) => i + 1).map((age) => {
              const selected = childAge === age;
              return (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.ageButton,
                    selected && styles.ageButtonSelected,
                  ]}
                  onPress={() => setChildAge(age)}
                >
                  <Text
                    style={[
                      styles.ageButtonText,
                      selected && styles.ageButtonTextSelected,
                    ]}
                  >
                    {age}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Gender picker */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {(
              [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'unknown', label: 'Unknown' },
              ] as { value: 'male' | 'female' | 'unknown'; label: string }[]
            ).map(({ value, label }) => {
              const selected = childGender === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.genderPill,
                    selected && styles.genderPillSelected,
                  ]}
                  onPress={() => setChildGender(value)}
                >
                  <Text
                    style={[
                      styles.genderPillText,
                      selected && styles.genderPillTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldSection}>
          <GlassInput
            label="Brief description (optional)"
            value={childDescription}
            onChangeText={setChildDescription}
            placeholder="Physical appearance, clothing, distinguishing features…"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    );
  }

  function renderStep2() {
    const first15 = GHANA_DISTRICTS.slice(0, 15);

    return (
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Globe size={20} color={COLORS.primary[300]} />
          <Text style={styles.stepTitle}>Location</Text>
        </View>
        <Text style={styles.stepSubtitle}>
          Where was the child seen? Select the nearest district.
        </Text>

        {/* Interactive map */}
        <View style={{ borderRadius: 16, overflow: 'hidden', marginBottom: SPACING.md }}>
          <LocationMapPicker
            initialLat={mapCoords?.lat ?? 7.9465}
            initialLng={mapCoords?.lng ?? -1.0232}
            initialZoom={mapCoords ? 14 : 7}
            markerLat={mapCoords?.lat}
            markerLng={mapCoords?.lng}
            onLocationSelect={(lat, lng) => {
              setMapCoords({ lat, lng });
              const nearest = findNearestDistrict(lat, lng);
              setSelectedDistrict(nearest.district);
            }}
            height={200}
            interactive={true}
            markerColor={COLORS.primary[500]}
          />
        </View>

        {/* GPS detect button */}
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={handleDetectGPS}
          activeOpacity={0.75}
          disabled={isDetectingGPS}
        >
          {isDetectingGPS ? (
            <ActivityIndicator size="small" color={COLORS.primary[300]} />
          ) : (
            <Crosshair size={18} color={COLORS.primary[300]} />
          )}
          <Text style={styles.gpsButtonText}>
            {isDetectingGPS ? 'Detecting…' : 'Auto-detect My Location'}
          </Text>
        </TouchableOpacity>

        {/* Coordinates display */}
        {mapCoords && (
          <Text style={styles.coordsText}>
            Pinned: {mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)}
          </Text>
        )}

        {/* District chips */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Select District</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.districtChipsRow}
          >
            {first15.map((d) => {
              const selected = selectedDistrict === d.name;
              return (
                <TouchableOpacity
                  key={d.name}
                  style={[
                    styles.districtChip,
                    selected && styles.districtChipSelected,
                  ]}
                  onPress={() => setSelectedDistrict(d.name)}
                >
                  <Text
                    style={[
                      styles.districtChipText,
                      selected && styles.districtChipTextSelected,
                    ]}
                  >
                    {d.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {selectedDistrict !== '' && (
            <View style={styles.districtConfirm}>
              <MapPin size={12} color={COLORS.primary[300]} />
              <Text style={styles.districtConfirmText}>
                {selectedDistrict} •{' '}
                {GHANA_DISTRICTS.find((d) => d.name === selectedDistrict)?.region}
              </Text>
            </View>
          )}
        </View>

        {/* Additional details */}
        <GlassInput
          label="Additional location details"
          value={locationText}
          onChangeText={setLocationText}
          placeholder="Near the market, behind the school, road name…"
          multiline
          numberOfLines={3}
        />
      </View>
    );
  }

  function renderStep3() {
    return (
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Activity size={20} color={COLORS.primary[300]} />
          <Text style={styles.stepTitle}>Case Details</Text>
        </View>
        <Text style={styles.stepSubtitle}>
          Describe what you observed. Be as specific as possible.
        </Text>

        {/* Description textarea */}
        <GlassInput
          label="Describe what you observed"
          value={description}
          onChangeText={setDescription}
          placeholder="Time of observation, number of adults present, child's condition, any immediate threats…"
          multiline
          numberOfLines={6}
        />

        {/* Voice input */}
        <View style={styles.voiceSection}>
          <Text style={styles.fieldLabel}>Or speak your report</Text>
          <View style={styles.voiceRow}>
            <TouchableOpacity
              style={[
                styles.voiceButton,
                voiceState === 'listening' && styles.voiceButtonListening,
                voiceState === 'done' && styles.voiceButtonDone,
              ]}
              onPress={handleVoicePress}
              activeOpacity={0.8}
            >
              <MotiView
                animate={
                  voiceState === 'listening'
                    ? {
                        borderWidth: [2, 6, 2],
                        borderColor: [
                          COLORS.primary[500],
                          COLORS.primary[300],
                          COLORS.primary[500],
                        ],
                      }
                    : { borderWidth: 0 }
                }
                transition={
                  voiceState === 'listening'
                    ? { type: 'timing', duration: 800, loop: true }
                    : undefined
                }
                style={styles.voiceButtonInner}
              >
                {voiceState === 'idle' && (
                  <Mic size={28} color={COLORS.text.primary} />
                )}
                {voiceState === 'listening' && (
                  <MicOff size={28} color={COLORS.text.primary} />
                )}
                {voiceState === 'done' && (
                  <CheckCircle size={28} color={COLORS.text.primary} />
                )}
              </MotiView>
            </TouchableOpacity>
            <View style={styles.voiceTextBlock}>
              {voiceState === 'idle' && (
                <Text style={styles.voiceLabel}>Tap to speak</Text>
              )}
              {voiceState === 'listening' && (
                <MotiView
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ type: 'timing', duration: 900, loop: true }}
                >
                  <Text style={[styles.voiceLabel, { color: COLORS.primary[300] }]}>
                    Listening…
                  </Text>
                </MotiView>
              )}
              {voiceState === 'done' && (
                <>
                  <Text style={[styles.voiceLabel, { color: COLORS.risk.low }]}>
                    Transcribed
                  </Text>
                  <Text style={styles.voiceSublabel}>Tap to record again</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Photo grid */}
        <View style={styles.photoSection}>
          <Text style={styles.fieldLabel}>Photos (optional, up to 4)</Text>
          <View style={styles.photoGrid}>
            {/* Filled slots — existing photos */}
            {photos.map((uri, i) => (
              <View key={`photo-${i}`} style={styles.photoSlotFilled}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => removePhoto(i)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.photoRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* Empty slots — show add buttons up to 4 total */}
            {photos.length < 4 &&
              Array.from({ length: 4 - photos.length }).map((_, i) => (
                <TouchableOpacity
                  key={`empty-${i}`}
                  style={styles.photoSlot}
                  onPress={handleAddPhotoSlot}
                  activeOpacity={0.7}
                >
                  <Camera size={22} color={COLORS.text.muted} />
                  <Text style={styles.photoSlotText}>+</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>
    );
  }

  function renderStep4() {
    const districtObj = GHANA_DISTRICTS.find((d) => d.name === selectedDistrict);
    const autoEscalate = shouldAutoEscalate({
      type: selectedType ?? undefined,
      isEmergency,
      childAge,
      childGender,
      childDescription,
      description,
      photos,
      isAnonymous,
      dangerTriage,
      locationText,
    } as any);

    return (
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <CheckCircle size={20} color={COLORS.primary[300]} />
          <Text style={styles.stepTitle}>Review & Submit</Text>
        </View>
        <Text style={styles.stepSubtitle}>
          Please review your report before submitting.
        </Text>

        {/* Anonymous toggle */}
        <GlassCard style={styles.anonymousCard}>
          <View style={styles.anonymousRow}>
            <View style={styles.anonymousIconCircle}>
              <Shield size={22} color={COLORS.primary[300]} />
            </View>
            <View style={styles.anonymousTextBlock}>
              <Text style={styles.anonymousTitle}>Submit Anonymously</Text>
              <Text style={styles.anonymousSubtitle}>
                We do NOT save your name or phone number
              </Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              thumbColor={isAnonymous ? COLORS.primary[300] : COLORS.neutral[400]}
              trackColor={{
                false: COLORS.neutral[700],
                true: COLORS.primary[700],
              }}
              ios_backgroundColor={COLORS.neutral[700]}
            />
          </View>
        </GlassCard>

        {/* Risk assessment */}
        <GlassCard style={styles.riskCard}>
          <RiskMeter score={riskScore} />
        </GlassCard>

        {/* Auto-escalate notice */}
        {autoEscalate && (
          <GlassCard variant="emergency" style={styles.escalateCard}>
            <View style={styles.escalateRow}>
              <AlertTriangle size={16} color={COLORS.emergency[300]} />
              <Text style={styles.escalateText}>
                This case will be automatically escalated to emergency priority.
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Summary chips */}
        <View style={styles.summarySection}>
          <Text style={styles.fieldLabel}>Summary</Text>
          <View style={styles.summaryChipsWrap}>
            {selectedType && (
              <View style={[styles.summaryChip, styles.summaryChipType]}>
                <Flag size={12} color={COLORS.primary[300]} />
                <Text style={styles.summaryChipText} numberOfLines={1}>
                  {getCaseTypeLabel(selectedType)}
                </Text>
              </View>
            )}
            {selectedDistrict !== '' && (
              <View style={[styles.summaryChip, styles.summaryChipLocation]}>
                <MapPin size={12} color={COLORS.secondary[300]} />
                <Text style={styles.summaryChipText}>{selectedDistrict}</Text>
              </View>
            )}
            <View style={[styles.summaryChip, styles.summaryChipAge]}>
              <User size={12} color={COLORS.gold} />
              <Text style={styles.summaryChipText}>Age ~{childAge}</Text>
            </View>
            <View style={[styles.summaryChip, styles.summaryChipAge]}>
              <Hash size={12} color={COLORS.neutral[400]} />
              <Text style={styles.summaryChipText}>
                {childGender.charAt(0).toUpperCase() + childGender.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Submit */}
        <GlassButton
          label="Submit Report"
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          style={styles.submitButton}
          icon={<CheckCircle size={18} color={COLORS.text.primary} />}
        />

        <Text style={styles.submitDisclaimer}>
          Your report is encrypted and sent securely to ChildGuard Ghana officers.
        </Text>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <LinearGradient
      colors={COLORS.gradient.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.2, y: 1 }}
    >
      {/* Safe-area top padding */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Report a Case</Text>
      </View>

      {/* Progress bar */}
      {renderProgressBar()}

      {/* Scrollable step content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatePresence>
          <MotiView
            key={currentStep}
            from={{ translateX: direction * 48, opacity: 0 }}
            animate={{ translateX: 0, opacity: 1 }}
            exit={{ translateX: direction * -48, opacity: 0 }}
            transition={{ type: 'timing', duration: 260 }}
          >
            <GlassCard variant="elevated" style={styles.stepCard}>
              {stepRenderers[currentStep]()}
            </GlassCard>
          </MotiView>
        </AnimatePresence>

        {/* Spacer so content clears the nav row */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation row — floats above scroll */}
      <View style={styles.navRow}>
        <GlassButton
          label="Back"
          variant="ghost"
          size="md"
          onPress={goBack}
          icon={<ChevronLeft size={18} color={COLORS.text.secondary} />}
          style={styles.navBack}
        />

        {currentStep < STEPS.length - 1 ? (
          <GlassButton
            label="Next"
            variant="primary"
            size="md"
            onPress={goNext}
            icon={<ChevronRight size={18} color={COLORS.text.primary} />}
            style={styles.navNext}
          />
        ) : (
          <GlassButton
            label="Submit"
            variant="primary"
            size="md"
            onPress={handleSubmit}
            icon={<CheckCircle size={18} color={COLORS.text.primary} />}
            style={styles.navNext}
          />
        )}
      </View>
    </LinearGradient>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Top bar
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.md,
  },
  screenTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },

  // Progress
  progressWrapper: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.base,
    gap: SPACING.sm,
  },
  progressSegments: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: RADIUS.full,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.sm,
  },

  // Step card
  stepCard: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
  },
  stepContent: {
    gap: SPACING.base,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  stepTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  stepSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },

  // Case type grid
  caseTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  caseTypePill: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
    minHeight: 72,
  },
  caseTypePillSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: 'rgba(14,143,168,0.18)',
    borderWidth: 1.5,
  },
  caseTypeIcon: {
    fontSize: 22,
  },
  caseTypeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  caseTypeLabelSelected: {
    color: COLORS.primary[300],
    fontFamily: 'Inter_600SemiBold',
  },

  // Emergency
  emergencyCard: {
    padding: SPACING.base,
    marginTop: SPACING.sm,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emergencyTextBlock: {
    flex: 1,
  },
  emergencyTitle: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
  },
  emergencySubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },

  // Triage
  triageSection: {
    gap: SPACING.sm,
  },
  triageSectionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
    marginBottom: 2,
  },
  triageCard: {
    padding: SPACING.md,
  },
  triageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  triageQuestion: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    flex: 1,
  },
  triageToggleGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  triageToggle: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor: 'transparent',
  },
  triageToggleYes: {
    backgroundColor: 'rgba(224,27,27,0.20)',
    borderColor: COLORS.emergency[500],
  },
  triageToggleNo: {
    backgroundColor: 'rgba(30,154,63,0.20)',
    borderColor: COLORS.secondary[500],
  },
  triageToggleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    fontFamily: 'Inter_600SemiBold',
  },
  triageToggleTextActive: {
    color: COLORS.emergency[300],
  },
  triageToggleTextNo: {
    color: COLORS.secondary[300],
  },

  // Step 1 — child info
  fieldSection: {
    gap: SPACING.sm,
  },
  fieldLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
  },
  ageSelectorRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  ageButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  ageButtonSelected: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  ageButtonText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.secondary,
    fontSize: 13,
  },
  ageButtonTextSelected: {
    color: COLORS.text.primary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderPill: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  genderPillSelected: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  genderPillText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.secondary,
  },
  genderPillTextSelected: {
    color: COLORS.text.primary,
  },

  // Step 2 — location
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary[700],
    backgroundColor: 'rgba(14,143,168,0.12)',
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  gpsButtonText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.primary[300],
  },
  coordsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginBottom: SPACING.sm,
  },
  districtChipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  districtChip: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  districtChipSelected: {
    backgroundColor: 'rgba(14,143,168,0.22)',
    borderColor: COLORS.primary[500],
  },
  districtChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  districtChipTextSelected: {
    color: COLORS.primary[300],
    fontFamily: 'Inter_600SemiBold',
  },
  districtConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  districtConfirmText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[300],
  },

  // Step 3 — details
  voiceSection: {
    gap: SPACING.sm,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  voiceButtonListening: {
    backgroundColor: COLORS.emergency[600],
  },
  voiceButtonDone: {
    backgroundColor: COLORS.secondary[500],
  },
  voiceButtonInner: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTextBlock: {
    flex: 1,
    gap: 2,
  },
  voiceLabel: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
  },
  voiceSublabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
  photoSection: {
    gap: SPACING.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoSlot: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.neutral[600],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 4,
  },
  photoSlotText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.muted,
    lineHeight: 18,
  },
  photoSlotFilled: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    lineHeight: 12,
  },

  // Step 4 — review
  anonymousCard: {
    padding: SPACING.base,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  anonymousIconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(14,143,168,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonymousTextBlock: {
    flex: 1,
  },
  anonymousTitle: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
  },
  anonymousSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
  riskCard: {
    padding: SPACING.base,
  },
  escalateCard: {
    padding: SPACING.md,
  },
  escalateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  escalateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.emergency[300],
    flex: 1,
  },
  summarySection: {
    gap: SPACING.sm,
  },
  summaryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  summaryChipType: {
    backgroundColor: 'rgba(14,143,168,0.15)',
    borderColor: COLORS.primary[500],
  },
  summaryChipLocation: {
    backgroundColor: 'rgba(30,154,63,0.15)',
    borderColor: COLORS.secondary[500],
  },
  summaryChipAge: {
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderColor: 'rgba(245,166,35,0.35)',
  },
  summaryChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontFamily: 'Inter_600SemiBold',
    maxWidth: 160,
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
  submitDisclaimer: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Navigation row
  navRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screen,
    paddingVertical: SPACING.base,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.xl,
    backgroundColor: 'rgba(13,22,32,0.85)',
    borderTopWidth: 1,
    borderTopColor: COLORS.surface.glassBorder,
  },
  navBack: {
    minWidth: 100,
  },
  navNext: {
    minWidth: 120,
  },
});
