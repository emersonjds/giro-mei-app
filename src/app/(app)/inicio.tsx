import { useMemo } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import {
  computeScore,
  computeCredit,
  formatBRL,
  obraMonthly,
} from "@/lib/data";
import {
  rankLines,
  bestLine,
  CREDIT_PURPOSES,
  ALL_DOC_TYPES,
  formatDateBR,
  Contract,
} from "@/lib/credit";
import {
  Screen,
  Brand,
  Title,
  Muted,
  Label,
  Card,
  Btn,
  Pill,
  Bar,
  StatusStepper,
  C,
  S,
  numStyle,
} from "@/lib/ui";

const STATUS_ORDER: Contract["status"][] = [
  "em_analise",
  "aprovado",
  "contrato_assinado",
  "desembolso_agendado",
  "liberado",
];

const STATUS_LABEL: Record<Contract["status"], string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  contrato_assinado: "Contrato assinado",
  desembolso_agendado: "Desembolso agendado",
  liberado: "Liberado",
};

export default function InicioScreen() {
  const router = useRouter();
  const { persona, formalized, uploaded, purpose, requestedAmount, contract } = useFlow();

  const input = useMemo(
    () => ({ persona, formalized, uploaded, purpose, requestedAmount }),
    [persona, formalized, uploaded, purpose, requestedAmount],
  );
  const score = useMemo(() => computeScore(input).score, [input]);
  const credit = useMemo(() => computeCredit(input), [input]);
  const ranked = useMemo(() => rankLines(input), [input]);
  const best = bestLine(ranked);

  const HONORIFICS = new Set(["dona", "seu", "sr", "sra"]);
  const nameParts = persona.name.trim().split(/\s+/);
  const firstName = nameParts.find((p) => !HONORIFICS.has(p.toLowerCase())) ?? nameParts[0];
  const purposeMeta = purpose ? CREDIT_PURPOSES.find((p) => p.id === purpose) : null;
  const nextInstallment = contract
    ? contract.installments.find((p) => p.status === "a_vencer" || p.status === "atrasada")
    : undefined;

  const compactSteps = contract
    ? STATUS_ORDER.map((s, i) => {
        const cur = STATUS_ORDER.indexOf(contract.status);
        return {
          label: STATUS_LABEL[s],
          done: i < cur,
          active: i === cur,
        };
      })
    : [];

  return (
    <Screen>
      <View style={hs.topRow}>
        <Brand />
        <Pressable
          onPress={() => router.push("/perfil")}
          hitSlop={10}
          style={hs.avatar}
        >
          <Text style={{ fontSize: 20 }}>👤</Text>
        </Pressable>
      </View>

      <View style={{ gap: S.sm, marginTop: S.sm }}>
        <Title>Olá, {firstName}</Title>
        <View style={{ flexDirection: "row" }}>
          <Pill tone="accent">Score {score}</Pill>
        </View>
      </View>

      {/* Crédito */}
      {contract ? (
        <Card tone="highlight" style={{ gap: S.md }}>
          <View style={hs.cardHead}>
            <View style={{ flex: 1 }}>
              <Label>Meu crédito</Label>
              <Text style={hs.lineName}>{contract.lineName}</Text>
            </View>
            <Pill tone="accent">{STATUS_LABEL[contract.status]}</Pill>
          </View>
          <StatusStepper steps={compactSteps} />
          {nextInstallment ? (
            <View style={hs.nextBox}>
              <Muted>Próxima parcela</Muted>
              <Text style={[hs.nextVal, numStyle]}>
                {formatBRL(nextInstallment.amount)}
              </Text>
              <Muted>vence {formatDateBR(nextInstallment.dueDate)}</Muted>
            </View>
          ) : null}
          <Btn label="Ver meu crédito" variant="accent" onPress={() => router.push("/credito")} />
        </Card>
      ) : (
        <Card tone="highlight" style={{ gap: S.sm }}>
          <Label>Crédito pré-aprovado</Label>
          <Text style={[hs.bigMoney, numStyle]}>{formatBRL(credit.amount)}</Text>
          {best ? <Muted>Melhor linha para você: {best.line.name}</Muted> : null}
          <Btn label="Ver minhas linhas" variant="accent" onPress={() => router.push("/credito")} />
        </Card>
      )}

      {/* Objetivo */}
      <View style={{ gap: S.sm }}>
        <Label>Seu objetivo</Label>
        <Card style={{ gap: S.sm }}>
          <View style={hs.cardHead}>
            {purposeMeta ? (
              <Pill tone="accent">
                {purposeMeta.icon} {purposeMeta.label}
              </Pill>
            ) : (
              <Muted style={{ flex: 1 }}>Você ainda não definiu um objetivo.</Muted>
            )}
          </View>
          <Btn
            label={purposeMeta ? "Editar" : "Definir objetivo"}
            variant="ghost"
            onPress={() => router.push("/objetivo")}
          />
        </Card>
      </View>

      {/* Próximas entradas */}
      <View style={{ gap: S.sm }}>
        <View style={hs.cardHead}>
          <Label>Próximas entradas</Label>
          <Pressable onPress={() => router.push("/entradas")} hitSlop={8}>
            <Text style={hs.link}>Ver todas</Text>
          </Pressable>
        </View>
        <Card style={{ gap: S.sm }}>
          {persona.obras.slice(0, 3).map((o) => (
            <View key={o.id} style={hs.obraRow}>
              <View style={{ flex: 1 }}>
                <Text style={hs.obraTitle}>{o.titulo}</Text>
                <Muted>{o.inicio}</Muted>
              </View>
              <Text style={[hs.obraVal, numStyle]}>{formatBRL(obraMonthly(o))}/mês</Text>
            </View>
          ))}
        </Card>
      </View>

      {/* Documentos */}
      <View style={{ gap: S.sm }}>
        <View style={hs.cardHead}>
          <Label>Documentos</Label>
          <Pressable onPress={() => router.push("/docs")} hitSlop={8}>
            <Text style={hs.link}>Gerenciar</Text>
          </Pressable>
        </View>
        <Card style={{ gap: S.sm }}>
          <View style={hs.cardHead}>
            <Muted style={{ flex: 1 }}>Enviados</Muted>
            <Text style={[hs.docCount, numStyle]}>
              {uploaded.length}/{ALL_DOC_TYPES.length}
            </Text>
          </View>
          <Bar value={uploaded.length / ALL_DOC_TYPES.length} />
        </Card>
      </View>
    </Screen>
  );
}

const hs = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderColor: C.border,
    borderWidth: 1,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: S.sm },
  lineName: { color: C.text, fontSize: 16, fontWeight: "800" },
  bigMoney: { color: C.text, fontSize: 34, fontWeight: "900", letterSpacing: -1 },
  nextBox: { gap: 2 },
  nextVal: { color: C.text, fontSize: 22, fontWeight: "900" },
  link: { color: C.accent, fontSize: 13, fontWeight: "800" },
  obraRow: { flexDirection: "row", alignItems: "center", gap: S.sm },
  obraTitle: { color: C.text, fontSize: 14, fontWeight: "700" },
  obraVal: { color: C.text, fontSize: 14, fontWeight: "800" },
  docCount: { color: C.text, fontSize: 14, fontWeight: "800" },
});
