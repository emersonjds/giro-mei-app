import { useMemo } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { computeCredit, formatBRL } from "@/lib/data";
import { CREDIT_PURPOSES, CreditPurpose } from "@/lib/credit";
import {
  Screen,
  TopBar,
  Title,
  Body,
  Muted,
  Label,
  Card,
  Btn,
  AmountStepper,
  C,
  S,
  numStyle,
} from "@/lib/ui";

const PRESETS = [5000, 10000, 20000, 30000, 50000];
const MIN = 1000;
const MAX = 60000;
const STEP = 1000;

export default function ObjetivoScreen() {
  const router = useRouter();
  const {
    persona,
    formalized,
    uploaded,
    purpose,
    setPurpose,
    requestedAmount,
    setRequestedAmount,
  } = useFlow();

  const defaultAmount = useMemo(
    () => computeCredit({ persona, formalized, uploaded }).amount,
    [persona, formalized, uploaded],
  );
  const amount = requestedAmount ?? defaultAmount;

  function setAmount(v: number) {
    setRequestedAmount(Math.max(MIN, Math.min(MAX, v)));
  }

  return (
    <Screen>
      <TopBar step={5} total={7} />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Title>Para que você quer o crédito?</Title>
        <Body>
          Escolha o seu objetivo. Vamos priorizar as linhas que mais combinam com ele — sem esconder
          as outras.
        </Body>
      </View>

      {/* Grid 2 colunas de objetivos */}
      <View style={os.grid}>
        {CREDIT_PURPOSES.map((p) => {
          const selected = purpose === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPurpose(p.id as CreditPurpose)}
              style={os.cell}
            >
              <Card
                tone={selected ? "highlight" : "default"}
                style={{ flex: 1, gap: 6, alignItems: "flex-start", minHeight: 96 }}
              >
                <Text style={os.emoji}>{p.icon}</Text>
                <Text style={[os.purposeLabel, selected && { color: C.accent }]}>{p.label}</Text>
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Seletor de valor */}
      <View style={{ gap: S.sm }}>
        <Label>Quanto você precisa?</Label>
        <Card style={{ gap: S.md }}>
          <Text style={[os.amount, numStyle]}>{formatBRL(amount)}</Text>

          <View style={os.chips}>
            {PRESETS.map((v) => {
              const on = amount === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setAmount(v)}
                  hitSlop={6}
                  style={[os.chip, on && os.chipOn]}
                >
                  <Text style={[os.chipTxt, on && { color: C.accent }]}>{formatBRL(v)}</Text>
                </Pressable>
              );
            })}
          </View>

          <AmountStepper value={amount} onChange={setAmount} min={MIN} max={MAX} step={STEP} />
          <Muted>Ajuste de {formatBRL(MIN)} a {formatBRL(MAX)}, de {formatBRL(STEP)} em {formatBRL(STEP)}.</Muted>
        </Card>
      </View>

      <Btn
        label="Continuar"
        disabled={purpose == null}
        onPress={() => {
          if (requestedAmount == null) setRequestedAmount(amount);
          router.push("/score");
        }}
      />
    </Screen>
  );
}

const os = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  cell: { width: "48%", flexGrow: 1 },
  emoji: { fontSize: 30 },
  purposeLabel: { color: C.text, fontSize: 14, fontWeight: "700", lineHeight: 18 },
  amount: { color: C.text, fontSize: 30, fontWeight: "900", letterSpacing: -0.5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: S.sm },
  chip: {
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: "center",
  },
  chipOn: { borderColor: C.accent, backgroundColor: C.accentSoft },
  chipTxt: { color: C.text, fontSize: 13, fontWeight: "700" },
});
