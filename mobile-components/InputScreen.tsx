import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Mic, Layers, ChevronRight } from 'lucide-react-native';
import { IntentSeed as UserInput, OutcomeExemplar } from '../../types/domain';
import { BLEND_SCENARIOS, BlendScenario } from '../../data/presetBlends';
import { PRESET_STACKS } from '../../data/presetStacks';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface InputScreenProps {
    onSubmit: (input: UserInput) => void;
    onBrowsePresets: () => void;
    onSelectPreset: (exemplar: OutcomeExemplar | BlendScenario) => void;
    onAdminModeToggle: () => void;
    isAdminMode: boolean;
    initialText?: string;
}

export function InputScreen({
    onSubmit,
    onBrowsePresets,
    onSelectPreset,
    onAdminModeToggle,
    isAdminMode,
    initialText,
}: InputScreenProps) {
    const AVAILABLE_MODES = ['describe', 'strain'] as const;
    type AvailableMode = typeof AVAILABLE_MODES[number];

    const [mode, setMode] = useState<AvailableMode>('describe');
    const [description, setDescription] = useState('');
    const [strainName, setStrainName] = useState('');
    const [growerName, setGrowerName] = useState('');
    const [logoTapCount, setLogoTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    useEffect(() => {
        if (initialText) {
            setDescription(initialText);
            setMode('describe');
        }
    }, [initialText]);

    const canSubmit = () => {
        if (mode === 'describe') return description.length > 2;
        if (mode === 'strain') return strainName.length > 2;
        return false;
    };

    const handleSubmit = () => {
        if (!canSubmit()) return;

        const text =
            mode === 'describe'
                ? description
                : `${strainName}${growerName ? ' by ' + growerName : ''}`.trim();

        // Temporal keywords for stack detection
        const temporalKeywords = [
            'then',
            'after',
            'followed by',
            'later',
            'secondly',
            'morning',
            'night',
            'evening',
            'day',
            'start',
            'end',
            'wind down',
            'winding down',
            'transition',
            'phase',
            'first',
            'next',
            'finally',
            'throughout',
        ];

        const lowerText = text.toLowerCase();
        const isStackRequest = temporalKeywords.some((kw) => {
            const regex = new RegExp(`\\b${kw}\\b`, 'i');
            return regex.test(lowerText);
        });

        const input: UserInput = {
            kind: isStackRequest ? 'stack' : 'blend',
            mode: mode === 'strain' ? 'strain' : 'engine',
            text,
            strainName: mode === 'strain' ? strainName : undefined,
            grower: mode === 'strain' ? growerName : undefined,
        };

        console.log('[InputScreen] Detected kind:', input.kind);
        onSubmit(input);
    };

    const handleLogoPress = () => {
        const now = Date.now();
        if (now - lastTapTime > 1000) {
            setLogoTapCount(1);
        } else {
            const newCount = logoTapCount + 1;
            setLogoTapCount(newCount);
            if (newCount >= 6) {
                onAdminModeToggle();
                setLogoTapCount(0);
            }
        }
        setLastTapTime(now);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.7}>
                    <Text style={styles.logoText}>StrainMath™</Text>
                </TouchableOpacity>

                <Text style={styles.title}>How do you want to feel?</Text>
                <Text style={styles.subtitle}>
                    DESCRIBE YOUR GOAL OR PICK A CURATED PATH
                </Text>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {AVAILABLE_MODES.map((t) => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setMode(t)}
                            style={[
                                styles.tab,
                                mode === t ? styles.tabActive : styles.tabInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    mode === t ? styles.tabTextActive : styles.tabTextInactive,
                                ]}
                            >
                                {t === 'describe' ? 'DESCRIBE' : 'STRAIN'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Input Area */}
                {mode === 'describe' && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textArea}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe how you want to feel, what you want to avoid, or a scenario..."
                            placeholderTextColor="rgba(255, 255, 255, 0.2)"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                )}

                {mode === 'strain' && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={strainName}
                            onChangeText={setStrainName}
                            placeholder="Strain Name (e.g. Jack Herer)"
                            placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        />
                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            value={growerName}
                            onChangeText={setGrowerName}
                            placeholder="Brand/Grower (Optional)"
                            placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        />
                    </View>
                )}

                {/* Scenarios */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>SELECT SCENARIO</Text>
                        <Text style={styles.sectionHint}>Swipe Left</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardScroll}
                    >
                        {BLEND_SCENARIOS.map((scenario: BlendScenario) => (
                            <TouchableOpacity
                                key={scenario.id}
                                style={styles.scenarioCard}
                                onPress={() => {
                                    setMode('describe');
                                    setDescription(scenario.inputText);
                                }}
                            >
                                <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                                <Text style={styles.scenarioSubtitle}>{scenario.subtitle}</Text>
                                <Text style={styles.scenarioText} numberOfLines={3}>
                                    "{scenario.inputText}"
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Curated Stacks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>CURATED STACKS</Text>
                        <TouchableOpacity onPress={onBrowsePresets}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cardScroll}
                    >
                        {PRESET_STACKS.slice(0, 4).map((stack: any) => (
                            <TouchableOpacity
                                key={stack.id}
                                style={styles.stackCard}
                                onPress={() => onSelectPreset(stack)}
                            >
                                <View style={styles.stackHeader}>
                                    <View style={styles.stackIcon}>
                                        <Layers size={18} color={Colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.stackTitle}>
                                            {stack.title || stack.name}
                                        </Text>
                                        <Text style={styles.stackDescription} numberOfLines={3}>
                                            {stack.subtitle || stack.description}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.stackLabel}>LAYERED PROTOCOL</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            {canSubmit() && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleSubmit}
                    activeOpacity={0.9}
                >
                    <ChevronRight size={20} color="#000" />
                    <Text style={styles.fabText}>GENERATE</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    logoText: {
        fontSize: 20,
        color: Colors.primary,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '300',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: Colors.primary,
    },
    tabInactive: {
        backgroundColor: 'transparent',
    },
    tabText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    tabTextActive: {
        color: '#000',
    },
    tabTextInactive: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    inputContainer: {
        marginTop: 20,
    },
    textArea: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 14,
        minHeight: 112,
        textAlignVertical: 'top',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 14,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.accent,
        letterSpacing: 2,
    },
    sectionHint: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.2)',
        letterSpacing: 1.5,
    },
    seeAll: {
        fontSize: 8,
        color: Colors.primary,
        letterSpacing: 1.5,
    },
    cardScroll: {
        paddingRight: 24,
    },
    scenarioCard: {
        width: width * 0.85,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginRight: 16,
        minHeight: 140,
    },
    scenarioTitle: {
        fontSize: 16,
        fontWeight: '300',
        color: '#fff',
        marginBottom: 4,
    },
    scenarioSubtitle: {
        fontSize: 9,
        color: Colors.primary,
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    scenarioText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    stackCard: {
        width: width * 0.75,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginRight: 16,
        minHeight: 120,
    },
    stackHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    stackIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 255, 209, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 209, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stackTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 4,
    },
    stackDescription: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.4)',
        lineHeight: 12,
    },
    stackLabel: {
        fontSize: 8,
        color: 'rgba(255, 255, 255, 0.3)',
        letterSpacing: 1.5,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 24,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    fabText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
});
