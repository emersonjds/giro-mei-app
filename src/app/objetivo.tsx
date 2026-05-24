import { useMemo } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { computeCredit, formatBRL } from "@/lib/data";
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

export default function ValorScreen() {
  const router = useRouter();
  const { persona, formalized, uploaded, requestedAmount, setRequestedAmount } = useFlow();

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
        <Title>Quanto de capital de giro você precisa?</Title>
        <Body>
          Defina o valor que faz sentido para o seu negócio agora. Você ajusta quando quiser — e só
          contrata depois de ver o custo completo.
        </Body>
      </View>

      <View style={{ gap: S.sm }}>
        <Label>Valor do capital de giro</Label>
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

      <Card style={{ borderColor: C.brand }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>É capital de giro</Muted>
        <Body>
          O crédito entra no caixa do seu negócio — estoque, insumos, contas do mês, o que precisar.
          Sem amarra de finalidade.
        </Body>
      </Card>

      <Btn
        label="Continuar"
        onPress={() => {
          if (requestedAmount == null) setRequestedAmount(amount);
          router.push("/score");
        }}
      />
    </Screen>
  );
}

const os = StyleSheet.create({
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
