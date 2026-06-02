import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  BookOpen,
  AlertTriangle,
  Phone,
  Shield,
  ChevronRight,
  Award,
  CheckCircle,
  X,
  Shovel,
  Send,
  ShieldCheck,
} from 'lucide-react-native';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { EDUCATION_MODULES } from '../../src/mock/education';
import {
  EducationModule,
  EducationSection,
  QuizQuestion,
} from '../../src/types/models';
import { COLORS, FONTS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';

// ── Icon map (matches mock iconName strings) ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Shovel: Shovel,
  AlertTriangle: AlertTriangle,
  Send: Send,
  ShieldCheck: ShieldCheck,
  BookOpen: BookOpen,
  Shield: Shield,
  Phone: Phone,
};

function ModuleIcon({
  iconName,
  size,
  color,
}: {
  iconName: string;
  size: number;
  color: string;
}) {
  const Icon = ICON_MAP[iconName] ?? BookOpen;
  return <Icon size={size} color={color} strokeWidth={2} />;
}

// ── Section type labels ───────────────────────────────────────────────────────
const SECTION_TYPE_LABELS: Record<EducationSection['type'], string> = {
  definition: 'Definition',
  signs: 'Warning Signs',
  actions: 'Actions',
  facts: 'Key Facts',
  law: 'Ghana Law',
};

const SECTION_TYPE_COLORS: Record<EducationSection['type'], string> = {
  definition: COLORS.primary[500],
  signs: COLORS.priority.high,
  actions: COLORS.secondary[500],
  facts: COLORS.status.assigned,
  law: COLORS.status.submitted,
};

// ── Module count label ────────────────────────────────────────────────────────
function lessonCount(module: EducationModule): number {
  return module.sections.length;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const [activeModule, setActiveModule] = useState<EducationModule | null>(null);

  return (
    <LinearGradient
      colors={COLORS.gradient.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page header ─────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450 }}
          style={styles.pageHeader}
        >
          <Text style={styles.pageTitle}>Child Protection</Text>
          <Text style={styles.pageSubtitle}>
            Learn to identify and report abuse
          </Text>
        </MotiView>

        {/* ── Emergency numbers card ───────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 100 }}
          style={styles.sectionWrapper}
        >
          <GlassCard variant="emergency" style={styles.emergencyCard}>
            <View style={styles.emergencyCardHeader}>
              <Phone size={18} color={COLORS.emergency[300]} strokeWidth={2} />
              <Text style={styles.emergencyCardTitle}>Emergency Numbers</Text>
            </View>
            <View style={styles.emergencyNumbers}>
              <EmergencyNumber label="ChildLine" number="116" note="Free, 24/7" />
              <View style={styles.emergencyDivider} />
              <EmergencyNumber label="Police" number="191" />
              <View style={styles.emergencyDivider} />
              <EmergencyNumber label="Social Welfare" number="0302-666-441" />
            </View>
          </GlassCard>
        </MotiView>

        {/* ── Module grid (2 × 2) ──────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>LEARNING MODULES</Text>
        <View style={styles.moduleGrid}>
          {EDUCATION_MODULES.map((mod, index) => (
            <MotiView
              key={mod.id}
              from={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                damping: 16,
                stiffness: 220,
                delay: 200 + index * 80,
              }}
              style={styles.moduleCell}
            >
              <ModuleCard
                module={mod}
                onPress={() => setActiveModule(mod)}
              />
            </MotiView>
          ))}
        </View>
      </ScrollView>

      {/* ── Module modal ─────────────────────────────────────────────────── */}
      {activeModule != null && (
        <ModuleModal
          module={activeModule}
          onClose={() => setActiveModule(null)}
        />
      )}
    </LinearGradient>
  );
}

// ── Emergency number item ─────────────────────────────────────────────────────

