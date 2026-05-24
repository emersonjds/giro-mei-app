import { View, StyleSheet, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { formatBRL } from "@/lib/data";
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
  const { persona, trade, setTrade, monthlyRevenue } = useFlow();

  return (
    <Screen>
      <TopBar />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Pill>Não somos um banco — somos a ponte</Pill>
        <Title>Capital de giro para quem o banco não enxerga.</Title>
        <Body>
          Milhões de autônomos trabalham, faturam e pagam contas — mas o banco diz não, por falta de
          histórico e de garantia. A gente resolve as duas: um score que enxerga o seu trabalho e o
          aval do Sebrae (FAMPE), que garante até 80%. Aí o crédito chega.
        </Body>
      </View>

      <Card>
        <Muted style={{ fontWeight: "700", color: C.text }}>Como funciona</Muted>
        <Step n="1" t="Seu CPF" d="Buscamos se você já tem um CNPJ — se não, criamos seu MEI." />
        <Step n="2" t="Seu movimento" d="Seu faturamento e seus documentos mostram o seu negócio." />
        <Step n="3" t="Seu score" d="A 2ª camada que enxerga o seu trabalho, não só o bureau." />
        <Step n="4" t="Aval do Sebrae" d="O FAMPE garante até 80% e o crédito é liberado." />
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
          <Muted>Funciona para qualquer MEI — escolha ou digite a sua profissão.</Muted>
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
              {persona.location}. Hoje invisível para o banco — mas faturando cerca de{" "}
              {formatBRL(monthlyRevenue)} por mês.
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
    backgroundColor: C.brand,
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
