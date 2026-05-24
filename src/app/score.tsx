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
        <Body>
          A nossa 2ª camada de análise: um score próprio que enxerga o seu trabalho — diferente do
          score tradicional do banco. E totalmente explicável.
        </Body>
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

      <Card tone="highlight" style={{ gap: S.sm }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>A dupla validação</Muted>
        <Body>
          Seu score mostra que você pode pagar. O aval do Sebrae (FAMPE) garante até 80% da
          operação. Juntos, destravam o crédito que o banco sempre negou.
        </Body>
      </Card>

      <Card style={{ borderColor: C.brand, gap: S.sm }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>Crédito estimado</Muted>
        <Text style={ss.credit}>até {formatBRL(credit.amount)}</Text>
        <Muted>
          Capital de giro com aval do FAMPE, a partir de{" "}
          {credit.monthlyRate.toLocaleString("pt-BR")}% a.m. A decisão final é da instituição
          parceira.
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
  score: { color: C.gold, fontSize: 64, fontWeight: "900", letterSpacing: -2 },
  credit: { color: C.gold, fontSize: 34, fontWeight: "900" },
  scaleRow: { flexDirection: "row", justifyContent: "space-between" },
  facHead: { flexDirection: "row", alignItems: "center", gap: S.sm },
});
