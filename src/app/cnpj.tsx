import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";

import { useFlow } from "@/lib/flow";
import { Screen, TopBar, Title, Body, Muted, Card, Btn, Pill, C, S } from "@/lib/ui";

const CREATE_STEPS = [
  "Consultando a Receita Federal",
  "Definindo atividade — CNAE 9602-5/01 (Cabeleireiros e serviços de beleza)",
  "Emitindo o CNPJ MEI",
  "Inscrição concluída",
];

export default function CnpjScreen() {
  const router = useRouter();
  const { search, createMEI, activeCNPJ } = useFlow();

  const [phase, setPhase] = useState<"idle" | "creating" | "done">(
    search?.status === "found" ? "done" : "idle"
  );
  const [revealed, setRevealed] = useState(search?.status === "found" ? 99 : 0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function startCreate() {
    setPhase("creating");
    CREATE_STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setRevealed(i + 1);
        if (i === CREATE_STEPS.length - 1) {
          createMEI();
          setPhase("done");
        }
      }, 650 * (i + 1));
      timers.current.push(t);
    });
  }

  const found = search?.status === "found";

  return (
    <Screen>
      <TopBar step={2} total={7} />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        {found ? (
          <>
            <Pill tone="ok">CNPJ encontrado</Pill>
            <Title>Você já é formalizado.</Title>
            <Body>Encontramos um CNPJ ativo no seu CPF. Vamos usá-lo no seu histórico.</Body>
          </>
        ) : (
          <>
            <Pill tone="danger">Nenhum CNPJ no seu CPF</Pill>
            <Title>Vamos criar seu MEI agora.</Title>
            <Body>
              Sem CNPJ, o banco não te enxerga. A boa notícia: criamos seu MEI aqui, de graça, em
              segundos — e você já entra formalizado.
            </Body>
          </>
        )}
      </View>

      {/* Criação do MEI (quando não há CNPJ) */}
      {!found && phase !== "idle" && (
        <Card>
          <Muted style={{ fontWeight: "700", color: C.text }}>Abrindo seu MEI</Muted>
          {CREATE_STEPS.map((label, i) => {
            const state = revealed > i ? "done" : revealed === i && phase === "creating" ? "doing" : "todo";
            return (
              <View key={i} style={cs.row}>
                <View
                  style={[
                    cs.dot,
                    state === "done" && { backgroundColor: C.white, borderColor: C.white },
                  ]}
                >
                  {state === "doing" ? (
                    <ActivityIndicator size="small" color={C.text} />
                  ) : state === "done" ? (
                    <Text style={{ color: C.black, fontSize: 13, fontWeight: "900" }}>✓</Text>
                  ) : null}
                </View>
                <Muted style={{ color: state === "todo" ? C.faint : C.text, flex: 1 }}>
                  {label}
                </Muted>
              </View>
            );
          })}
        </Card>
      )}

      {/* Cartão do CNPJ (encontrado ou recém-criado) */}
      {phase === "done" && activeCNPJ && (
        <Card style={{ borderColor: C.white }}>
          <Muted style={{ fontWeight: "700", color: C.text }}>
            {found ? "CNPJ ativo" : "Seu novo CNPJ MEI"}
          </Muted>
          <Title>{activeCNPJ}</Title>
          <Row k="Atividade (CNAE)" v={found && search ? search.cnae : "9602-5/01 — Cabeleireiros e serviços de beleza"} />
          <Row k="Situação" v="Ativa" />
          <Row k="Enquadramento" v="MEI — Microempreendedor Individual" />
          <Muted>* Consulta e emissão simuladas para a demonstração (integração real: Receita Federal / SERPRO).</Muted>
        </Card>
      )}

      {!found && phase === "idle" && (
        <Btn label="Criar meu MEI" onPress={startCreate} />
      )}
      {phase === "done" && (
        <Btn label="Continuar para os documentos" onPress={() => router.push("/documentos")} />
      )}
      {phase === "creating" && <Btn label="Abrindo seu MEI…" loading />}
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={cs.kv}>
      <Muted style={{ flex: 1 }}>{k}</Muted>
      <Muted style={{ color: C.text, fontWeight: "700", flex: 1.4, textAlign: "right" }}>{v}</Muted>
    </View>
  );
}

const cs = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: 5 },
  dot: {
    height: 22,
    width: 22,
    borderRadius: 999,
    borderColor: C.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  kv: { flexDirection: "row", alignItems: "flex-start", gap: S.sm, paddingVertical: 2 },
});
