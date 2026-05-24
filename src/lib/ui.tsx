/* Design system — Giromei. Tema claro/clean fintech.
   Paleta: Primary verde-petróleo #004B44, Secondary menta #2DD4BF,
   Tertiary slate #1E293B, Neutral #F8FAFC. */
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export const C = {
  bg: "#F8FAFC", // Neutral
  card: "#FFFFFF",
  cardAlt: "#EEF2F6",
  border: "#E2E8F0", // slate-200
  text: "#1E293B", // Tertiary / slate-800
  muted: "#475569", // slate-600
  faint: "#94A3B8", // slate-400
  white: "#004B44", // fundo do CTA primário (verde-petróleo da marca)
  black: "#FFFFFF", // texto/ícone sobre superfícies de marca
  danger: "#DC2626",
  ok: "#004B44",
  accent: "#004B44", // Primary
  accentSoft: "rgba(0,75,68,0.10)",
  success: "#0F766E", // teal-700 — concluído/pago
  warn: "#B45309",
  brand: "#004B44",
  brandSoft: "rgba(0,75,68,0.10)",
  mint: "#2DD4BF", // Secondary — destaque/menta
  mintSoft: "rgba(45,212,191,0.16)",
  gold: "#0F766E", // "valor conquistado" (sem ouro na paleta → teal)
  goldSoft: "rgba(15,118,110,0.12)",
  ai: "#2DD4BF", // identidade do "match por IA" — menta
  aiDeep: "#0F766E",
  aiSoft: "rgba(45,212,191,0.16)",
  dark: "#003A35", // superfícies escuras (resumo/hero)
};

/** Logo da marca (PNG). Troque assets/images/giromei-logo.png pelo arquivo real. */
export const LOGO = require("../../assets/images/giromei-logo.png");

export function Logo({ size = 96 }: { size?: number }) {
  return (
    <Image
      source={LOGO}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="Giromei"
    />
  );
}

export const S = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={st.screen} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function TopBar({ step, total = 6 }: { step?: number; total?: number }) {
  const router = useRouter();
  const canBack = router.canGoBack();
  return (
    <View style={st.topbar}>
      <View style={st.topLeft}>
        {canBack ? (
          <Pressable onPress={() => router.back()} hitSlop={10} style={st.backBtn}>
            <Text style={st.backTxt}>‹ Voltar</Text>
          </Pressable>
        ) : (
          <Brand />
        )}
      </View>
      {step ? (
        <Text style={st.stepTxt}>
          Etapa {step} de {total}
        </Text>
      ) : null}
    </View>
  );
}

