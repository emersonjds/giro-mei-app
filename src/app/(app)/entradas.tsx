import { View, StyleSheet, Text } from "react-native";

import { useFlow } from "@/lib/flow";
import { formatBRL, annualRevenue } from "@/lib/data";
import { Screen, Brand, Title, Body, Muted, Label, Card, C, S, numStyle } from "@/lib/ui";

export default function MovimentoTab() {
  const { persona, monthlyRevenue, contract } = useFlow();

  const committed = contract?.amount ?? 0;

  return (
    <Screen>
      <Brand />

      <View style={{ gap: S.sm, marginTop: S.sm }}>
        <Title>Seu movimento</Title>
        <Body>
          É o faturamento do seu trabalho que mostra ao banco a sua capacidade de pagar. A garantia
          da operação fica por conta do aval do Sebrae (FAMPE).
        </Body>
      </View>

      <View style={{ flexDirection: "row", gap: S.md }}>
        <Card style={{ flex: 1 }}>
          <Muted>Faturamento/mês</Muted>
          <Text style={[es.big, numStyle]}>{formatBRL(monthlyRevenue)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Muted>No ano</Muted>
          <Text style={[es.big, numStyle]}>{formatBRL(annualRevenue(persona))}</Text>
        </Card>
      </View>

      {contract ? (
        <Card style={{ gap: S.sm }}>
          <Label>Crédito em andamento</Label>
          <View style={es.row}>
            <Muted style={{ flex: 1 }}>Valor contratado</Muted>
            <Text style={[es.val, numStyle]}>{formatBRL(committed)}</Text>
          </View>
          <View style={es.row}>
            <Muted style={{ flex: 1 }}>Coberto pelo aval do FAMPE (até 80%)</Muted>
            <Text style={[es.val, { color: C.success }, numStyle]}>
              {formatBRL(Math.round((committed * 0.8) / 100) * 100)}
            </Text>
          </View>
        </Card>
      ) : (
        <Card style={{ borderColor: C.brand }}>
          <Muted style={{ fontWeight: "700", color: C.text }}>A garantia é o aval do Sebrae</Muted>
          <Body>
            Com o FAMPE cobrindo até 80% da operação, o banco libera seu capital de giro sem exigir
            um bem em garantia.
          </Body>
        </Card>
      )}
    </Screen>
  );
}

const es = StyleSheet.create({
  big: { color: C.text, fontSize: 22, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: S.sm },
  val: { color: C.text, fontSize: 16, fontWeight: "800" },
});
