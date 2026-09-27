import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { StatusBar } from "expo-status-bar";

type NoteDepth = "quick" | "full";

type GeneratedNotes = {
  title: string;
  points: string[];
  terms: string[];
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "with",
  "from",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "into",
  "about",
  "there",
  "their",
  "which",
  "what",
  "when",
  "where",
  "your",
  "you",
  "they",
  "them",
  "then",
  "than",
  "will",
  "would",
  "could",
  "should",
  "is",
  "in",
  "of",
  "to",
  "a",
  "an",
  "on",
  "at",
  "as",
  "it",
  "be",
  "by",
  "or",
  "if",
  "we",
  "he",
  "she",
  "his",
  "her",
  "its",
  "के",
  "का",
  "की",
  "और",
  "में",
  "से",
  "को",
  "है",
  "यह",
  "वह",
  "एक",
]);

function makeNotes(text: string, depth: NoteDepth): GeneratedNotes {
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      title: "Your Study Notes",
      points: [
        "Add some study text first.",
        "You can paste a chapter, topic, or lecture notes here.",
      ],
      terms: [],
    };
  }

  const sentences = cleanText
    .split(/[.!?।]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 15);

  const words = cleanText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 4 &&
        !STOP_WORDS.has(word)
    );

  const frequency: Record<string, number> = {};

  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  const terms = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  const maxPoints = depth === "quick" ? 5 : 10;

  const points =
    sentences.length > 0
      ? sentences.slice(0, maxPoints).map((sentence) => {
          const trimmed =
            sentence.length > 180
              ? `${sentence.slice(0, 177)}...`
              : sentence;

          return trimmed;
        })
      : [
          "Your content was received successfully.",
          "The next version will use an AI model to generate structured notes.",
        ];

  return {
    title: "Generated Study Notes",
    points,
    terms,
  };
}

