import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  onForgotPassword?: () => void;
  onRegisterNow?: () => void;
};

const COLOR = {
  primary: "#0F766E", // emerald-700 vibe
  primaryHover: "#0A5F57",
  textDark: "#111827",
  text: "#374151",
  muted: "#6B7280",
  border: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F4F6",
};

const Divider = () => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>Or</Text>
    <View style={styles.dividerLine} />
  </View>
);

const SocialButton = ({
  label,
  brand,
  onPress,
}: {
  label: string;
  brand: "google" | "facebook";
  onPress?: () => void;
}) => (
  <Pressable onPress={onPress} style={styles.socialBtn}>
    <View style={styles.socialIcon}>
      <Text style={[styles.socialIconText, brand === "facebook" && { color: "#1877F2" }]}>
        {brand === "google" ? "G" : "f"}
      </Text>
    </View>
    <Text style={styles.socialLabel}>{label}</Text>
  </Pressable>
);

export default function SignInScreen({ onForgotPassword, onRegisterNow }: Props) {
  const { useRouter } = require('expo-router');
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 0 && pwd.trim().length > 0 && !loading, [email, pwd, loading]);

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch('http://192.168.18.5:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: pwd,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setToast('Successfully signed in');
        // Здесь можно сохранить токен: await SecureStore.setItemAsync('token', data.token);
        // И вызвать событие авторизации: authEmitter.emit('auth-success');
        setTimeout(() => {
          router.replace('/'); // переход на home screen
        }, 800);
      } else {
        const error = await res.json();
        setToast(error.message || 'Login failed');
      }
    } catch (err) {
      setToast('Network error');
    }
    setLoading(false);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: COLOR.surface }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={{ fontSize: 18 }}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Sign In Account</Text>
        </View>

        {/* Fields */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={COLOR.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View>
            <Text style={styles.label}>Password</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={pwd}
                onChangeText={setPwd}
                placeholder="Enter your password"
                placeholderTextColor={COLOR.muted}
                secureTextEntry={!show}
                style={[styles.input, { paddingRight: 44 }]}
              />
              <Pressable
                onPress={() => setShow((s) => !s)}
                style={styles.eyeBtn}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Toggle password visibility"
              >
                <Text style={{ color: COLOR.muted }}>{show ? "🙈" : "👁️"}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Forgot */}
        <View style={{ alignItems: "flex-end", marginTop: 8 }}>
          <Pressable onPress={onForgotPassword}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && { backgroundColor: COLOR.surfaceMuted }]}
        >
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.primaryBtnText}>Processing…</Text>
            </View>
          ) : (
            <Text style={styles.primaryBtnText}>Sign in</Text>
          )}
        </Pressable>

        <Divider />

        {/* Socials */}
        <View style={{ gap: 12 }}>
          <SocialButton brand="google" label="Sign Up with Google" />
          <SocialButton brand="facebook" label="Sign Up with Facebook" />
        </View>

        {/* Register link */}
        <Text style={styles.bottomHint}>
          Doesn’t Have an Account?{" "}
          <Text onPress={() => router.push('/auth/register')} style={{ color: COLOR.primary, fontWeight: "600" }}>
            Register Now
          </Text>
        </Text>

        {/* Toast */}
        {toast && (
          <View style={styles.toast}>
            <View style={styles.dot} />
            <Text style={{ color: "#fff" }}>{toast}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  backBtn: {
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
    borderRadius: 18, borderWidth: 1, borderColor: COLOR.border,
  },
  title: { fontSize: 18, fontWeight: "600", color: COLOR.textDark },
  label: { marginBottom: 8, fontSize: 13, color: COLOR.text, fontWeight: "500" },
  input: {
    borderWidth: 1, borderColor: COLOR.border, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLOR.textDark, backgroundColor: COLOR.surface,
  },
  eyeBtn: { position: "absolute", right: 10, top: 0, bottom: 0, justifyContent: "center" },
  forgot: { color: COLOR.muted, fontSize: 13, fontWeight: "600" },
  primaryBtn: {
    marginTop: 16, borderRadius: 16, backgroundColor: COLOR.primary,
    paddingVertical: 14, alignItems: "center", justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLOR.border },
  dividerText: { marginHorizontal: 10, color: COLOR.muted, fontSize: 12, fontWeight: "600" },
  socialBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: COLOR.border, backgroundColor: "#fff",
  },
  socialIcon: {
    width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  socialIconText: { fontSize: 14, fontWeight: "700", color: "#111" },
  socialLabel: { fontSize: 14, fontWeight: "700", color: COLOR.textDark },
  bottomHint: { marginTop: 16, textAlign: "center", color: COLOR.muted },
  toast: {
    position: "absolute", left: 24, right: 24, bottom: 24, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 999, backgroundColor: "rgba(17,24,39,0.92)", flexDirection: "row", alignItems: "center", gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#34D399" },
});
