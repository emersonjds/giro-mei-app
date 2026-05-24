import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { formatBRL, annualRevenue } from "@/lib/data";
import { ALL_DOC_TYPES } from "@/lib/credit";
import { Screen, Brand, Title, Body, Muted, Label, Card, Btn, Bar, Pill, C, S, numStyle } from "@/lib/ui";

export default function GestaoTab() {
  const router = useRouter();
  const { persona, monthlyRevenue, contract, uploaded } = useFlow();

  const committed = contract?.amount ?? 0;
  const docsPct = uploaded.length / ALL_DOC_TYPES.length;

  return (
    <Screen>
      <Brand />

      <View style={{ gap: S.sm, marginTop: S.sm }}>
        <Title>Gestão do negócio</Title>
        <Body>
          É o faturamento do seu trabalho que mostra ao banco a sua capacidade de pagar. A garantia
          da operação fica por conta do aval do Sebrae (FAMPE).
        </Body>
      </View>

      <View style={{ flexDirection: "row", gap: S.md }}>
        <Card style={{ flex: 1 }}>
          <Muted>Faturamento/mês</Muted>
          <Text style={[gs.big, numStyle]}>{formatBRL(monthlyRevenue)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Muted>No ano</Muted>
          <Text style={[gs.big, numStyle]}>{formatBRL(annualRevenue(persona))}</Text>
        </Card>
      </View>

      {contract ? (
        <Card style={{ gap: S.sm }}>
          <Label>Crédito em andamento</Label>
          <View style={gs.row}>
            <Muted style={{ flex: 1 }}>Valor contratado</Muted>
            <Text style={[gs.val, numStyle]}>{formatBRL(committed)}</Text>
          </View>
          <View style={gs.row}>
            <Muted style={{ flex: 1 }}>Coberto pelo aval do FAMPE (até 80%)</Muted>
            <Text style={[gs.val, { color: C.success }, numStyle]}>
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

      <View style={{ gap: S.sm }}>
        <View style={gs.headRow}>
          <Label>Documentos</Label>
          {uploaded.length === ALL_DOC_TYPES.length ? <Pill tone="success">Completo</Pill> : null}
        </View>
        <Card style={{ gap: S.sm }}>
          <View style={gs.row}>
            <Muted style={{ flex: 1 }}>Enviados</Muted>
            <Text style={[gs.val, numStyle]}>
              {uploaded.length}/{ALL_DOC_TYPES.length}
            </Text>
          </View>
          <Bar value={docsPct} />
          <Muted>Cada documento vira prova de que você paga em dia e movimenta dinheiro.</Muted>
          <Btn label="Gerenciar documentos" variant="ghost" onPress={() => router.push("/docs")} />
        </Card>
      </View>
    </Screen>
  );
}

const gs = StyleSheet.create({
  big: { color: C.text, fontSize: 22, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: S.sm },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  val: { color: C.text, fontSize: 16, fontWeight: "800" },
});
