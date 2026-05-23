/* ---------------------------------------------------------------------------
   Design system enxuto — tema CLARO, editorial. Fundo branco, hierarquia em
   cinzas, acento azul confiável. Componentes self-contained.
--------------------------------------------------------------------------- */
import { ReactNode } from "react";
import {
  ActivityIndicator,
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
  bg: "#F4F6F9", // fundo de tela — branco levemente azulado
  card: "#FFFFFF", // card elevado (separação por sombra)
  cardAlt: "#EDF0F5", // input / track de barra (recesso sobre branco)
  border: "#DDE2EA", // borda sutil / separadores
  text: "#0F1117", // texto principal (~17:1)
  muted: "#4A5568", // texto secundário (~7:1, AAA)
  faint: "#718096", // texto terciário / desabilitado (AA sobre card)
  white: "#3D7BFF", // FUNDO do CTA primário (papel: cor de contraste alto)
  black: "#FFFFFF", // texto SOBRE o CTA primário
  danger: "#C0392B", // erro (AA)
  ok: "#3D7BFF",
  accent: "#2563EB", // azul de destaque (best match, match, links) — AA robusto
  accentSoft: "rgba(37,99,235,0.10)",
  success: "#1A7A4A", // verde (AA sobre branco)
  warn: "#B45309", // âmbar (AA sobre branco)
};

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
        <View style={st.brandDot} />
      </View>
      <Text style={st.brandTxt}>
        giro<Text style={{ color: C.muted }}>mei</Text>
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
  tone?: "default" | "highlight" | "locked";
}) {
  return (
    <View
      style={[
        st.card,
        tone === "highlight" && st.cardHighlight,
        tone === "locked" && st.cardLocked,
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
  tone?: "default" | "ok" | "danger" | "accent" | "success";
}) {
  return (
    <View
      style={[
        st.pill,
        tone === "ok" && { borderColor: C.white },
        tone === "danger" && { borderColor: C.danger },
        tone === "accent" && { borderColor: C.accent, backgroundColor: C.accentSoft },
        tone === "success" && { borderColor: C.success },
      ]}
    >
      <Text
        style={[
          st.pillTxt,
          tone === "danger" && { color: C.danger },
          tone === "accent" && { color: C.accent },
          tone === "success" && { color: C.success },
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
  variant?: "primary" | "ghost" | "accent";
}) {
  const isGhost = variant === "ghost";
  const isAccent = variant === "accent";
  const spinnerColor = isGhost ? C.text : isAccent ? C.white : C.black;
  const labelColor = isGhost ? C.text : isAccent ? C.white : C.black;
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        st.btn,
        isGhost ? st.btnGhost : isAccent ? st.btnAccent : st.btnPrimary,
        (disabled || loading) && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text style={[st.btnTxt, { color: labelColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Barra de match: preenchimento sólido azul até `value`% e trecho translúcido
    até `potential`%. Número sempre visível (acessível — nunca cor sozinha). */
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
  brandMark: { height: 26, width: 26, borderRadius: 7, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  brandDot: { height: 9, width: 9, borderRadius: 5, backgroundColor: C.black },
  brandTxt: { color: C.text, fontWeight: "800", fontSize: 15 },
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
    backgroundColor: "rgba(37,99,235,0.06)",
    shadowColor: C.accent,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  cardLocked: { opacity: 0.45, shadowOpacity: 0 },
  pill: { alignSelf: "flex-start", borderColor: C.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillTxt: { color: C.text, fontSize: 11, fontWeight: "700" },
  barTrack: { height: 6, borderRadius: 999, backgroundColor: C.cardAlt, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, backgroundColor: C.accent },
  matchRow: { flexDirection: "row", alignItems: "center", gap: S.sm },
  matchTrack: { flex: 1, height: 8, borderRadius: 999, backgroundColor: C.cardAlt, overflow: "hidden" },
  matchPotential: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, backgroundColor: C.accentSoft },
  matchFill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, backgroundColor: C.accent },
  matchNum: { color: C.text, fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"], minWidth: 36, textAlign: "right" },
  matchNumPot: { color: C.accent, fontWeight: "700" },
  toastWrap: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", paddingTop: S.lg, zIndex: 50 },
  toast: { backgroundColor: C.card, borderColor: C.accent, borderWidth: 1, borderRadius: 12, paddingHorizontal: S.md, paddingVertical: S.sm, maxWidth: 480 },
  toastTxt: { color: C.text, fontSize: 13, fontWeight: "700", textAlign: "center" },
  btn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: S.lg },
  btnPrimary: { backgroundColor: C.white },
  btnGhost: { backgroundColor: "transparent", borderColor: C.border, borderWidth: 1 },
  btnAccent: { backgroundColor: C.accent },
  btnTxt: { fontSize: 16, fontWeight: "800" },
  numLarge: { fontVariant: ["tabular-nums"] },
  // StatusStepper
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
  stepperCheck: { color: C.white, fontSize: 13, fontWeight: "900" },
  stepperLine: { flex: 1, width: 2, minHeight: 18, backgroundColor: C.border, marginVertical: 2 },
  stepperLineDone: { backgroundColor: C.accent },
  stepperBody: { flex: 1, paddingBottom: S.md, paddingTop: 1 },
  stepperLabel: { color: C.text, fontSize: 14, fontWeight: "700" },
  stepperDate: { color: C.faint, fontSize: 12, fontWeight: "600", marginTop: 1 },
  // InstallmentRow
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
  // AmountStepper
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
