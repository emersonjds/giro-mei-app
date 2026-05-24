import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { formatBRL, annualRevenue } from "@/lib/data";
import { Screen, TopBar, Title, Body, Muted, Card, Btn, AmountStepper, C, S } from "@/lib/ui";

export default function MovimentoScreen() {
  const router = useRouter();
  const { persona, monthlyRevenue, setMonthlyRevenue } = useFlow();

  return (
    <Screen>
      <TopBar step={4} total={7} />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Title>Seu movimento de trabalho</Title>
        <Body>
          Quanto você fatura, em média, por mês? Esse é o sinal que a nossa análise usa para
          entender o seu negócio — não importa o ofício. Ajuste à vontade.
        </Body>
      </View>

      <Card style={{ gap: S.md, alignItems: "center", paddingVertical: S.lg }}>
        <Muted>FATURAMENTO MÉDIO MENSAL</Muted>
        <Text style={ms.big}>{formatBRL(monthlyRevenue)}</Text>
        <AmountStepper
          value={monthlyRevenue}
          onChange={setMonthlyRevenue}
          min={0}
          max={12000}
          step={100}
        />
        <Muted>Cerca de {formatBRL(annualRevenue(persona))} por ano</Muted>
      </Card>

      <Card style={{ borderColor: C.brand }}>
        <Muted style={{ fontWeight: "700", color: C.text }}>E a garantia?</Muted>
        <Body>
          Você não precisa dar nenhum bem. Quem garante a operação é o aval do Sebrae (FAMPE), que
          cobre até 80% do crédito. Seu movimento serve para mostrar a capacidade de pagar — não
          como penhor.
        </Body>
      </Card>

      <Btn label="Continuar" onPress={() => router.push("/objetivo")} />
    </Screen>
  );
}

const ms = StyleSheet.create({
  big: { color: C.gold, fontSize: 34, fontWeight: "900" },
});
