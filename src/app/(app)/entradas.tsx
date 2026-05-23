import { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";

import { useFlow } from "@/lib/flow";
import {
  formatBRL,
  pipelineTotal,
  projectedMonthly,
  obraMonthly,
  Obra,
} from "@/lib/data";
import { Screen, Brand, Title, Body, Muted, Label, Card, Pill, C, S, numStyle } from "@/lib/ui";

const MONTH_ORDER: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

function inicioKey(o: Obra): number {
  const [m, y] = o.inicio.split("/");
  const mm = MONTH_ORDER[m.toLowerCase().slice(0, 3)] ?? 0;
  return parseInt(y, 10) * 100 + mm;
}

export default function EntradasScreen() {
  const { persona, contract } = useFlow();

  const pipeline = pipelineTotal(persona);
  const monthly = projectedMonthly(persona);
  const obras = useMemo(
    () => [...persona.obras].sort((a, b) => inicioKey(a) - inicioKey(b)),
    [persona.obras],
  );

  const committed = contract?.amount ?? 0;
  const free = pipeline - committed;

  return (
    <Screen>
      <Brand />

      <View style={{ gap: S.sm, marginTop: S.sm }}>
        <Title>Entradas futuras</Title>
        <Body>
          Sua agenda de trabalhos é a garantia do seu crédito. Quanto mais trabalho no horizonte,
          mais fôlego financeiro.
        </Body>
      </View>

      <View style={{ flexDirection: "row", gap: S.md }}>
        <Card style={{ flex: 1 }}>
          <Muted>Carteira total</Muted>
          <Text style={[es.big, numStyle]}>{formatBRL(pipeline)}</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Muted>Renda média/mês</Muted>
          <Text style={[es.big, numStyle]}>{formatBRL(monthly)}</Text>
        </Card>
      </View>

      {contract ? (
        <Card style={{ gap: S.sm }}>
          <Label>Garantia</Label>
          <View style={es.row}>
            <Muted style={{ flex: 1 }}>Comprometido como garantia</Muted>
            <Text style={[es.val, numStyle]}>{formatBRL(committed)}</Text>
          </View>
          <View style={es.row}>
            <Muted style={{ flex: 1 }}>Livre</Muted>
            <Text style={[es.val, { color: C.success }, numStyle]}>{formatBRL(free)}</Text>
          </View>
        </Card>
      ) : (
        <Card style={{ borderColor: C.white }}>
          <Muted style={{ fontWeight: "700", color: C.text }}>
            Sua agenda futura é sua garantia
          </Muted>
          <Body>
            Em vez de pedir um bem, antecipamos parte dos seus trabalhos. A parcela do crédito sai
            do próprio faturamento.
          </Body>
        </Card>
      )}

      <View style={{ gap: S.sm }}>
        <Label>Trabalhos na agenda</Label>
        {obras.map((o) => (
          <Card key={o.id} style={{ gap: S.sm }}>
            <View style={es.row}>
              <View style={{ flex: 1 }}>
                <Text style={es.title}>{o.titulo}</Text>
                <Muted>{o.local} · {o.inicio}</Muted>
              </View>
              <Pill tone={o.status === "contratada" ? "ok" : "default"}>
                {o.status === "contratada" ? "Confirmado" : "Previsto"}
              </Pill>
            </View>
            <View style={es.row}>
              <Text style={[es.val, numStyle]}>{formatBRL(o.valor)}</Text>
              <Muted style={{ flex: 1, textAlign: "right" }}>
                equivale a {formatBRL(obraMonthly(o))}/mês
              </Muted>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const es = StyleSheet.create({
  big: { color: C.text, fontSize: 22, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: S.sm },
  title: { color: C.text, fontSize: 15, fontWeight: "700" },
  val: { color: C.text, fontSize: 16, fontWeight: "800" },
});
