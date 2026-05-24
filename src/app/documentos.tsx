import { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { useFlow } from "@/lib/flow";
import { DocType } from "@/lib/data";
import { ALL_DOC_TYPES } from "@/lib/credit";
import { Screen, TopBar, Title, Body, Muted, Card, Btn, C, S } from "@/lib/ui";

const GROUPS: { key: DocType["group"]; label: string }[] = [
  { key: "conta", label: "Contas em dia" },
  { key: "banco", label: "Banco" },
  { key: "movimento", label: "Movimento / faturamento" },
  { key: "fiscal", label: "Fiscal (MEI)" },
];

export default function DocumentosScreen() {
  const router = useRouter();
  const { uploaded, toggleDoc, simulateAllSent } = useFlow();
  const [files, setFiles] = useState<Record<string, string>>({});

  async function pick(id: string) {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets[0]) {
        setFiles((f) => ({ ...f, [id]: res.assets![0].name }));
        if (!uploaded.includes(id)) toggleDoc(id);
      }
    } catch {
      // ignora cancelamento/erro do seletor
    }
  }

  function remove(id: string) {
    setFiles((f) => {
      const c = { ...f };
      delete c[id];
      return c;
    });
    if (uploaded.includes(id)) toggleDoc(id);
  }

  const sent = uploaded.length;

  return (
    <Screen>
      <TopBar step={3} total={7} />

      <View style={{ gap: S.sm, marginTop: S.md }}>
        <Title>Seus documentos</Title>
        <Body>
          Cada documento vira uma prova de que você paga em dia e movimenta dinheiro. Aceitamos PDF
          ou foto.
        </Body>
      </View>

      {/* Atalho de demonstração: marca tudo como enviado e libera as linhas */}
      <Card tone="highlight" style={{ gap: S.sm }}>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: "800" }}>Modo demonstração</Text>
        <Muted>Marque todos os documentos como enviados para liberar suas linhas de crédito.</Muted>
        <Btn label="⚡ Simular envio de todos" variant="accent" onPress={simulateAllSent} />
      </Card>

      {GROUPS.map((g) => (
        <View key={g.key} style={{ gap: S.sm }}>
          <Muted style={{ fontWeight: "700", color: C.text }}>{g.label}</Muted>
          {ALL_DOC_TYPES.filter((d) => d.group === g.key).map((d) => {
            const done = uploaded.includes(d.id);
            return (
              <Card key={d.id} tone={done ? "highlight" : "default"}>
                {done ? (
                  <View style={ds.marker}>
                    <Text style={ds.markerTxt}>✓ Enviado</Text>
                  </View>
                ) : null}
                <View style={ds.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.text, fontSize: 15, fontWeight: "700" }}>{d.label}</Text>
                    <Muted>{done ? files[d.id] ?? "Documento anexado" : d.hint}</Muted>
                  </View>
                  {done ? (
                    <Pressable onPress={() => remove(d.id)} hitSlop={8}>
                      <Muted style={{ textDecorationLine: "underline" }}>trocar</Muted>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => pick(d.id)} style={ds.upBtn}>
                      <Text style={{ color: C.text, fontWeight: "700" }}>Enviar</Text>
                    </Pressable>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      ))}

      <View style={{ gap: S.sm }}>
        <Btn
          label={sent > 0 ? "Continuar" : "Pular por enquanto"}
          onPress={() => router.push("/obras")}
          variant={sent > 0 ? "primary" : "ghost"}
        />
        <Muted style={{ textAlign: "center" }}>{sent} de {ALL_DOC_TYPES.length} documentos enviados</Muted>
      </View>
    </Screen>
  );
}

const ds = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: S.md },
  marker: {
    position: "absolute",
    top: -10,
    right: 12,
    backgroundColor: C.success,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    zIndex: 2,
  },
  markerTxt: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  upBtn: {
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: S.md,
    paddingVertical: 10,
  },
});