export function Brand() {
  return (
    <View style={st.brand}>
      <View style={st.brandMark}>
        <View style={st.brandArc} />
        <Text style={st.brandG}>G</Text>
      </View>
      <Text style={st.brandTxt}>
        Giro<Text style={{ color: C.accent }}>mei</Text>
      </Text>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={st.title}>{children}</Text>;
}
export function H2({ children }: { children: ReactNode }) {
  return <Text style={st.h2}>{children}</Text>;
}
export function Body({ children }: { children: ReactNode }) {
  return <Text style={st.body}>{children}</Text>;
}
export function Muted({ children, style }: { children: ReactNode; style?: any }) {
  return <Text style={[st.muted, style]}>{children}</Text>;
}
export function Label({ children }: { children: ReactNode }) {
  return <Text style={st.label}>{children}</Text>;
}

export function Card({
  children,
  style,
  tone = "default",
}: {
  children: ReactNode;
  style?: ViewStyle;
  tone?: "default" | "highlight" | "locked" | "dark";
}) {
  return (
    <View
      style={[
        st.card,
        tone === "highlight" && st.cardHighlight,
        tone === "locked" && st.cardLocked,
        tone === "dark" && st.cardDark,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "ok" | "danger" | "accent" | "success" | "mint";
}) {
  return (
    <View
      style={[
        st.pill,
        tone === "ok" && { borderColor: C.gold },
        tone === "danger" && { borderColor: C.danger },
        tone === "accent" && { borderColor: C.accent, backgroundColor: C.accentSoft },
        tone === "success" && { borderColor: C.success },
        tone === "mint" && { borderColor: "transparent", backgroundColor: C.mintSoft },
      ]}
    >
      <Text
        style={[
          st.pillTxt,
          tone === "danger" && { color: C.danger },
          tone === "accent" && { color: C.accent },
          tone === "success" && { color: C.success },
          tone === "mint" && { color: C.aiDeep },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function Bar({ value, danger }: { value: number; danger?: boolean }) {
  return (
    <View style={st.barTrack}>
      <View
        style={[
          st.barFill,
          { width: `${Math.max(2, Math.min(100, value * 100))}%` },
          danger && { backgroundColor: C.danger },
        ]}
      />
    </View>
  );
}

export function Btn({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "accent" | "mint";
}) {
  const isGhost = variant === "ghost";
  const isMint = variant === "mint";
  // Menta usa texto escuro (tertiary); demais usam texto sobre marca.
  const onColor = isGhost ? C.text : isMint ? C.dark : C.black;
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        st.btn,
        isGhost
          ? st.btnGhost
          : isMint
            ? st.btnMint
            : variant === "accent"
              ? st.btnAccent
              : st.btnPrimary,
        (disabled || loading) && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={onColor} />
      ) : (
        <Text style={[st.btnTxt, { color: onColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Selo "Calculado por IA" — violeta, identidade exclusiva do match. */
export function AiBadge({ label = "Match por IA" }: { label?: string }) {
  return (
    <View style={st.aiBadge}>
      <Text style={st.aiSpark}>✦</Text>
      <Text style={st.aiBadgeTxt}>{label}</Text>
    </View>
  );
}

/** Barra de match — identidade VIOLETA de IA (destaca-se do azul dos CTAs).
    Preenchimento sólido até `value`% e trecho translúcido até `potential`%.
    Número sempre visível (acessível — nunca cor sozinha). */
export function MatchBar({ value, potential }: { value: number; potential?: number }) {
  const v = Math.max(0, Math.min(100, value));
  const p = potential != null ? Math.max(v, Math.min(100, potential)) : v;
  return (
    <View style={st.matchRow}>
      <View style={st.matchTrack}>
        {p > v ? <View style={[st.matchPotential, { width: `${p}%` }]} /> : null}
        <View style={[st.matchFill, { width: `${v}%` }]} />
      </View>
      <Text style={st.matchNum}>
        {v}%{p > v ? <Text style={st.matchNumPot}>{`  →  ${p}%`}</Text> : null}
      </Text>
    </View>
  );
}

/** "Logo" de instituição financeira — monograma de marca (sem assets).
    Troque por <Image> quando houver os arquivos de logo reais. */
export function InstitutionLogo({
  initials,
  color,
  fg,
  size = 40,
}: {
  initials: string;
  color: string;
  fg: string;
  size?: number;
}) {
  return (
    <View
      style={[
        st.instLogo,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: color },
      ]}
    >
      <Text style={[st.instLogoTxt, { color: fg, fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

/** Toast simples no topo, controlado por prop. */
export function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={st.toastWrap}>
      <View style={st.toast}>
        <Text style={st.toastTxt}>{message}</Text>
      </View>
    </View>
  );
}

/** Stepper vertical de status — círculo accent+✓ se done, contorno accent se
    active, cinza se futuro; linha conectora entre os passos. */
export function StatusStepper({
  steps,
}: {
  steps: { label: string; done: boolean; active: boolean; date?: string }[];
}) {
  return (
    <View style={st.stepperWrap}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const state: "done" | "active" | "future" = s.done
          ? "done"
          : s.active
            ? "active"
            : "future";
        return (
          <View key={s.label} style={st.stepperRow}>
            <View style={st.stepperGutter}>
              <View
                style={[
                  st.stepperDot,
                  state === "done" && st.stepperDotDone,
                  state === "active" && st.stepperDotActive,
                ]}
              >
                {state === "done" ? <Text style={st.stepperCheck}>✓</Text> : null}
              </View>
              {!last ? (
                <View style={[st.stepperLine, s.done && st.stepperLineDone]} />
              ) : null}
            </View>
            <View style={st.stepperBody}>
              <Text
                style={[
                  st.stepperLabel,
                  state === "future" && { color: C.faint },
                  state === "active" && { color: C.accent },
                ]}
              >
                {s.label}
              </Text>
              {s.date ? <Text style={st.stepperDate}>{s.date}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Linha de parcela — ícone+cor+texto por status (nunca cor sozinha). */
export function InstallmentRow({
  n,
  total,
  dueLabel,
  amountLabel,
  status,
}: {
  n: number;
  total: number;
  dueLabel: string;
  amountLabel: string;
  status: "a_vencer" | "paga" | "atrasada";
}) {
  const meta =
    status === "paga"
      ? { icon: "✓", color: C.success, text: "Paga" }
      : status === "atrasada"
        ? { icon: "!", color: C.danger, text: "Atrasada" }
        : { icon: "•", color: C.accent, text: "A vencer" };
  return (
    <View style={st.instRow}>
      <View style={[st.instBadge, { borderColor: meta.color }]}>
        <Text style={[st.instBadgeTxt, { color: meta.color }]}>{meta.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.instTitle}>
          Parcela {n}/{total}
        </Text>
        <Text style={st.instDue}>vence {dueLabel}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[st.instAmount, numStyle]}>{amountLabel}</Text>
        <Text style={[st.instStatus, { color: meta.color }]}>{meta.text}</Text>
      </View>
    </View>
  );
}

/** Stepper numérico +/- (toque ≥44pt). */
export function AmountStepper({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <View style={st.stepperCtrl}>
      <Pressable
        onPress={atMin ? undefined : dec}
        hitSlop={8}
        style={({ pressed }) => [
          st.stepperBtn,
          atMin && { opacity: 0.4 },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={st.stepperBtnTxt}>–</Text>
      </Pressable>
      <Text style={[st.stepperVal, numStyle]}>{value.toLocaleString("pt-BR")}</Text>
      <Pressable
        onPress={atMax ? undefined : inc}
        hitSlop={8}
        style={({ pressed }) => [
          st.stepperBtn,
          atMax && { opacity: 0.4 },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={st.stepperBtnTxt}>+</Text>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: S.lg, paddingBottom: S.xl * 2, gap: S.lg, maxWidth: 720, width: "100%", alignSelf: "center" },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topLeft: { flexDirection: "row", alignItems: "center" },
  backBtn: { paddingVertical: 4, paddingRight: 8 },
  backTxt: { color: C.muted, fontSize: 15, fontWeight: "600" },
  stepTxt: { color: C.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: { height: 28, width: 28, borderRadius: 999, backgroundColor: C.brand, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  brandArc: { position: "absolute", top: -3, right: -3, height: 16, width: 16, borderRadius: 999, borderWidth: 3, borderColor: C.mint, borderLeftColor: "transparent", borderBottomColor: "transparent", transform: [{ rotate: "45deg" }] },
  brandG: { color: C.card, fontWeight: "900", fontSize: 15, lineHeight: 18 },
  brandTxt: { color: C.text, fontWeight: "800", fontSize: 16, letterSpacing: -0.3 },
  title: { color: C.text, fontSize: 28, fontWeight: "800", lineHeight: 32, letterSpacing: -0.5 },
  h2: { color: C.text, fontSize: 18, fontWeight: "800" },
  body: { color: C.muted, fontSize: 15, lineHeight: 22 },
  muted: { color: C.muted, fontSize: 13, lineHeight: 19 },
  label: { color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  card: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: S.md,
    gap: S.sm,
    shadowColor: "#1A202C",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardHighlight: {
    borderColor: C.accent,
    borderWidth: 2,
    backgroundColor: "rgba(0,75,68,0.05)",
    shadowColor: C.accent,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  cardLocked: { opacity: 0.45, shadowOpacity: 0 },
  cardDark: {
    backgroundColor: C.dark,
    borderColor: C.dark,
    shadowColor: C.dark,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pill: { alignSelf: "flex-start", borderColor: C.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillTxt: { color: C.text, fontSize: 11, fontWeight: "700" },
  barTrack: { height: 6, borderRadius: 999, backgroundColor: C.cardAlt, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, backgroundColor: C.accent },
  matchRow: { flexDirection: "row", alignItems: "center", gap: S.sm },
  matchTrack: { flex: 1, height: 10, borderRadius: 999, backgroundColor: C.cardAlt, overflow: "hidden" },
  matchPotential: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, backgroundColor: "rgba(45,212,191,0.30)" },
  matchFill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, backgroundColor: C.ai },
  matchNum: { color: C.aiDeep, fontSize: 14, fontWeight: "900", fontVariant: ["tabular-nums"], minWidth: 36, textAlign: "right" },
  matchNumPot: { color: C.aiDeep, fontWeight: "800" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: C.aiSoft,
    borderColor: "rgba(45,212,191,0.45)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiSpark: { color: C.ai, fontSize: 12, fontWeight: "900" },
  aiBadgeTxt: { color: C.aiDeep, fontSize: 11, fontWeight: "800", letterSpacing: 0.2 },
  instLogo: { alignItems: "center", justifyContent: "center" },
  instLogoTxt: { fontWeight: "900", letterSpacing: -0.5 },
  toastWrap: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", paddingTop: S.lg, zIndex: 50 },
  toast: { backgroundColor: C.card, borderColor: C.accent, borderWidth: 1, borderRadius: 12, paddingHorizontal: S.md, paddingVertical: S.sm, maxWidth: 480 },
  toastTxt: { color: C.text, fontSize: 13, fontWeight: "700", textAlign: "center" },
  btn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: S.lg },
  btnPrimary: { backgroundColor: C.white },
  btnGhost: { backgroundColor: "transparent", borderColor: C.border, borderWidth: 1 },
  btnAccent: { backgroundColor: C.accent },
  btnMint: { backgroundColor: C.mint },
  btnTxt: { fontSize: 16, fontWeight: "800" },
  numLarge: { fontVariant: ["tabular-nums"] },
  stepperWrap: { gap: 0 },
  stepperRow: { flexDirection: "row", gap: S.md },
  stepperGutter: { width: 24, alignItems: "center" },
  stepperDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperDotDone: { backgroundColor: C.accent, borderColor: C.accent },
  stepperDotActive: { borderColor: C.accent, backgroundColor: C.accentSoft },
  stepperCheck: { color: C.black, fontSize: 13, fontWeight: "900" },
  stepperLine: { flex: 1, width: 2, minHeight: 18, backgroundColor: C.border, marginVertical: 2 },
  stepperLineDone: { backgroundColor: C.accent },
  stepperBody: { flex: 1, paddingBottom: S.md, paddingTop: 1 },
  stepperLabel: { color: C.text, fontSize: 14, fontWeight: "700" },
  stepperDate: { color: C.faint, fontSize: 12, fontWeight: "600", marginTop: 1 },
  instRow: { flexDirection: "row", alignItems: "center", gap: S.md, minHeight: 44, paddingVertical: 4 },
  instBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  instBadgeTxt: { fontSize: 13, fontWeight: "900" },
  instTitle: { color: C.text, fontSize: 14, fontWeight: "700" },
  instDue: { color: C.muted, fontSize: 12 },
  instAmount: { color: C.text, fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  instStatus: { fontSize: 11, fontWeight: "800" },
  stepperCtrl: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: S.md },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderColor: C.border,
    borderWidth: 1,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnTxt: { color: C.text, fontSize: 24, fontWeight: "800", lineHeight: 26 },
  stepperVal: { color: C.text, fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"] },
});

/** Estilo utilitário para números monetários grandes (tabular-nums). */
export const numStyle: TextStyle = { fontVariant: ["tabular-nums"] };
