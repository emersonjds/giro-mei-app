import { View, StyleSheet, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { formatBRL, pipelineTotal } from "@/lib/data";
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
} from "@/lib/ui";

const TRADE_CHIPS = [
  "Trancista",
  "Manicure",
  "Cabeleireira",
  "Costureira",
  "Confeiteira",
  "Diarista",
  "Vendedora autônoma",
];

/** Deriva iniciais ignorando honoríficos comuns (Dona/Seu/Sr/Sra). */
function getInitials(name: string): string {
  const HONORIFICS = new Set(["dona", "seu", "sr", "sra"]);
  const parts = name.trim().split(/\s+/);
  const real = parts.filter((p) => !HONORIFICS.has(p.toLowerCase()));
  if (real.length === 0) return name.slice(0, 1).toUpperCase();
  if (real.length === 1) return real[0].slice(0, 1).toUpperCase();
  return (real[0].slice(0, 1) + real[1].slice(0, 1)).toUpperCase();
}

export default function IntroScreen() {
  const router = useRouter();
  const { persona, trade, setTrade } = useFlow();

  return (
    <Screen>
      <TopBar />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Pill>Não somos um banco — somos a ponte</Pill>
        <Title>Tiramos você da informalidade e te levamos ao crédito.</Title>
        <Body>
          Milhões de autônomos trabalham, faturam e pagam contas — mas o banco diz não, porque não
          há CNPJ nem comprovação formal. A gente formaliza, monta seu histórico e usa sua agenda
          futura como garantia. Aí o crédito chega.
        </Body>
      </View>

      <Card>
        <Muted style={{ fontWeight: "700", color: C.text }}>Como funciona</Muted>
        <Step n="1" t="Seu CPF" d="Buscamos se você já tem um CNPJ — se não, criamos seu MEI." />
        <Step n="2" t="Seus documentos" d="Água, luz, telefone, aluguel e extrato bancário." />
        <Step n="3" t="Sua agenda" d="Projetamos sua renda dos próximos 18 meses." />
        <Step n="4" t="Seu score" d="E acionamos os parceiros bancários por você." />
      </Card>

      <Card style={{ borderColor: C.white }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>O cenário desta demo</Muted>

        <View style={{ gap: S.xs }}>
          <Label>SUA PROFISSÃO</Label>
          <TextInput
            value={trade}
            onChangeText={setTrade}
            placeholder="Qual é o seu ofício?"
            placeholderTextColor={C.faint}
            style={st.tradeInput}
          />
          <Muted>Funciona para qualquer profissão — nesta demo, focamos em trancistas.</Muted>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.chipsRow}
        >
          {TRADE_CHIPS.map((chip) => {
            const active = trade === chip;
            return (
              <Pressable
                key={chip}
                onPress={() => setTrade(chip)}
                style={[st.chip, active && st.chipActive]}
                accessibilityRole="button"
                accessibilityLabel={chip}
                accessibilityState={{ selected: active }}
              >
                <Text style={[st.chipTxt, active && st.chipTxtActive]}>{chip}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={st.scenarioRow}>
          <View
            style={st.avatar}
            accessibilityLabel={`Avatar de ${persona.name}`}
            accessible
          >
            <Text style={st.avatarTxt}>{getInitials(persona.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Body>
              {persona.name}, {persona.trade.toLowerCase()} há {persona.yearsInTrade} anos em{" "}
              {persona.location}. Hoje invisível para o banco — mas com{" "}
              {formatBRL(pipelineTotal(persona))} em trabalhos já no horizonte.
            </Body>
          </View>
        </View>
      </Card>

      <View style={{ gap: S.sm }}>
        <Btn label="Começar" onPress={() => router.push("/cpf")} />
        <Muted style={{ textAlign: "center" }}>
          Em parceria com Feira Preta e SEBRAE
        </Muted>
      </View>
    </Screen>
  );
}

function Step({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <View style={stepSt.row}>
      <View style={stepSt.num}>
        <Muted style={{ color: C.text, fontWeight: "800" }}>{n}</Muted>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>{t}</Text>
        <Muted>{d}</Muted>
      </View>
    </View>
  );
}

const stepSt = StyleSheet.create({
  row: { flexDirection: "row", gap: S.md, alignItems: "flex-start", paddingVertical: 4 },
  num: {
    height: 28,
    width: 28,
    borderRadius: 999,
    borderColor: C.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

const st = StyleSheet.create({
  tradeInput: {
    height: 48,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: S.md,
    color: C.text,
    fontSize: 16,
    backgroundColor: C.cardAlt,
  },
  chipsRow: {
    flexDirection: "row",
    gap: S.sm,
    paddingVertical: S.xs,
  },
  chip: {
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: S.md,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: C.accent,
    backgroundColor: C.accentSoft,
  },
  chipTxt: {
    color: C.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTxtActive: {
    color: C.accent,
    fontWeight: "700",
  },
  scenarioRow: {
    flexDirection: "row",
    gap: S.md,
    alignItems: "flex-start",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#6B21A8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarTxt: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});