export default function App() {
  const [text, setText] = useState("");
  const [depth, setDepth] = useState<NoteDepth>("quick");
  const [fileName, setFileName] = useState<string | null>(null);
  const [notes, setNotes] = useState<GeneratedNotes | null>(null);
  const [loading, setLoading] = useState(false);

  const characterCount = useMemo(
    () => text.length,
    [text]
  );

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "text/plain",
          "text/*",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset) {
        return;
      }

      setFileName(asset.name);

      Alert.alert(
        "File selected",
        `${asset.name}\n\nThe PDF/text extraction + AI processing will be connected in the next version.`
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not open the document picker."
      );
    }
  }

  function generateNotes() {
    if (!text.trim() && !fileName) {
      Alert.alert(
        "Add content",
        "Paste your study material or select a document first."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const generated = makeNotes(
        text ||
          `Study material from ${fileName ?? "selected document"}.`,
        depth
      );

      setNotes(generated);
      setLoading(false);
    }, 700);
  }

  function clearAll() {
    setText("");
    setFileName(null);
    setNotes(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>NoteForge AI</Text>
            <Text style={styles.subtitle}>
              Turn study material into smart notes.
            </Text>
          </View>

          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSmall}>
            STUDY SMARTER
          </Text>

          <Text style={styles.heroTitle}>
            Learn less randomly.
            {"\n"}
            Remember more.
          </Text>

          <Text style={styles.heroDescription}>
            Create structured study notes from your
            chapters, lectures and study material.
          </Text>
        </View>

        {/* Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Add your material
          </Text>

          <Pressable
            style={styles.uploadButton}
            onPress={pickDocument}
          >
            <View style={styles.uploadIcon}>
              <Text style={styles.uploadIconText}>+</Text>
            </View>

            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadTitle}>
                Choose a document
              </Text>

              <Text style={styles.uploadSubtitle}>
                PDF or text file
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>

          {fileName && (
            <View style={styles.fileCard}>
              <Text style={styles.fileIcon}>📄</Text>

              <View style={styles.fileInfo}>
                <Text
                  style={styles.fileName}
                  numberOfLines={1}
                >
                  {fileName}
                </Text>

                <Text style={styles.fileStatus}>
                  Selected
                </Text>
              </View>

              <Pressable
                onPress={() => setFileName(null)}
              >
                <Text style={styles.removeText}>
                  Remove
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Text input */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>
              Or paste your text
            </Text>

            <Text style={styles.counter}>
              {characterCount}
            </Text>
          </View>

          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            placeholder="Paste a chapter, lesson, article or lecture notes here..."
            placeholderTextColor="#9A9AAF"
            style={styles.textInput}
          />
        </View>

        {/* Note depth */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Choose note depth
          </Text>

          <View style={styles.depthContainer}>
            <Pressable
              style={[
                styles.depthButton,
                depth === "quick" &&
                  styles.depthButtonActive,
              ]}
              onPress={() => setDepth("quick")}
            >
              <Text
                style={[
                  styles.depthTitle,
                  depth === "quick" &&
                    styles.depthTitleActive,
                ]}
              >
                ⚡ Quick
              </Text>

              <Text
                style={[
                  styles.depthDescription,
                  depth === "quick" &&
                    styles.depthDescriptionActive,
                ]}
              >
                60-second revision
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.depthButton,
                depth === "full" &&
                  styles.depthButtonActive,
              ]}
              onPress={() => setDepth("full")}
            >
              <Text
                style={[
                  styles.depthTitle,
                  depth === "full" &&
                    styles.depthTitleActive,
                ]}
              >
                📚 Full
              </Text>

              <Text
                style={[
                  styles.depthDescription,
                  depth === "full" &&
                    styles.depthDescriptionActive,
                ]}
              >
                Detailed study notes
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Generate */}
        <Pressable
          style={[
            styles.generateButton,
            loading && styles.generateButtonDisabled,
          ]}
          onPress={generateNotes}
          disabled={loading}
        >
          <Text style={styles.generateButtonText}>
            {loading
              ? "Generating..."
              : "Generate Notes  ✦"}
          </Text>
        </Pressable>

        {/* Notes */}
        {notes && (
          <View style={styles.notesSection}>
            <View style={styles.notesHeader}>
              <View>
                <Text style={styles.notesLabel}>
                  YOUR NOTES
                </Text>

                <Text style={styles.notesTitle}>
                  {notes.title}
                </Text>
              </View>

              <Pressable onPress={clearAll}>
                <Text style={styles.clearText}>
                  Clear
                </Text>
              </Pressable>
            </View>

            {/* Key points */}
            <View style={styles.notesCard}>
              <Text style={styles.cardTitle}>
                Key Points
              </Text>

              {notes.points.map((point, index) => (
                <View
                  key={`${point}-${index}`}
                  style={styles.pointRow}
                >
                  <View style={styles.pointNumber}>
                    <Text style={styles.pointNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.pointText}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>

            {/* Terms */}
            {notes.terms.length > 0 && (
              <View style={styles.notesCard}>
                <Text style={styles.cardTitle}>
                  Key Terms
                </Text>

                <View style={styles.termsContainer}>
                  {notes.terms.map((term) => (
                    <View
                      key={term}
                      style={styles.term}
                    >
                      <Text style={styles.termText}>
                        {term}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Future tools */}
            <View style={styles.toolsRow}>
              <Pressable
                style={styles.toolButton}
                onPress={() =>
                  Alert.alert(
                    "Coming soon",
                    "AI flashcards will be added next."
                  )
                }
              >
                <Text style={styles.toolIcon}>🧠</Text>
                <Text style={styles.toolText}>
                  Flashcards
                </Text>
              </Pressable>

              <Pressable
                style={styles.toolButton}
                onPress={() =>
                  Alert.alert(
                    "Coming soon",
                    "AI-generated MCQ tests will be added next."
                  )
                }
              >
                <Text style={styles.toolIcon}>✓</Text>
                <Text style={styles.toolText}>
                  MCQ Test
                </Text>
              </Pressable>

              <Pressable
                style={styles.toolButton}
                onPress={() =>
                  Alert.alert(
                    "Coming soon",
                    "PDF export will be added next."
                  )
                }
              >
                <Text style={styles.toolIcon}>↗</Text>
                <Text style={styles.toolText}>
                  Export
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          NoteForge AI • Study smarter
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#17172B",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#77778B",
  },

  aiBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
  },

  aiBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  heroCard: {
    backgroundColor: "#6C5CE7",
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
  },

  heroSmall: {
    color: "#DCD8FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },

  heroDescription: {
    color: "#E8E5FF",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#202035",
    marginBottom: 12,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  counter: {
    fontSize: 12,
    color: "#9A9AAF",
    marginBottom: 12,
  },

  uploadButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E4F0",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  uploadIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EEEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadIconText: {
    fontSize: 27,
    fontWeight: "500",
    color: "#6C5CE7",
  },

  uploadTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  uploadTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#27273A",
  },

  uploadSubtitle: {
    fontSize: 12,
    color: "#8A8A9E",
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: "#A0A0B2",
  },

  fileCard: {
    marginTop: 10,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#EEECFF",
    flexDirection: "row",
    alignItems: "center",
  },

  fileIcon: {
    fontSize: 22,
  },

  fileInfo: {
    flex: 1,
    marginLeft: 10,
  },

  fileName: {
    color: "#29283C",
    fontSize: 13,
    fontWeight: "700",
  },

  fileStatus: {
    color: "#6C5CE7",
    fontSize: 11,
    marginTop: 2,
  },

  removeText: {
    color: "#E05252",
    fontSize: 12,
    fontWeight: "700",
  },

  textInput: {
    minHeight: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E4F0",
    padding: 16,
    color: "#252538",
    fontSize: 14,
    lineHeight: 21,
  },

  depthContainer: {
    flexDirection: "row",
    gap: 10,
  },

  depthButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E4F0",
    borderRadius: 16,
    padding: 15,
  },

  depthButtonActive: {
    borderColor: "#6C5CE7",
    backgroundColor: "#EEECFF",
  },

  depthTitle: {
    color: "#303044",
    fontSize: 14,
    fontWeight: "800",
  },

  depthTitleActive: {
    color: "#5D4DD2",
  },

  depthDescription: {
    color: "#9090A2",
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  depthDescriptionActive: {
    color: "#7164C9",
  },

  generateButton: {
    backgroundColor: "#17172B",
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 28,
  },

  generateButtonDisabled: {
    opacity: 0.65,
  },

  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  notesSection: {
    marginBottom: 10,
  },

  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  notesLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#6C5CE7",
  },

  notesTitle: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: "800",
    color: "#202035",
  },

  clearText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E05252",
  },

  notesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9E8F1",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#252538",
    marginBottom: 
