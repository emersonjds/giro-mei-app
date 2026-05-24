import { useMemo } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { computeScore, computeCredit, formatBRL } from "@/lib/data";
import {
  rankLines,
  bestLine,
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
  const { persona, formalized, uploaded, requestedAmount, contract, monthlyRevenue } = useFlow();

  const input = useMemo(
    () => ({ persona, formalized, uploaded, requestedAmount }),
    [persona, formalized, uploaded, requestedAmount],
  );
  const score = useMemo(() => computeScore(input).score, [input]);
  const credit = useMemo(() => computeCredit(input), [input]);
  const ranked = useMemo(() => rankLines(input), [input]);
  const best = bestLine(ranked);

  const HONORIFICS = new Set(["dona", "seu", "sr", "sra"]);
  const nameParts = persona.name.trim().split(/\s+/);
  const firstName = nameParts.find((p) => !HONORIFICS.has(p.toLowerCase())) ?? nameParts[0];
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
        <View style={hs.topActions}>
          <Pressable hitSlop={10} style={hs.iconBtn} accessibilityLabel="Notificações">
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/perfil")}
            hitSlop={10}
            style={hs.avatar}
            accessibilityLabel="Meu perfil"
          >
            <Text style={{ fontSize: 20 }}>👤</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: S.sm, marginTop: S.sm }}>
        <Title>Olá, {firstName}</Title>
        <View style={{ flexDirection: "row" }}>
          <Pill tone="mint">Score Giromei {score}</Pill>
        </View>
      </View>

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
        <Card tone="dark" style={{ gap: S.sm }}>
          <Text style={hs.heroLabel}>Capital de giro disponível</Text>
          <Text style={[hs.heroMoney, numStyle]}>{formatBRL(credit.amount)}</Text>
          {best ? (
            <Text style={hs.heroSub}>Melhor linha para você: {best.line.name}</Text>
          ) : null}
          <Btn label="Solicitar crédito" variant="mint" onPress={() => router.push("/credito")} />
        </Card>
      )}

      <View style={{ gap: S.sm }}>
        <View style={hs.cardHead}>
          <Label>Seu movimento</Label>
          <Pressable onPress={() => router.push("/gestao")} hitSlop={8}>
            <Text style={hs.link}>Ver mais</Text>
          </Pressable>
        </View>
        <Card style={hs.cardHead}>
          <View style={{ flex: 1 }}>
            <Text style={hs.obraTitle}>Faturamento médio</Text>
            <Muted>por mês</Muted>
          </View>
          <Text style={[hs.obraVal, numStyle, { fontSize: 18 }]}>{formatBRL(monthlyRevenue)}</Text>
        </Card>
      </View>

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
  topActions: { flexDirection: "row", alignItems: "center", gap: S.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderColor: C.border,
    borderWidth: 1,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: { color: "rgba(255,255,255,0.72)", fontSize: 13, fontWeight: "700" },
  heroMoney: { color: "#FFFFFF", fontSize: 34, fontWeight: "900", letterSpacing: -1 },
  heroSub: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "600" },
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
