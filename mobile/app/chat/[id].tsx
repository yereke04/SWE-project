import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api, { Endpoints } from '@/services/api';
import { Palette, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // This is the partner_id
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    // Optional: Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`${Endpoints.chat}/${id}`);
      setMessages(res.data);
    } catch (e) {
      console.log("Chat load error", e);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const textToSend = inputText;
    setInputText(''); // Clear UI immediately
    setSending(true);

    try {
      await api.post(Endpoints.chat, {
        receiver_id: id,
        message_body: textToSend
      });
      await loadMessages();
    } catch (e) {
      console.log("Send failed");
      setInputText(textToSend); // Revert if failed
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[
        styles.msgBubble, 
        isMe ? styles.msgMe : styles.msgThem
      ]}>
        <Text style={[styles.msgText, isMe ? styles.textMe : styles.textThem]}>
          {item.message_body}
        </Text>
        <Text style={[styles.msgTime, isMe ? styles.textMe : styles.textThem]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: Spacing.md }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || sending}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e2e8f0' }, // Slightly darker background for chat
  
  msgBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  msgMe: { alignSelf: 'flex-end', backgroundColor: Palette.primary, borderBottomRightRadius: 2 },
  msgThem: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  
  msgText: { fontSize: 16 },
  textMe: { color: '#fff' },
  textThem: { color: Palette.text },
  
  msgTime: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4, opacity: 0.8 },
  
  inputBar: { flexDirection: 'row', padding: Spacing.md, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 16 },
  sendBtn: { marginLeft: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#cbd5e1' }
});
