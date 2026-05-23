import { useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { formatCPF, isValidCPF, onlyDigits } from "@/lib/data";
import { Screen, TopBar, Title, Body, Muted, Card, Btn, C, S } from "@/lib/ui";

export default function CpfScreen() {
  const router = useRouter();
  const { cpf, setCpf, runSearch } = useFlow();
  const [touched, setTouched] = useState(false);

  const digits = onlyDigits(cpf);
  const valid = isValidCPF(cpf);
  const showError = touched && digits.length === 11 && !valid;

  function next() {
    runSearch();
    router.push("/cnpj");
  }

  return (
    <Screen>
      <TopBar step={1} total={7} />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Title>Qual é o seu CPF?</Title>
        <Body>
          Vamos consultar se já existe um CNPJ no seu nome. É o primeiro passo para sair da
          informalidade.
        </Body>
      </View>

      <Card>
        <Muted style={{ fontWeight: "700", color: C.text }}>CPF</Muted>
        <TextInput
          value={cpf}
          onChangeText={(t) => setCpf(formatCPF(t))}
          onBlur={() => setTouched(true)}
          keyboardType="number-pad"
          placeholder="000.000.000-00"
          placeholderTextColor={C.faint}
          maxLength={14}
          style={[inp.field, showError && { borderColor: C.danger }]}
        />
        {showError ? (
          <Text style={{ color: C.danger, fontSize: 13 }}>
            CPF inválido — confira os números.
          </Text>
        ) : (
          <Muted>Usamos seu CPF só para a consulta. Você é dono dos seus dados (LGPD).</Muted>
        )}
      </Card>

      <Btn label="Buscar meu CNPJ" onPress={next} disabled={!valid} />
    </Screen>
  );
}

const inp = StyleSheet.create({
  field: {
    height: 56,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: S.md,
    color: C.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
    backgroundColor: C.cardAlt,
  },
});
