import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import {
  formatBRL,
  pipelineTotal,
  contractedTotal,
  projectedMonthly,
  obraMonthly,
  HORIZON_MONTHS,
} from "@/lib/data";
import { Screen, TopBar, Title, Body, Muted, Card, Btn, Pill, C, S } from "@/lib/ui";

export default function ObrasScreen() {
  const router = useRouter();
  const { persona } = useFlow();

  const pipeline = pipelineTotal(persona);
  const contracted = contractedTotal(persona);
  const monthly = projectedMonthly(persona);

  return (
    <Screen>
      <TopBar step={4} total={7} />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Title>Sua agenda dos próximos {HORIZON_MONTHS} meses</Title>
        <Body>
          Esta é a sua carteira de trabalho futura. Os atendimentos e contratos já no horizonte
          viram a garantia do seu crédito.
        </Body>
      </View>

      <View style={{ flexDirection: "row", gap: S.md }}>
        <Card style={{ flex: 1 }}>
          <Muted>Agenda total</Muted>
          <Text style={hs.big}>{formatBRL(pipeline)}</Text>
          <Muted>{formatBRL(contracted)} já confirmado</Muted>
        </Card>
        <Card style={{ flex: 1 }}>
          <Muted>Renda média</Muted>
          <Text style={hs.big}>{formatBRL(monthly)}</Text>
          <Muted>por mês (projeção)</Muted>
        </Card>
      </View>

      <View style={{ gap: S.sm }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>Trabalhos na agenda</Muted>
        {persona.obras.map((o) => (
          <Card key={o.id}>
            <View style={hs.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>{o.titulo}</Text>
                <Muted>{o.local} · início {o.inicio} · {o.meses} meses</Muted>
              </View>
              <Pill tone={o.status === "contratada" ? "ok" : "default"}>
                {o.status === "contratada" ? "Confirmado" : "Previsto"}
              </Pill>
            </View>
            <View style={hs.row}>
              <Muted style={{ flex: 1 }}>Valor do trabalho</Muted>
              <Text style={{ color: C.text, fontWeight: "800" }}>{formatBRL(o.valor)}</Text>
            </View>
            <View style={hs.row}>
              <Muted style={{ flex: 1 }}>Equivale por mês</Muted>
              <Muted style={{ color: C.text }}>{formatBRL(obraMonthly(o))}/mês</Muted>
            </View>
          </Card>
        ))}
      </View>

      <Card style={{ borderColor: C.white }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>Por que isso importa</Muted>
        <Body>
          Em vez de pedir um bem em garantia, antecipamos parte dos seus trabalhos futuros. A
          parcela do crédito sai do próprio faturamento — risco baixo para o banco, crédito justo
          para você.
        </Body>
      </Card>

      <Btn label="Definir meu objetivo" onPress={() => router.push("/objetivo")} />
    </Screen>
  );
}

const hs = StyleSheet.create({
  big: { color: C.text, fontSize: 22, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: S.sm },
});
