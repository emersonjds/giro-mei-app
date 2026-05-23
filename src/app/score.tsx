import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { computeScore, computeCredit, formatBRL } from "@/lib/data";
import { Screen, TopBar, Title, Body, Muted, Card, Btn, Pill, Bar, C, S } from "@/lib/ui";

export default function ScoreScreen() {
  const router = useRouter();
  const { persona, formalized, uploaded, purpose, requestedAmount } = useFlow();

  const input = { persona, formalized, uploaded, purpose, requestedAmount };
  const result = computeScore(input);
  const credit = computeCredit(input);
  const pct = (result.score - 300) / 700;

  return (
    <Screen>
      <TopBar step={6} total={7} />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Title>O score de {persona.name}</Title>
        <Body>Calculado a partir da formalização, dos documentos e da sua agenda de trabalhos — e totalmente explicável.</Body>
      </View>

      <Card style={{ alignItems: "center", gap: S.md, paddingVertical: S.lg }}>
        <Muted>SEU SCORE</Muted>
        <Text style={ss.score}>{result.score}</Text>
        <Pill tone="ok">{result.ratingLabel}</Pill>
        <View style={{ alignSelf: "stretch", gap: 4 }}>
          <Bar value={pct} />
          <View style={ss.scaleRow}>
            <Muted>300</Muted>
            <Muted>1000</Muted>
          </View>
        </View>
      </Card>

      <Card style={{ borderColor: C.white, gap: S.sm }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>Crédito pré-aprovado</Muted>
        <Text style={ss.credit}>{formatBRL(credit.amount)}</Text>
        <Muted>
          Capital de giro por antecipação de recebíveis — garantido por {credit.guaranteeMonths} meses
          da sua agenda ({formatBRL(credit.guaranteedReceivables)}). Taxa a partir de{" "}
          {credit.monthlyRate.toLocaleString("pt-BR")}% a.m.
        </Muted>
      </Card>

      <View style={{ gap: S.sm }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>Raio-X do score — sem caixa-preta</Muted>
        {result.factors.map((f) => (
          <Card key={f.label} style={{ gap: 6 }}>
            <View style={ss.facHead}>
              <Text style={{ color: C.text, fontSize: 14, fontWeight: "700", flex: 1 }}>{f.label}</Text>
              <Text style={{ color: f.positive ? C.text : C.muted, fontWeight: "900" }}>+{f.points}</Text>
            </View>
            <Bar value={f.strength} danger={!f.positive} />
            <Muted>{f.explanation}</Muted>
          </Card>
        ))}
      </View>

      <Btn label="Entrar no meu painel" onPress={() => router.replace("/inicio")} />
    </Screen>
  );
}

const ss = StyleSheet.create({
  score: { color: C.text, fontSize: 64, fontWeight: "900", letterSpacing: -2 },
  credit: { color: C.text, fontSize: 34, fontWeight: "900" },
  scaleRow: { flexDirection: "row", justifyContent: "space-between" },
  facHead: { flexDirection: "row", alignItems: "center", gap: S.sm },
});
