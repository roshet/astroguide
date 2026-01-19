import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Linking, Alert, useColorScheme, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendChatMessage } from "../services/api";

const CHAT_STORAGE_KEY = "astroguide_chat_history";
const THEME_STORAGE_KEY = "astroguide_theme"

function getDisplayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

type ChatMessage = {
  role:"user" | "assistant";
  content: string;
  sources?: string[];
};

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [level, setLevel] = useState<"beginner" | "advanced">("beginner");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const loadTheme = async() => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        } else if (systemTheme === "dark") {
          setTheme("dark");
        }
      } catch (err) {
        console.warn("Failed to load theme", err);
      }
    };

    loadTheme();
  }, [systemTheme]);

  useEffect(() => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(CHAT_STORAGE_KEY);

        if (saved) {
          const parsedMessages = JSON.parse(saved);
          setMessages(parsedMessages);
        }
      } catch (err) {
        console.warn("Failed to load chat history", err);
      }
    };

    loadChatHistory();
  }, []);

  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        await AsyncStorage.setItem(
          CHAT_STORAGE_KEY,
          JSON.stringify(messages)
        );
      } catch (err) {
        console.warn("Failed to save chat history", err);
      }
    };

    saveChatHistory();
  }, [messages]);

  const handleClearChat = async () => {
    Alert.alert(
      "Clear chat?",
      "This will permanently delete the conversation.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setMessages([]);
              await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
            } catch (err) {
              console.warn("Failed to clear chat history", err);
            }
          },
        },
      ]
    );
  };

  async function handleSend() {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    setMessage("")

    const history = messages
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const data = await sendChatMessage(message, level, history);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role:"assistant",
        content: "Error contacting AtroGuide backend."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  const lightTheme = {
    background: "#f8f8f8",
    text: "#000",
    card: "#fff",
    userBubble: "#DCF8C6",
    assistantBubble: "#E5E5EA",
    inputBackground: "#fff",
    placeholder: "#666",
  };

  const darkTheme = {
    background: "#121212",
    text: "#fff",
    card: "#1e1e1e",
    userBubble: "#2e7d32",
    assistantBubble: "#2a2a2a",
    inputBackground: "#1e1e1e",
    placeholder: "#888",
  };

  const themeColors = theme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaView style = {{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar style = {theme === "dark" ? "light" : "dark"} />
      
      <KeyboardAvoidingView
        style = {{flex: 1}}
        behavior = {Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset = {Platform.OS == "ios" ? 80 : 0}
      >
        <View style={[styles.container, {backgroundColor: themeColors.background}]}>
          <View style = {styles.header}>
            <Text style={[styles.title, {color: themeColors.text}]}>
              AstroGuide 🌌
            </Text>

            <View style = {{flexDirection: "row", alignItems: "center", gap: 12}}>
              <TouchableOpacity
                onPress = {() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Text style = {{ color: themeColors.text, fontSize: 18}}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress = {handleClearChat}>
                <Text style = {styles.clearButtonText}>Clear Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style = {styles.levelToggle}>
            <Text style = {[styles.levelLabel, {color: themeColors.text}]}>Learning level:</Text>

            <View style = {styles.toggleContainer}>
              <Text
                style = {[
                  styles.toggleOption,
                  level === "beginner" && styles.activeToggle
                ]}
                onPress = {() => setLevel("beginner")}
              >
                Beginner
              </Text>

              <Text
                style = {[
                  styles.toggleOption,
                  level === "advanced" && styles.activeToggle,
                ]}
                onPress = {() => setLevel("advanced")}
              >
                Advanced
              </Text>
            </View>
          </View>

          <ScrollView 
            style = {styles.chatContainer}
            contentContainerStyle = {{ paddingBottom: 12 }}
            ref = {scrollViewRef}
            keyboardShouldPersistTaps = "handled"
            onContentSizeChange={() => 
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg, index) => (
              <View
                key = {index}
                style = {[
                  styles.message,
                  msg.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage,
                  {
                    backgroundColor:
                      msg.role === "user"
                        ? themeColors.userBubble
                        : themeColors.assistantBubble,
                  },
                ]}
              >
                
                <Text style = {[styles.messageText, {color: themeColors.text}]}>{msg.content}</Text>

                {msg.role === "assistant" &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <View style = {styles.sourcesContainer} >
                        <Text style = {[styles.sourcesTitle, {color: themeColors.text}]}>Sources:</Text>

                      <Text style = {styles.sourcesDisclaimer}>
                        Links are provided for reference and may change over time.
                      </Text>

                      {msg.sources.map((url, i) => (
                        <TouchableOpacity
                          key = {i}
                          onPress = {() => Linking.openURL(url)}
                        >
                          <Text style = {styles.sourceItem}>
                            • {getDisplayDomain(url)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
              </View>
            ))}
          </ScrollView>

          <TextInput
            style={[styles.input,
              {
                backgroundColor: themeColors.inputBackground,
                color: themeColors.text,
              },
            ]}
            placeholder="Ask a space question..."
            placeholderTextColor={themeColors.placeholder}
            value={message}
            onChangeText={setMessage}
            editable = {!loading}
          />

          <Button 
            title = {loading ? "Thinking..." : "Send"}
            onPress = {handleSend}
            disabled = {loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f8f8",
    flex: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 15,
  },
  message: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: "80%",
    fontSize: 16,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 6,
  },
  levelToggle: {
    marginBottom: 10,
  },
  levelLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
  },
  toggleOption: {
    flex:1,
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 16,
    color: "#007AFF",
    backgroundColor: "#fff"
  },
  activeToggle: {
    backgroundColor: "#007AFF",
    color: "#fff",
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
  },
  sourcesContainer: {
    marginTop: 6,
  },
  sourcesTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  sourceItem: {
    fontSize: 13,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  sourcesDisclaimer: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clearButtonText: {
    color: "#ff3b30",
    fontSize: 14,
  },
});