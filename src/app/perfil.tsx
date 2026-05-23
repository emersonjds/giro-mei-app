import { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { computeScore, formatCNPJ, BANK_PARTNERS } from "@/lib/data";
import {
  Screen,
  TopBar,
  Title,
  Body,
  Muted,
  Label,
  Card,
  Btn,
  Pill,
  C,
  S,
  numStyle,
} from "@/lib/ui";

export default function PerfilScreen() {
  const router = useRouter();
  const { persona, formalized, uploaded, activeCNPJ, purpose, requestedAmount, reset } = useFlow();

  const score = useMemo(
    () => computeScore({ persona, formalized, uploaded, purpose, requestedAmount }).score,
    [persona, formalized, uploaded, purpose, requestedAmount],
  );

  function apagar() {
    reset();
    router.replace("/");
  }

  return (
    <Screen>
      <TopBar />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Title>Meu perfil</Title>
      </View>

      {/* Dados */}
      <Card style={{ gap: S.sm }}>
        <Text style={ps.name}>{persona.name}</Text>
        <Muted>{persona.trade} · {persona.location}</Muted>
        <View style={ps.row}>
          <Muted style={{ flex: 1 }}>CNPJ</Muted>
          <Text style={[ps.val, numStyle]}>
            {activeCNPJ ? formatCNPJ(activeCNPJ) : formalized ? "Ativo" : "Não formalizado"}
          </Text>
        </View>
        <View style={ps.row}>
          <Muted style={{ flex: 1 }}>Score</Muted>
          <Text style={[ps.val, numStyle]}>{score}</Text>
        </View>
        {formalized ? (
          <View style={{ flexDirection: "row" }}>
            <Pill tone="ok">CNPJ ativo</Pill>
          </View>
        ) : null}
      </Card>

      {/* Parceiros */}
      <View style={{ gap: S.sm }}>
        <Label>Parceiros</Label>
        <Card style={{ gap: S.sm }}>
          <Muted style={{ color: C.text, fontWeight: "700" }}>
            Quem libera seu crédito · regulado pelo BACEN
          </Muted>
          {BANK_PARTNERS.map((p) => (
            <View key={p} style={ps.partnerRow}>
              <View style={ps.dot} />
              <Text style={ps.partner}>{p}</Text>
            </View>
          ))}
        </Card>
      </View>

      {/* LGPD */}
      <View style={{ gap: S.sm }}>
        <Label>Seus dados (LGPD)</Label>
        <Card style={{ gap: S.md }}>
          <Body>
            Seus dados são usados apenas para montar seu laudo de crédito e conectá-lo aos parceiros
            que você autorizar. Você pode revogar esse consentimento e apagar tudo a qualquer
            momento.
          </Body>
          <Btn label="Apagar meus dados e recomeçar" variant="ghost" onPress={apagar} />
        </Card>
      </View>
    </Screen>
  );
}

const ps = StyleSheet.create({
  name: { color: C.text, fontSize: 20, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: S.sm },
  val: { color: C.text, fontSize: 15, fontWeight: "800" },
  partnerRow: { flexDirection: "row", alignItems: "center", gap: S.sm },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: C.accent },
  partner: { color: C.text, fontSize: 14, fontWeight: "600" },
});