function EmergencyNumber({
  label,
  number,
  note,
}: {
  label: string;
  number: string;
  note?: string;
}) {
  return (
    <View style={styles.emergencyItem}>
      <Text style={styles.emergencyLabel}>{label}</Text>
      <Text style={styles.emergencyNumber}>{number}</Text>
      {note != null && <Text style={styles.emergencyNote}>{note}</Text>}
    </View>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────

function ModuleCard({
  module,
  onPress,
}: {
  module: EducationModule;
  onPress: () => void;
}) {
  return (
    <GlassCard style={styles.moduleCard} onPress={onPress} activeOpacity={0.8}>
      {/* Icon */}
      <View style={[styles.moduleIconCircle, { backgroundColor: `${module.color}22` }]}>
        <ModuleIcon iconName={module.iconName} size={26} color={module.color} />
      </View>

      {/* Title */}
      <Text style={styles.moduleTitle} numberOfLines={2}>
        {module.title}
      </Text>

      {/* Summary */}
      <Text style={styles.moduleSummary} numberOfLines={3}>
        {module.summary}
      </Text>

      {/* Footer: lesson count + chevron */}
      <View style={styles.moduleFooter}>
        <Text style={styles.moduleLessonCount}>
          {lessonCount(module)} lessons
        </Text>
        <ChevronRight size={14} color={COLORS.text.muted} strokeWidth={2} />
      </View>
    </GlassCard>
  );
}

// ── Module modal ──────────────────────────────────────────────────────────────

function ModuleModal({
  module,
  onClose,
}: {
  module: EducationModule;
  onClose: () => void;
}) {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);

  function handleSelectAnswer(questionIndex: number, optionIndex: number) {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  function handleSubmitQuiz() {
    const totalAnswered = Object.keys(quizAnswers).length;
    if (totalAnswered < module.quiz.length) return;

    setQuizSubmitted(true);
    const correct = module.quiz.filter(
      (q, i) => quizAnswers[i] === q.correctIndex
    ).length;

    if (correct >= 2) {
      setBadgeEarned(true);
    }
  }

  const score = quizSubmitted
    ? module.quiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length
    : 0;

  const allAnswered = Object.keys(quizAnswers).length === module.quiz.length;

  return (
    <Modal
      visible
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={COLORS.gradient.background}
        style={styles.modalContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
      >
        {/* Modal header */}
        <View style={styles.modalHeader}>
          <View style={[styles.modalIconCircle, { backgroundColor: `${module.color}22` }]}>
            <ModuleIcon iconName={module.iconName} size={22} color={module.color} />
          </View>
          <Text style={styles.modalTitle} numberOfLines={2}>
            {module.title}
          </Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={22} color={COLORS.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Sections ─────────────────────────────────────────────── */}
          {module.sections.map((section, sIdx) => (
            <View key={sIdx} style={styles.sectionBlock}>
              <View style={styles.sectionHeadingRow}>
                <Text style={styles.sectionHeading}>{section.heading}</Text>
                <View
                  style={[
                    styles.sectionTypePill,
                    { backgroundColor: `${SECTION_TYPE_COLORS[section.type]}22` },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionTypeLabel,
                      { color: SECTION_TYPE_COLORS[section.type] },
                    ]}
                  >
                    {SECTION_TYPE_LABELS[section.type]}
                  </Text>
                </View>
              </View>

              {section.items.map((item, iIdx) => (
                <View key={iIdx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* ── Quiz ─────────────────────────────────────────────────── */}
          <View style={styles.quizBlock}>
            <View style={styles.quizHeader}>
              <Award size={20} color={COLORS.gold} strokeWidth={2} />
              <Text style={styles.quizTitle}>Knowledge Check</Text>
            </View>
            <Text style={styles.quizSubtitle}>
              Answer all {module.quiz.length} questions to earn your badge
            </Text>

            {module.quiz.map((q, qIdx) => (
              <QuizQuestionBlock
                key={qIdx}
                question={q}
                questionIndex={qIdx}
                selectedOption={quizAnswers[qIdx] ?? null}
                submitted={quizSubmitted}
                onSelect={(optIdx) => handleSelectAnswer(qIdx, optIdx)}
              />
            ))}

            {/* Submit button */}
            {!quizSubmitted && (
              <TouchableOpacity
                style={[
                  styles.quizSubmitButton,
                  !allAnswered && styles.quizSubmitButtonDisabled,
                ]}
                onPress={handleSubmitQuiz}
                disabled={!allAnswered}
                activeOpacity={0.8}
              >
                <Text style={styles.quizSubmitLabel}>Submit Answers</Text>
              </TouchableOpacity>
            )}

            {/* Score result */}
            {quizSubmitted && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 220 }}
              >
                <GlassCard
                  variant={badgeEarned ? 'gold' : 'default'}
                  style={styles.scoreCard}
                >
                  {badgeEarned ? (
                    <>
                      <MotiView
                        from={{ rotate: '0deg', scale: 0.5 }}
                        animate={{ rotate: '360deg', scale: 1 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 180 }}
                      >
                        <Award size={40} color={COLORS.gold} strokeWidth={1.5} />
                      </MotiView>
                      <Text style={styles.scoreBadgeTitle}>Badge Earned!</Text>
                      <Text style={styles.scoreText}>
                        {score} / {module.quiz.length} correct
                      </Text>
                      <Text style={styles.scoreCaption}>
                        Well done — you have mastered this module.
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.scoreText}>
                        {score} / {module.quiz.length} correct
                      </Text>
                      <Text style={styles.scoreCaption}>
                        Review the sections above and try again to earn your badge.
                      </Text>
                    </>
                  )}
                </GlassCard>
              </MotiView>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

// ── Individual quiz question ───────────────────────────────────────────────────

function QuizQuestionBlock({
  question,
  questionIndex,
  selectedOption,
  submitted,
  onSelect,
}: {
  question: QuizQuestion;
  questionIndex: number;
  selectedOption: number | null;
  submitted: boolean;
  onSelect: (idx: number) => void;
}) {
  return (
    <View style={styles.quizQuestion}>
      <Text style={styles.quizQuestionText}>
        {questionIndex + 1}. {question.question}
      </Text>

      {question.options.map((opt, oIdx) => {
        const isSelected = selectedOption === oIdx;
        const isCorrect = oIdx === question.correctIndex;
        const isWrong = submitted && isSelected && !isCorrect;
        const showCorrect = submitted && isCorrect;

        let optBorderColor: string = COLORS.surface.glassBorder;
        let optBg: string = 'transparent';
        let optTextColor: string = COLORS.text.secondary;

        if (showCorrect) {
          optBorderColor = COLORS.secondary[500];
          optBg = 'rgba(30,154,63,0.12)';
          optTextColor = COLORS.text.primary;
        } else if (isWrong) {
          optBorderColor = COLORS.emergency[500];
          optBg = 'rgba(224,27,27,0.10)';
          optTextColor = COLORS.text.primary;
        } else if (isSelected && !submitted) {
          optBorderColor = COLORS.primary[500];
          optBg = 'rgba(14,143,168,0.14)';
          optTextColor = COLORS.text.primary;
        }

        return (
          <TouchableOpacity
            key={oIdx}
            style={[
              styles.quizOption,
              { borderColor: optBorderColor, backgroundColor: optBg },
            ]}
            onPress={() => onSelect(oIdx)}
            activeOpacity={submitted ? 1 : 0.75}
          >
            <View style={styles.quizOptionLeft}>
              {submitted && showCorrect ? (
                <CheckCircle size={16} color={COLORS.secondary[500]} strokeWidth={2} />
              ) : submitted && isWrong ? (
                <X size={16} color={COLORS.emergency[500]} strokeWidth={2} />
              ) : (
                <View
                  style={[
                    styles.quizOptionDot,
                    isSelected && !submitted && styles.quizOptionDotSelected,
                  ]}
                />
              )}
            </View>
            <Text style={[styles.quizOptionText, { color: optTextColor }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}

      {submitted && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingTop: SPACING.xxxl + SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },

  // Page header ───────────────────────────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: SPACING.screen,
    marginBottom: SPACING.base,
  },
  pageTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },

  // Emergency card ────────────────────────────────────────────────────────────
  sectionWrapper: {
    paddingHorizontal: SPACING.screen,
    marginBottom: SPACING.xl,
  },
  emergencyCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  emergencyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  emergencyCardTitle: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.emergency[300],
  },
  emergencyNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  emergencyItem: {
    alignItems: 'center',
    flex: 1,
  },
  emergencyLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginBottom: 2,
  },
  emergencyNumber: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.emergency[300],
  },
  emergencyNote: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.text.muted,
    marginTop: 1,
  },
  emergencyDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.surface.glassBorder,
  },

  // Section label ─────────────────────────────────────────────────────────────
  sectionLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
    paddingHorizontal: SPACING.screen,
    marginBottom: SPACING.sm,
  },

  // Module grid ───────────────────────────────────────────────────────────────
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.screen - SPACING.xs,
    gap: SPACING.sm,
  },
  moduleCell: {
    width: '47.5%',
  },
  moduleCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    minHeight: 190,
  },
  moduleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  moduleTitle: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  moduleSummary: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    lineHeight: 17,
    flex: 1,
    marginBottom: SPACING.sm,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleLessonCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    fontFamily: FONTS.bodySemi,
  },

  // ── Modal ────────────────────────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xxxl + SPACING.sm,
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.base,
    gap: SPACING.sm,
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    flexShrink: 0,
  },
  modalScroll: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.xxxl + SPACING.xl,
  },

  // ── Sections ─────────────────────────────────────────────────────────────────
  sectionBlock: {
    marginBottom: SPACING.xl,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    flex: 1,
  },
  sectionTypePill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  sectionTypeLabel: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingRight: SPACING.xs,
  },
  bulletDot: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text.muted,
    marginTop: 1,
  },
  bulletText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 22,
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────────
  quizBlock: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface.glassBorder,
    paddingTop: SPACING.xl,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  quizTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  quizSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginBottom: SPACING.xl,
    lineHeight: 18,
  },
  quizQuestion: {
    marginBottom: SPACING.xl,
  },
  quizQuestionText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  quizOptionLeft: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quizOptionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.surface.glassBorder,
  },
  quizOptionDotSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[500],
  },
  quizOptionText: {
    ...TYPOGRAPHY.body,
    flex: 1,
    lineHeight: 22,
  },
  explanationBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary[500],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  explanationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  quizSubmitButton: {
    backgroundColor: COLORS.primary[500],
    borderRadius: RADIUS.xl,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  quizSubmitButtonDisabled: {
    opacity: 0.45,
  },
  quizSubmitLabel: {
    fontFamily: FONTS.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text.primary,
  },

  // Score card ────────────────────────────────────────────────────────────────
  scoreCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    gap: SPACING.sm,
  },
  scoreBadgeTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gold,
  },
  scoreText: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    lineHeight: 32,
    color: COLORS.text.primary,
  },
  scoreCaption: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
