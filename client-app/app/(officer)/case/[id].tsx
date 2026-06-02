import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image as RNImage,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCasesStore } from '../../../src/store/casesStore';
import { useAuthStore } from '../../../src/store/authStore';
import { GlassCard } from '../../../src/components/glass/GlassCard';
import { GlassButton } from '../../../src/components/glass/GlassButton';
import { CaseTimeline } from '../../../src/components/ui/CaseTimeline';
import { CaseBadge } from '../../../src/components/ui/CaseBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  Shield,
  Activity,
  Image,
  CheckCircle,
  Camera,
  ImagePlus,
  Trash2,
  Plus,
} from 'lucide-react-native';
import { getCaseTypeLabel, formatDate, getStatusLabel } from '../../../src/utils/formatters';
import { getRiskLabel, getRiskColor } from '../../../src/utils/colorUtils';
import { LocationMapPicker } from '../../../src/components/ui/LocationMapPicker';
import { haversineDistanceKm } from '../../../src/utils/locationUtils';
import { COLORS, FONTS, TYPOGRAPHY, SPACING, RADIUS } from '../../../src/theme';
import { CaseStatus } from '../../../src/types/models';

const STATUS_FLOW: { key: CaseStatus; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'intervention', label: 'Intervention' },
  { key: 'resolved', label: 'Resolved' },
];

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCaseById, updateCaseStatus } = useCasesStore();
  const user = useAuthStore((s) => s.user);

  const caseItem = getCaseById(id ?? '');

  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | null>(
    caseItem?.status ?? null
  );
  const [noteText, setNoteText] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Evidence photos
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>(
    caseItem?.photos ?? []
  );
  const [uploadSuccess, setUploadSuccess] = useState(false);

  async function pickEvidencePhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access to upload evidence.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      setEvidencePhotos((prev) => [...prev, result.assets[0].uri]);
      showUploadSuccess();
    }
  }

  async function takeEvidencePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to capture evidence.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setEvidencePhotos((prev) => [...prev, result.assets[0].uri]);
      showUploadSuccess();
    }
  }

  function handleAddEvidence() {
    if (evidencePhotos.length >= 8) {
      Alert.alert('Limit Reached', 'Maximum 8 evidence photos per case.');
      return;
    }
    Alert.alert('Add Evidence', 'Choose photo source', [
      { text: 'Camera', onPress: takeEvidencePhoto },
      { text: 'Photo Library', onPress: pickEvidencePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function removeEvidencePhoto(index: number) {
    Alert.alert('Remove Photo', 'Remove this evidence photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setEvidencePhotos((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  }

  function showUploadSuccess() {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2000);
  }

  if (!caseItem) {
    return (
      <View style={styles.notFound}>
        <LinearGradient
          colors={COLORS.gradient.background}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.notFoundText}>Case not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCriticalOrHigh =
    caseItem.priority === 'critical' || caseItem.priority === 'high';
  const riskColor = getRiskColor(caseItem.riskScore);
  const riskLabel = getRiskLabel(caseItem.riskScore);

  function handleStatusUpdate() {
    if (!selectedStatus || selectedStatus === caseItem!.status) return;
    if (!noteText.trim()) {
      Alert.alert('Note Required', 'Please add a note before updating the status.');
      return;
    }
    setIsUpdating(true);
    const officerName =
      user?.name ?? caseItem!.assignedOfficerName ?? 'Officer';
    updateCaseStatus(caseItem!.id, selectedStatus, noteText.trim(), officerName);
    setIsUpdating(false);
    setUpdateSuccess(true);
    setNoteText('');
    setTimeout(() => setUpdateSuccess(false), 3000);
  }

  function handleEscalate() {
    Alert.alert(
      'Escalate Case',
      `This case (${caseItem!.id}) will be escalated to the regional supervisor and National Human Trafficking Secretariat for immediate attention. Do you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Escalated',
              'The case has been escalated. A supervisor will be notified immediately.'
            );
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.background}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Back Button + Title ─── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.75}
          >
            <ArrowLeft size={20} color={COLORS.text.primary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.topBarTitleWrapper}>
            <Text style={styles.caseIdTitle}>{caseItem.id}</Text>
            <Text style={styles.caseTypeSubtitle} numberOfLines={1}>
              {getCaseTypeLabel(caseItem.type)}
            </Text>
          </View>
        </View>

        {/* ─── Case Header Card ─── */}
        <GlassCard variant="elevated" style={styles.headerCard}>
          {/* Priority colour bar at top */}
          <View
            style={[
              styles.priorityBar,
              {
                backgroundColor:
                  COLORS.priority[caseItem.priority],
              },
            ]}
          />

          <View style={styles.headerCardContent}>
            {/* Type + badges row */}
            <View style={styles.headerTopRow}>
              <Text style={styles.caseType}>
                {getCaseTypeLabel(caseItem.type)}
              </Text>
              <View style={styles.badgesGroup}>
                <CaseBadge type="priority" value={caseItem.priority} size="md" />
              </View>
            </View>

            {/* Risk score */}
            <View style={styles.riskRow}>
              <Activity size={14} color={riskColor} strokeWidth={2} />
              <Text style={[styles.riskText, { color: riskColor }]}>
                {riskLabel} — Score {caseItem.riskScore}/100
              </Text>
            </View>

            {/* Meta grid */}
            <View style={styles.metaGrid}>
              {caseItem.assignedOfficerName && (
                <View style={styles.metaItem}>
                  <Shield size={13} color={COLORS.text.muted} strokeWidth={2} />
                  <Text style={styles.metaLabel}>Officer</Text>
                  <Text style={styles.metaValue}>
                    {caseItem.assignedOfficerName}
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <MapPin size={13} color={COLORS.text.muted} strokeWidth={2} />
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue} numberOfLines={2}>
                  {caseItem.location.district},{' '}
                  {caseItem.location.region}
                </Text>
              </View>
              {caseItem.location.lat && caseItem.location.lng && (
                <View style={{ borderRadius: 12, overflow: 'hidden', marginTop: SPACING.sm }}>
                  <LocationMapPicker
                    initialLat={caseItem.location.lat}
                    initialLng={caseItem.location.lng}
                    initialZoom={13}
                    markerLat={caseItem.location.lat}
                    markerLng={caseItem.location.lng}
                    height={180}
                    interactive={false}
                    markerColor={COLORS.emergency[500]}
                  />
                </View>
              )}
              <View style={styles.metaItem}>
                <Calendar size={13} color={COLORS.text.muted} strokeWidth={2} />
                <Text style={styles.metaLabel}>Reported</Text>
                <Text style={styles.metaValue}>
                  {formatDate(caseItem.reportedAt)}
                </Text>
              </View>
            </View>

            {/* Status badge */}
            <View style={styles.statusBadgeRow}>
              <CaseBadge type="status" value={caseItem.status} size="md" />
            </View>
          </View>
        </GlassCard>

        {/* ─── Child Info Card ─── */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <User size={16} color={COLORS.primary[500]} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Child Information</Text>
          </View>
          <View style={styles.childInfoRow}>
            <View style={styles.childInfoItem}>
              <Text style={styles.childInfoLabel}>Age</Text>
              <Text style={styles.childInfoValue}>
                {caseItem.childAge} years old
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.childInfoItem}>
              <Text style={styles.childInfoLabel}>Gender</Text>
              <Text style={styles.childInfoValue}>
                {caseItem.childGender.charAt(0).toUpperCase() +
                  caseItem.childGender.slice(1)}
              </Text>
            </View>
            {caseItem.isEmergency && (
              <>
                <View style={styles.divider} />
                <View style={styles.emergencyIndicator}>
                  <AlertTriangle
                    size={14}
                    color={COLORS.emergency[500]}
                    strokeWidth={2.5}
                  />
                  <Text style={styles.emergencyIndicatorText}>
                    EMERGENCY
                  </Text>
                </View>
              </>
            )}
          </View>
          {caseItem.location.description ? (
            <Text style={styles.locationDescription} numberOfLines={2}>
              {caseItem.location.description}
            </Text>
          ) : null}
        </GlassCard>

        {/* ─── Status Update Card ─── */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Activity size={16} color={COLORS.primary[500]} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Update Status</Text>
          </View>

          {/* Status pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusPillsRow}
          >
            {STATUS_FLOW.map((s) => {
              const isSelected = selectedStatus === s.key;
              const isCurrent = caseItem.status === s.key;
              const statusColor = COLORS.status[s.key];
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setSelectedStatus(s.key)}
                  activeOpacity={0.75}
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isSelected
                        ? `${statusColor}22`
                        : COLORS.surface.glass,
                      borderColor: isSelected
                        ? statusColor
                        : COLORS.surface.glassBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: isSelected ? statusColor : COLORS.text.muted },
                    ]}
                  >
                    {s.label}
                  </Text>
                  {isCurrent && (
                    <View
                      style={[
                        styles.currentDot,
                        { backgroundColor: statusColor },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Note input */}
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Add a note about this update..."
            placeholderTextColor={COLORS.text.muted}
            multiline
            numberOfLines={4}
            style={styles.noteInput}
            textAlignVertical="top"
          />

          {/* Success banner */}
          {updateSuccess && (
            <View style={styles.successBanner}>
              <CheckCircle
                size={14}
                color={COLORS.secondary[500]}
                strokeWidth={2.5}
              />
              <Text style={styles.successText}>Status updated successfully.</Text>
            </View>
          )}

          <GlassButton
            label={isUpdating ? 'Updating...' : 'Update Status'}
            onPress={handleStatusUpdate}
            variant="primary"
            loading={isUpdating}
            disabled={
              !selectedStatus ||
              selectedStatus === caseItem.status ||
              !noteText.trim()
            }
            style={styles.updateButton}
          />
        </GlassCard>

        {/* ─── Escalation Card (critical / high only) ─── */}
        {isCriticalOrHigh && (
          <GlassCard variant="emergency" style={styles.escalationCard}>
            <View style={styles.escalationRow}>
              <View style={styles.escalationIcon}>
                <AlertTriangle
                  size={20}
                  color={COLORS.emergency[500]}
                  strokeWidth={2.5}
                />
              </View>
              <View style={styles.escalationText}>
                <Text style={styles.escalationTitle}>Escalation Required</Text>
                <Text style={styles.escalationSubtitle}>
                  This case may need escalation to a senior officer or national
                  unit.
                </Text>
              </View>
            </View>
            <GlassButton
              label="Escalate Case"
              onPress={handleEscalate}
              variant="danger"
              icon={
                <AlertTriangle
                  size={14}
                  color={COLORS.text.primary}
                  strokeWidth={2.5}
                />
              }
              style={styles.escalateButton}
            />
          </GlassCard>
        )}

        {/* ─── Timeline Card ─── */}
        <GlassCard style={styles.sectionCard}>
          <CaseTimeline
            timeline={caseItem.timeline}
            currentStatus={caseItem.status}
          />
        </GlassCard>

        {/* ─── Evidence Section ─── */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Image size={16} color={COLORS.primary[500]} strokeWidth={2} />
            <Text style={styles.sectionTitle}>
              Evidence Photos
            </Text>
            <View style={styles.evidenceCountBadge}>
              <Text style={styles.evidenceCountText}>{evidencePhotos.length}/8</Text>
            </View>
          </View>

          {/* Upload success flash */}
          {uploadSuccess && (
            <View style={styles.uploadSuccessBanner}>
              <CheckCircle size={14} color={COLORS.secondary[500]} strokeWidth={2} />
              <Text style={styles.uploadSuccessText}>Photo added to evidence</Text>
            </View>
          )}

          <View style={styles.evidenceGrid}>
            {/* Existing photos */}
            {evidencePhotos.map((uri, index) => (
              <View key={`photo-${index}`} style={styles.evidencePhotoWrap}>
                <RNImage source={{ uri }} style={styles.evidencePhoto} resizeMode="cover" />
                {/* Remove button overlay */}
                <TouchableOpacity
                  style={styles.evidenceRemoveBtn}
                  onPress={() => removeEvidencePhoto(index)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={12} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
                {/* Index label */}
                <View style={styles.evidenceIndexBadge}>
                  <Text style={styles.evidenceIndexText}>{index + 1}</Text>
                </View>
              </View>
            ))}

            {/* Add new photo slot */}
            {evidencePhotos.length < 8 && (
              <TouchableOpacity
                style={styles.evidenceAddSlot}
                onPress={handleAddEvidence}
                activeOpacity={0.75}
              >
                <View style={styles.evidenceAddIconWrap}>
                  <Plus size={20} color={COLORS.primary[500]} strokeWidth={2} />
                </View>
                <Text style={styles.evidenceAddText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action row */}
          <View style={styles.evidenceActions}>
            <TouchableOpacity
              style={styles.evidenceActionBtn}
              onPress={takeEvidencePhoto}
              activeOpacity={0.8}
            >
              <Camera size={16} color={COLORS.primary[500]} strokeWidth={2} />
              <Text style={styles.evidenceActionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.evidenceActionBtn}
              onPress={pickEvidencePhoto}
              activeOpacity={0.8}
            >
              <ImagePlus size={16} color={COLORS.primary[500]} strokeWidth={2} />
              <Text style={styles.evidenceActionText}>Library</Text>
            </TouchableOpacity>
          </View>

          {evidencePhotos.length === 0 && (
            <Text style={styles.evidenceEmptyHint}>
              Tap "Add Photo" or use the buttons above to attach evidence photos to this case.
            </Text>
          )}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface.dark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.xxxl + SPACING.lg,
    paddingBottom: SPACING.xxxl + SPACING.xl,
    gap: SPACING.md,
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  notFoundText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.text.secondary,
  },
  backLink: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  backLinkText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    color: COLORS.primary[500],
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.screen,
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topBarTitleWrapper: {
    flex: 1,
  },
  caseIdTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.text.primary,
    lineHeight: 28,
  },
  caseTypeSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
    lineHeight: 18,
  },

  // Header card
  headerCard: {
    marginHorizontal: SPACING.screen,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  priorityBar: {
    height: 4,
    width: '100%',
  },
  headerCardContent: {
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  caseType: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    flex: 1,
  },
  badgesGroup: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
    flexShrink: 0,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  riskText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    lineHeight: 18,
  },
  metaGrid: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  metaLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
    lineHeight: 18,
    minWidth: 64,
  },
  metaValue: {
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
    flex: 1,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },

  // Section cards
  sectionCard: {
    marginHorizontal: SPACING.screen,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
    letterSpacing: 0.3,
  },

  // Child info
  childInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  childInfoItem: {
    flex: 1,
    gap: 2,
  },
  childInfoLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  childInfoValue: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.surface.glassBorder,
  },
  emergencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.emergency[500]}18`,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: `${COLORS.emergency[500]}44`,
  },
  emergencyIndicatorText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    color: COLORS.emergency[500],
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  locationDescription: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },

  // Status update
  statusPillsRow: {
    gap: SPACING.sm,
    flexDirection: 'row',
    paddingBottom: SPACING.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  statusPillText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    lineHeight: 18,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
  },
  noteInput: {
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 22,
    minHeight: 96,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.secondary[500]}18`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.secondary[500]}44`,
    padding: SPACING.md,
  },
  successText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.secondary[500],
    lineHeight: 18,
  },
  updateButton: {
    alignSelf: 'stretch',
  },

  // Escalation
  escalationCard: {
    marginHorizontal: SPACING.screen,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  escalationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  escalationIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.emergency[500]}22`,
    borderWidth: 1,
    borderColor: `${COLORS.emergency[500]}44`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  escalationText: {
    flex: 1,
    gap: SPACING.xs,
  },
  escalationTitle: {
    fontFamily: FONTS.heading,
    fontSize: 15,
    color: COLORS.emergency[300],
    lineHeight: 22,
  },
  escalationSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  escalateButton: {
    alignSelf: 'stretch',
  },

  // Evidence
  evidenceCountBadge: {
    marginLeft: 'auto' as unknown as number,
    backgroundColor: COLORS.surface.glass,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
  },
  evidenceCountText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    color: COLORS.text.muted,
  },
  uploadSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(30,154,63,0.12)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(30,154,63,0.25)',
  },
  uploadSuccessText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.secondary[500],
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  evidencePhotoWrap: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  evidencePhoto: {
    width: '100%',
    height: '100%',
  },
  evidenceRemoveBtn: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(224,27,27,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceIndexBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  evidenceIndexText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    color: '#fff',
  },
  evidenceAddSlot: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1.5,
    borderColor: COLORS.primary[500],
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  evidenceAddIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(14,143,168,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceAddText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.primary[500],
  },
  evidenceActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  evidenceActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
  },
  evidenceActionText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.primary[500],
  },
  evidenceEmptyHint: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
});
