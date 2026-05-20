import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'expo-router';
import { Palette, Spacing, BorderRadius } from '@/constants/theme';
import { AppButton } from '@/components/ui/AppButton';

export default function SignInView() {
  const [userEmail, setUserEmail] = useState('');
  const [userPass, setUserPass] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!userEmail || !userPass) {
      Alert.alert("Missing Info", "Please enter both your email and password.");
      return;
    }

    setIsBusy(true);
    try {
      await login(userEmail, userPass);
    } catch (err) {
      Alert.alert("Login Failed", "Could not verify credentials. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>SCP Commerce</Text>
            <Text style={styles.subtitle}>B2B Procurement Portal</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Business Email</Text>
            <TextInput 
              style={styles.input}
              placeholder="buyer@company.com"
              placeholderTextColor="#94a3b8"
              value={userEmail}
              onChangeText={setUserEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={userPass}
              onChangeText={setUserPass}
              secureTextEntry
            />

            <AppButton 
              title="Sign In" 
              onPress={handleSignIn} 
              loading={isBusy} 
              style={{ marginTop: Spacing.md }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to the platform? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Create Account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, justifyContent: 'center', padding: Spacing.lg },
  header: { marginBottom: Spacing.xl, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: Palette.primaryDark, marginBottom: Spacing.xs },
  subtitle: { fontSize: 16, color: Palette.subText },
  card: { backgroundColor: Palette.card, padding: Spacing.lg, borderRadius: BorderRadius.lg, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Palette.text, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: { backgroundColor: '#f1f5f9', padding: Spacing.md, borderRadius: BorderRadius.md, fontSize: 16, color: Palette.text, borderWidth: 1, borderColor: Palette.border },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { color: Palette.subText },
  linkText: { color: Palette.primary, fontWeight: '700' }
});
