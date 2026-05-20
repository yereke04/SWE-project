import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Palette, Spacing, BorderRadius } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';

export default function SignUpView() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  
  // Defaulting to "consumer" (Buyer) for this app
  const [role, setRole] = useState('consumer'); 
  
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !email || !pass) {
      Alert.alert("Incomplete", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await register(email, pass, fullName, role);
      // AuthContext handles the auto-login and redirect
    } catch (e) {
      Alert.alert("Registration Failed", "Email may already be in use.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Join the Network</Text>
            <Text style={styles.subtitle}>Create your buyer profile</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Company / Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Acme Corp Procurement"
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Work Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="name@company.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Create a strong password"
              placeholderTextColor="#94a3b8"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
            />

            <AppButton 
              title="Create Account" 
              onPress={handleRegister} 
              loading={loading} 
              style={{ marginTop: Spacing.lg }}
            />

            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: Spacing.lg 
  },
  header: { marginBottom: Spacing.xl, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: Palette.primaryDark },
  subtitle: { fontSize: 16, color: Palette.subText, marginTop: 4 },
  card: { 
    backgroundColor: Palette.card, 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  label: { 
    fontSize: 14,
    fontWeight: '600', 
    color: Palette.text, 
    marginBottom: Spacing.xs, 
    marginTop: Spacing.md 
  },
  input: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 1, 
    borderColor: Palette.border, 
    padding: Spacing.md, 
    borderRadius: BorderRadius.md,
    fontSize: 16,
    color: Palette.text
  },
  backButton: { 
    marginTop: Spacing.lg, 
    alignItems: 'center',
    padding: Spacing.sm
  },
  backText: { 
    color: Palette.primary, 
    fontWeight: '700' 
  }
});
