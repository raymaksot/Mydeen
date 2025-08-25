import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  onLoginNow?: () => void;
};

const COLOR = {
  primary: "#0F766E",
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

export default function RegisterScreen({ onLoginNow }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = useMemo(
    () => fullName.trim() && email.trim() && pwd.trim() && agree,
    [fullName, email, pwd, agree]
  );

  const submit = async () => {
    if (!canSubmit) return;
    try {
      const res = await fetch('http://192.168.18.5:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password: pwd,
        }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const error = await res.json();
        alert(error.message || 'Registration failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const { useRouter } = require('expo-router');
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: COLOR.surface }]}> 
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={{ fontSize: 18 }}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Register Account</Text>
      </View>

      {/* Fields */}
      <View style={{ gap: 16 }}>
        <View>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your name"
            placeholderTextColor={COLOR.muted}
            style={styles.input}
          />
        </View>

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

      {/* Submit */}
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        style={[styles.primaryBtn, !canSubmit && { backgroundColor: COLOR.surfaceMuted }]}
      >
        <Text style={styles.primaryBtnText}>Sign Up</Text>
      </Pressable>

      {/* Agree */}
      <View style={styles.agreeRow}>
        <Pressable
          onPress={() => setAgree((a) => !a)}
          style={[styles.checkbox, agree && { backgroundColor: COLOR.primary, borderColor: COLOR.primary }]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
        >
          {agree && <Text style={{ color: "#fff", fontWeight: "700" }}>✓</Text>}
        </Pressable>
        <Text style={styles.agreeText}>
          I agree to the T&Cs and the processing of information as set out in the Privacy Policy.
        </Text>
      </View>

      <Divider />

      {/* Socials */}
      <View style={{ gap: 12 }}>
        <SocialButton brand="google" label="Sign Up with Google" />
        <SocialButton brand="facebook" label="Sign Up with Facebook" />
      </View>

      {/* Success Modal */}
      <Modal visible={success} transparent animationType="fade" onRequestClose={() => setSuccess(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Text style={{ color: COLOR.primary, fontSize: 28 }}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Create Account Success</Text>
            <Text style={styles.modalText}>
              You have created your account. Please login to enjoy our features right now!
            </Text>
            <Pressable
              onPress={() => {
                setSuccess(false);
                if (onLoginNow) {
                  onLoginNow();
                } else {
                  router.replace('/auth/sign-in');
                }
              }}
              style={[styles.primaryBtn, { marginTop: 16 }]}
            >
              <Text style={styles.primaryBtnText}>Login Now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
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
  primaryBtn: { marginTop: 16, borderRadius: 16, backgroundColor: COLOR.primary, paddingVertical: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLOR.border },
  dividerText: { marginHorizontal: 10, color: COLOR.muted, fontSize: 12, fontWeight: "600" },
  socialBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: COLOR.border, backgroundColor: "#fff",
  },
  socialIcon: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  socialIconText: { fontSize: 14, fontWeight: "700", color: "#111" },
  socialLabel: { fontSize: 14, fontWeight: "700", color: COLOR.textDark },
  agreeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: COLOR.border, alignItems: "center", justifyContent: "center" },
  agreeText: { flex: 1, fontSize: 13, color: COLOR.text },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 320, backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  modalIconWrap: { alignSelf: "center", width: 80, height: 80, borderRadius: 40, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  modalTitle: { marginTop: 14, textAlign: "center", fontSize: 18, fontWeight: "700", color: COLOR.textDark },
  modalText: { marginTop: 6, textAlign: "center", fontSize: 14, color: COLOR.muted },
});
