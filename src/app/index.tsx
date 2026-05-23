import { ReactNode } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { Screen, Title, Body, Muted, Btn, C, S } from "@/lib/ui";

export default function LoginScreen() {
  const router = useRouter();

  // Demo: qualquer opção "passa direto" para o fluxo (sem autenticação real).
  const enter = () => router.replace("/intro");

  return (
    <Screen>
      {/* Hero / marca */}
      <View style={ls.hero}>
        <View style={ls.brandRow}>
          <View style={ls.mark}>
            <View style={ls.markDot} />
          </View>
          <Text style={ls.wordmark}>
            giro<Text style={{ color: C.muted }}>mei</Text>
          </Text>
        </View>
        <Title>Capital de giro para quem o banco não enxerga.</Title>
        <Body>
          Entre para formalizar seu negócio, montar seu histórico e destravar crédito justo —
          em minutos.
        </Body>
      </View>

      {/* CTA principal */}
      <View style={{ gap: S.sm }}>
        <Btn label="Criar minha conta grátis" onPress={enter} />

        <View style={ls.divider}>
          <View style={ls.line} />
          <Muted>ou entre com</Muted>
          <View style={ls.line} />
        </View>

        <SocialBtn
          onPress={enter}
          label="Continuar com Google"
          icon={<Text style={[ls.iconTxt, { color: "#4285F4" }]}>G</Text>}
        />
        <SocialBtn
          onPress={enter}
          label="Continuar com Apple"
          icon={<Text style={[ls.iconTxt, { color: C.text }]}></Text>}
        />
        <SocialBtn
          onPress={enter}
          label="Continuar com telefone"
          icon={<Text style={ls.iconEmoji}>📱</Text>}
        />
      </View>

      {/* Já tem conta */}
      <Pressable onPress={enter} hitSlop={8} style={ls.signin}>
        <Muted>
          Já tem conta? <Text style={ls.signinLink}>Entrar</Text>
        </Muted>
      </Pressable>

      {/* Rodapé */}
      <View style={{ gap: S.xs, marginTop: "auto" }}>
        <Muted style={{ textAlign: "center", fontSize: 11 }}>
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade (LGPD).
        </Muted>
        <Muted style={{ textAlign: "center" }}>Em parceria com Feira Preta e SEBRAE</Muted>
      </View>
    </Screen>
  );
}

function SocialBtn({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [ls.social, pressed && { opacity: 0.8 }]}
    >
      <View style={ls.socialIcon}>{icon}</View>
      <Text style={ls.socialTxt}>{label}</Text>
    </Pressable>
  );
}

const ls = StyleSheet.create({
  hero: { gap: S.sm, marginTop: S.lg, marginBottom: S.sm },
  brandRow: { flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.sm },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  markDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: C.card },
  wordmark: { color: C.text, fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  divider: { flexDirection: "row", alignItems: "center", gap: S.sm, paddingVertical: S.xs },
  line: { flex: 1, height: 1, backgroundColor: C.border },
  social: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.md,
    height: 52,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: C.card,
    paddingHorizontal: S.md,
  },
  socialIcon: { width: 24, alignItems: "center", justifyContent: "center" },
  iconTxt: { fontSize: 18, fontWeight: "900" },
  iconEmoji: { fontSize: 18 },
  socialTxt: { color: C.text, fontSize: 15, fontWeight: "700", flex: 1, textAlign: "center", marginRight: 24 },
  signin: { alignItems: "center", paddingVertical: S.sm },
  signinLink: { color: C.accent, fontWeight: "800" },
});
