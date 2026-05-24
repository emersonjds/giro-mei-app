import { useMemo, useState } from "react";
import { View, StyleSheet, Text, Modal, Pressable, ScrollView } from "react-native";

import { useFlow } from "@/lib/flow";
import { computeScore, computeCredit, formatBRL } from "@/lib/data";
import {
  rankLines,
  bestLine,
  cheapestUnlocked,
  docImpact,
  matchLine,
  validationFee,
  iofEstimate,
  contractCET,
  parcela,
  formatDateBR,
  institutionFor,
  institutionForLineId,
  CREDIT_LINES,
  LineMatch,
  Contract,
  Installment,
  Institution,
} from "@/lib/credit";
import {
  Screen,
  Brand,
  Title,
  Body,
  Muted,
  Label,
  Card,
  Btn,
  Pill,
  Bar,
  MatchBar,
  AiBadge,
  InstitutionLogo,
  StatusStepper,
  InstallmentRow,
  Toast,
  C,
  S,
  numStyle,
} from "@/lib/ui";

export default function CreditoScreen() {
  const { contract } = useFlow();
  return contract ? <MeuCredito contract={contract} /> : <Vitrine />;
}

/* =========================== VITRINE (sem contrato) ======================== */

function Vitrine() {
  const { persona, formalized, uploaded, requestedAmount, toggleDoc, requestCredit } = useFlow();

  const input = useMemo(
    () => ({ persona, formalized, uploaded, requestedAmount }),
    [persona, formalized, uploaded, requestedAmount],
  );

  const ranked = useMemo(() => rankLines(input), [input]);
  const score = useMemo(() => computeScore(input).score, [input]);
  const credit = useMemo(() => computeCredit(input), [input]);
  const impacts = useMemo(() => docImpact(input), [input]);

  const best = bestLine(ranked);
  const cheapest = cheapestUnlocked(ranked);

  const forYou = ranked.filter((m) => m.status === "best" || m.status === "unlocked");
  const locked = ranked.filter((m) => m.status === "locked");
  const future = ranked.filter((m) => m.status === "future");

  const unlockedCount = forYou.length;

  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [unlockId, setUnlockId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  const detail = detailId ? matchLine(CREDIT_LINES.find((l) => l.id === detailId)!, input) : null;
  const confirm = confirmId ? matchLine(CREDIT_LINES.find((l) => l.id === confirmId)!, input) : null;
  const unlockLine = unlockId ? matchLine(CREDIT_LINES.find((l) => l.id === unlockId)!, input) : null;

  function openConfirm(id: string) {
    setDetailId(null);
    setConfirmId(id);
  }

  function doConfirm() {
    if (!confirmId) return;
    requestCredit(confirmId);
    setConfirmId(null);
    // Não navega: a aba passa a renderizar "Meu crédito".
  }

  function showToast(message: string) {
    setToast({ visible: true, message });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2600);
  }

  function unlockDoc(docId: string, lineId: string) {
    toggleDoc(docId);
    const line = CREDIT_LINES.find((l) => l.id === lineId)!;
    const projected = matchLine(line, {
      ...input,
      uploaded: uploaded.includes(docId) ? uploaded : [...uploaded, docId],
    });
    if (projected.missingDocs.length === 0) {
      setUnlockId(null);
      showToast(`Linha desbloqueada — match subiu para ${projected.matchScore}%`);
    } else {
      showToast(`Documento enviado — faltam ${projected.missingDocs.length} para desbloquear`);
    }
  }

  return (
    <Screen>
      <Toast message={toast.message} visible={toast.visible} />
      <Brand />

      <View style={{ gap: S.sm, marginTop: S.sm }}>
        <Title>Suas linhas de crédito</Title>
        <Muted>
          Score {score} · limite estimado {formatBRL(credit.amount)}
        </Muted>
        <Body>
          Seu score abre {unlockedCount} de {CREDIT_LINES.length} linhas. Veja o match de cada uma e
          o que destrava as demais.
        </Body>
      </View>

      {forYou.length ? (
        <View style={{ gap: S.sm }}>
          <Label>Para você agora</Label>
          {forYou.map((m) => (
            <LineCard
              key={m.line.id}
              m={m}
              isBest={best?.line.id === m.line.id}
              isCheapest={cheapest?.line.id === m.line.id}
              onPrimary={() => (m.status === "best" ? openConfirm(m.line.id) : setDetailId(m.line.id))}
            />
          ))}
        </View>
      ) : null}

      {locked.length ? (
        <View style={{ gap: S.sm }}>
          <Label>Desbloqueie com documentos</Label>
          <Muted>
            Adicione documentos e desbloqueie {locked.length} linha{locked.length > 1 ? "s" : ""}.
          </Muted>
          {locked.map((m) => (
            <LockedCard key={m.line.id} m={m} onAdd={() => setUnlockId(m.line.id)} />
          ))}
        </View>
      ) : null}

      {future.length ? (
        <View style={{ gap: S.sm }}>
          <Label>Para o futuro</Label>
          {future.map((m) => (
            <Card key={m.line.id} tone="locked" style={{ gap: 4 }}>
              <View style={ls.head}>
                <Text style={ls.name}>{m.line.name}</Text>
                <Muted>Score atual ainda não habilita</Muted>
              </View>
              <Muted>
                {m.line.provider} · a partir de score {m.line.minScore}
              </Muted>
            </Card>
          ))}
        </View>
      ) : null}

      <View style={{ gap: S.sm }}>
        <Label>Por que esses documentos importam</Label>
        {impacts
          .filter((d) => !d.sent)
          .map((d) => (
            <Card key={d.doc.id} style={{ gap: 6 }}>
              <View style={ls.head}>
                <Text style={ls.name}>{d.doc.label}</Text>
                <Text style={ls.delta}>+{d.delta.points}pts</Text>
              </View>
              <Muted>{d.delta.rationale}</Muted>
              {d.unlocks.length ? (
                <Muted style={{ color: C.accent }}>
                  Destrava: {d.unlocks.map((l) => l.name).join(", ")}
                </Muted>
              ) : null}
            </Card>
          ))}
      </View>

      {/* MODAL: detalhes */}
      <Modal visible={!!detail} animationType="slide" transparent onRequestClose={() => setDetailId(null)}>
        <ModalShell onClose={() => setDetailId(null)}>
          {detail ? (
            <>
              <View style={ls.modalHead}>
                <InstLogo inst={institutionFor(detail.line)} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={ls.modalTitle}>{detail.line.name}</Text>
                  <Muted>
                    {institutionFor(detail.line).name} · {institutionFor(detail.line).kind}
                  </Muted>
                </View>
              </View>

              <View style={ls.matchBig}>
                <AiBadge label="Match calculado por IA" />
                <Text style={[ls.matchBigNum, numStyle]}>{detail.matchScore}%</Text>
                <Muted>de match com seu perfil</Muted>
              </View>
              <MatchBar
                value={detail.matchScore}
                potential={detail.status !== "best" ? detail.matchPotential : undefined}
              />

              <Label>Como calculamos</Label>
              {detail.factors.map((f) => (
                <Card key={f.key} style={{ gap: 6 }}>
                  <View style={ls.head}>
                    <Text style={ls.facLabel}>{f.label}</Text>
                    <Text style={ls.facPct}>{Math.round(f.value0a1 * 100)}%</Text>
                  </View>
                  <Bar value={f.value0a1} />
                  <Muted>{f.explanation}</Muted>
                </Card>
              ))}

              <Label>Custo completo</Label>
              <Card style={{ gap: 6 }}>
                <CostRow label="Taxa a.m." value={`${detail.rate.toLocaleString("pt-BR")}%`} />
                <CostRow label="CET a.m." value={`${detail.cet.amPct.toLocaleString("pt-BR")}%`} />
                <CostRow label="CET a.a." value={`${detail.cet.aaPct.toLocaleString("pt-BR")}%`} />
                <CostRow label="Parcela estimada" value={`${formatBRL(detail.parcelaEstimada)}/mês`} />
                <CostRow label="Valor liberado" value={formatBRL(detail.amount)} />
              </Card>

              <Btn label="Solicitar esta linha" variant="accent" onPress={() => openConfirm(detail.line.id)} />
            </>
          ) : null}
        </ModalShell>
      </Modal>

      {/* MODAL: confirmação de contratação */}
      <Modal visible={!!confirm} animationType="slide" transparent onRequestClose={() => setConfirmId(null)}>
        <ModalShell onClose={() => setConfirmId(null)}>
          {confirm ? <ConfirmContent m={confirm} onConfirm={doConfirm} /> : null}
        </ModalShell>
      </Modal>

      {/* MODAL: adicionar documentos */}
      <Modal visible={!!unlockLine} animationType="slide" transparent onRequestClose={() => setUnlockId(null)}>
        <ModalShell onClose={() => setUnlockId(null)}>
          {unlockLine ? (
            <>
              <Text style={ls.modalTitle}>Desbloquear {unlockLine.line.name}</Text>
              <Muted>Adicione os documentos abaixo. O match chega a {unlockLine.matchPotential}%.</Muted>
              {unlockLine.missingDocs.length ? (
                unlockLine.missingDocs.map((d) => (
                  <Card key={d.id} style={{ gap: S.sm }}>
                    <View style={ls.head}>
                      <View style={{ flex: 1 }}>
                        <Text style={ls.name}>{d.label}</Text>
                        <Muted>{d.hint}</Muted>
                      </View>
                    </View>
                    <Btn
                      label="Enviar documento"
                      variant="ghost"
                      onPress={() => unlockDoc(d.id, unlockLine.line.id)}
                    />
                  </Card>
                ))
              ) : (
                <Muted>Todos os documentos já foram enviados.</Muted>
              )}
            </>
          ) : null}
        </ModalShell>
      </Modal>
    </Screen>
  );
}

/** Conteúdo do modal de confirmação com custo da operação fiel. */
function ConfirmContent({ m, onConfirm }: { m: LineMatch; onConfirm: () => void }) {
  const months = Math.round((m.line.termMin + m.line.termMax) / 2);
  const fee = validationFee(m.amount);
  const iof = iofEstimate(m.amount, months * 30);
  const cet = contractCET(m.amount, m.rate, months, fee, iof);
  const pmt = parcela(m.amount, m.rate, months);
  const total = pmt * months;
  const inst = institutionFor(m.line);

  return (
    <>
      <View style={ls.modalHead}>
        <InstLogo inst={inst} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={ls.modalTitle}>Solicitar {m.line.name}</Text>
          <Muted>
            {inst.name} · {inst.kind}
          </Muted>
        </View>
      </View>

      <Card style={{ gap: 6 }}>
        <CostRow label="Valor" value={formatBRL(m.amount)} />
        <CostRow label="Parcela" value={`${formatBRL(pmt)}/mês`} />
        <CostRow label="Prazo" value={`${months} meses`} />
      </Card>

      <Label>Custo da operação</Label>
      <Card style={{ gap: 6 }}>
        <View style={ls.feeHighlight}>
          <Muted style={{ flex: 1, color: C.text, fontWeight: "700" }}>
            Taxa de análise e avaliação de garantia
          </Muted>
          <Text style={[ls.feeVal, numStyle]}>{formatBRL(fee)}</Text>
        </View>
        <CostRow label="IOF" value={formatBRL(iof)} />
        <CostRow label="CET (inclui taxa e IOF)" value={`${cet.aaPct.toLocaleString("pt-BR")}% a.a.`} />
        <CostRow label="Total a pagar" value={`${formatBRL(total)} (${formatBRL(pmt)}×${months})`} />
      </Card>

      <CustoCompleto
        valor={m.amount}
        taxaAm={m.rate}
        cetAm={cet.amPct}
        cetAa={cet.aaPct}
        fee={fee}
        iof={iof}
        recebe={m.amount - fee - iof}
        parcelaMes={pmt}
        months={months}
        total={total}
      />

      <Muted>O dinheiro cai na sua conta em D+1 útil após a assinatura.</Muted>
      <View style={{ flexDirection: "row" }}>
        <Pill tone="success">Você não assina nada agora</Pill>
      </View>

      <Btn label="Solicitar análise" variant="accent" onPress={onConfirm} />
    </>
  );
}

/* =========================== MEU CRÉDITO (com contrato) ==================== */

const STATUS_STEPS: { key: Contract["status"]; label: string }[] = [
  { key: "em_analise", label: "Solicitado" },
  { key: "aprovado", label: "Aprovado" },
  { key: "contrato_assinado", label: "Contrato assinado" },
  { key: "desembolso_agendado", label: "Desembolso agendado" },
  { key: "liberado", label: "Liberado" },
];

function MeuCredito({ contract }: { contract: Contract }) {
  const { approveCredit, signContract, releaseDisbursement, payInstallment } = useFlow();
  const [payN, setPayN] = useState<number | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  function showToast(message: string) {
    setToast({ visible: true, message });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2600);
  }

  // Mapeia status -> índice. "contrato_assinado" não é um estado final do flow
  // (assinar avança direto para desembolso_agendado), mas tratamos como done.
  const curIdx = STATUS_STEPS.findIndex((s) => s.key === contract.status);

  const dateFor = (key: Contract["status"]): string | undefined => {
    switch (key) {
      case "em_analise":
        return contract.requestedAt ? formatDateBR(contract.requestedAt.slice(0, 10)) : undefined;
      case "aprovado":
        return contract.approvedAt ? formatDateBR(contract.approvedAt.slice(0, 10)) : undefined;
      case "contrato_assinado":
        return contract.signedAt ? formatDateBR(contract.signedAt.slice(0, 10)) : undefined;
      case "desembolso_agendado":
        return contract.scheduledDisbursementDate
          ? formatDateBR(contract.scheduledDisbursementDate)
          : undefined;
      case "liberado":
        return contract.disbursedAt ? formatDateBR(contract.disbursedAt.slice(0, 10)) : undefined;
    }
  };

  const steps = STATUS_STEPS.map((s, i) => ({
    label: s.label,
    done: i < curIdx || contract.status === "liberado",
    active: i === curIdx && contract.status !== "liberado",
    date: dateFor(s.key),
  }));

  const nextInstallment = contract.installments.find(
    (p) => p.status === "a_vencer" || p.status === "atrasada",
  );

  // Custo completo da proposta contratada (CET fiel pela TIR do fluxo).
  const pmt = parcela(contract.amount, contract.rate, contract.months);
  const cet = contractCET(contract.amount, contract.rate, contract.months, contract.fee, contract.iof);
  const totalPay = pmt * contract.months;
  const inst = institutionForLineId(contract.lineId);

  function doPay() {
    if (payN == null) return;
    payInstallment(payN);
    setPayN(null);
    showToast("Pagamento confirmado");
  }

  return (
    <Screen>
      <Toast message={toast.message} visible={toast.visible} />
      <Brand />

      <View style={{ gap: S.sm, marginTop: S.sm }}>
        <Title>Meu crédito</Title>
      </View>

      <Card tone="highlight" style={{ gap: S.sm }}>
        <View style={ls.head}>
          {inst ? <InstLogo inst={inst} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={ls.name}>{contract.lineName}</Text>
            <Muted>{inst ? inst.name : contract.provider}</Muted>
          </View>
        </View>
        <Text style={[ms.bigMoney, numStyle]}>{formatBRL(contract.amount)}</Text>
        <CostRow label="Você recebe" value={formatBRL(contract.netAmount)} />
        <CostRow label="Parcelas" value={`${formatBRL(pmt)} × ${contract.months}`} />
      </Card>

      <CustoCompleto
        valor={contract.amount}
        taxaAm={contract.rate}
        cetAm={cet.amPct}
        cetAa={cet.aaPct}
        fee={contract.fee}
        iof={contract.iof}
        recebe={contract.netAmount}
        parcelaMes={pmt}
        months={contract.months}
        total={totalPay}
      />

      <View style={{ gap: S.sm }}>
        <Label>Acompanhamento</Label>
        <Card>
          <StatusStepper steps={steps} />
        </Card>
      </View>

      {contract.status === "em_analise" ? (
        <Btn label="Aprovar (simular)" variant="accent" onPress={approveCredit} />
      ) : null}
      {contract.status === "aprovado" ? (
        <Btn label="Assinar contrato" variant="accent" onPress={signContract} />
      ) : null}
      {contract.status === "desembolso_agendado" ? (
        <Btn label="Simular liberação" variant="accent" onPress={releaseDisbursement} />
      ) : null}
      {contract.status === "liberado" ? (
        <Card style={{ borderColor: C.success }}>
          <Muted style={{ color: C.success, fontWeight: "800" }}>
            {formatBRL(contract.netAmount)} creditado na sua conta em{" "}
            {contract.disbursedAt ? formatDateBR(contract.disbursedAt.slice(0, 10)) : "—"}.
          </Muted>
        </Card>
      ) : null}

      {contract.installments.length ? (
        <>
          {nextInstallment ? (
            <View style={{ gap: S.sm }}>
              <Label>Próxima parcela</Label>
              <Card tone="highlight" style={{ gap: S.sm }}>
                <View style={ls.head}>
                  <View style={{ flex: 1 }}>
                    <Text style={ls.name}>
                      Parcela {nextInstallment.n}/{contract.months}
                    </Text>
                    <Muted>vence {formatDateBR(nextInstallment.dueDate)}</Muted>
                  </View>
                  <Text style={[ms.parcelaVal, numStyle]}>{formatBRL(nextInstallment.amount)}</Text>
                </View>
                <Btn label="Pagar com PIX" variant="accent" onPress={() => setPayN(nextInstallment.n)} />
              </Card>
            </View>
          ) : null}

          <View style={{ gap: S.sm }}>
            <Label>Cronograma</Label>
            <Card style={{ gap: 2 }}>
              {contract.installments.map((p: Installment) => (
                <InstallmentRow
                  key={p.n}
                  n={p.n}
                  total={contract.months}
                  dueLabel={formatDateBR(p.dueDate)}
                  amountLabel={formatBRL(p.amount)}
                  status={p.status}
                />
              ))}
            </Card>
          </View>
        </>
      ) : null}

      {/* MODAL: pagamento PIX */}
      <Modal visible={payN != null} animationType="slide" transparent onRequestClose={() => setPayN(null)}>
        <ModalShell onClose={() => setPayN(null)}>
          <Text style={ls.modalTitle}>Pagar com PIX</Text>
          <Muted>Escaneie o QR Code ou copie o código abaixo.</Muted>
          <View style={ms.qrBox}>
            <Text style={ms.qrEmoji}>▦</Text>
          </View>
          <Card>
            <Muted style={{ color: C.text }} >
              00020126580014BR.GOV.BCB.PIX0136giro-mei-demo-{payN}5204000053039865802BR
            </Muted>
          </Card>
          <Btn label="Confirmar pagamento" variant="accent" onPress={doPay} />
        </ModalShell>
      </Modal>
    </Screen>
  );
}

/* ----------------------------- subcomponentes ----------------------------- */

function LineCard({
  m,
  isBest,
  isCheapest,
  onPrimary,
}: {
  m: LineMatch;
  isBest: boolean;
  isCheapest: boolean;
  onPrimary: () => void;
}) {
  const inst = institutionFor(m.line);
  return (
    <Card tone={isBest ? "highlight" : "default"} style={{ gap: S.sm }}>
      <View style={ls.head}>
        <InstLogo inst={inst} />
        <View style={{ flex: 1 }}>
          <Text style={ls.name}>{m.line.name}</Text>
          <Text style={ls.caption}>{inst.name}</Text>
        </View>
        <View style={ls.badges}>
          {isBest ? <Pill tone="accent">Melhor para você</Pill> : null}
          {isCheapest ? <Pill tone="success">Menor custo</Pill> : null}
        </View>
      </View>

      <View style={ls.numbers}>
        <View>
          <Muted>Valor estimado</Muted>
          <Text style={[ls.amount, numStyle]}>{formatBRL(m.amount)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Muted>a partir de</Muted>
          <Text style={[ls.rate, numStyle]}>{m.rate.toLocaleString("pt-BR")}% a.m.</Text>
          <Muted>{m.line.termMin}–{m.line.termMax} meses</Muted>
        </View>
      </View>

      <AiBadge />
      <MatchBar value={m.matchScore} />

      <Btn
        label={isBest ? "Solicitar esta linha" : "Ver detalhes"}
        variant={isBest ? "accent" : "ghost"}
        onPress={onPrimary}
      />
    </Card>
  );
}

function LockedCard({ m, onAdd }: { m: LineMatch; onAdd: () => void }) {
  const inst = institutionFor(m.line);
  return (
    <Card tone="locked" style={{ gap: S.sm }}>
      <View style={ls.head}>
        <InstLogo inst={inst} />
        <View style={{ flex: 1 }}>
          <Text style={ls.name}>{m.line.name}</Text>
          <Text style={ls.caption}>{inst.name}</Text>
        </View>
        <View style={ls.lock}>
          <View style={ls.lockBody} />
          <View style={ls.lockShackle} />
        </View>
      </View>

      <View style={ls.numbers}>
        <View>
          <Muted>Valor estimado</Muted>
          <Text style={[ls.amount, numStyle]}>{formatBRL(m.amount)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Muted>a partir de</Muted>
          <Text style={[ls.rate, numStyle]}>{m.rate.toLocaleString("pt-BR")}% a.m.</Text>
        </View>
      </View>

      <AiBadge />
      <MatchBar value={m.matchScore} potential={m.matchPotential} />
      <Muted style={{ color: C.faint }}>Faltam: {m.missingDocs.map((d) => d.label).join(", ")}</Muted>
      <Muted style={{ color: C.accent }}>Com os documentos: chega a {m.matchPotential}%</Muted>

      <Btn label="Adicionar documentos" variant="ghost" onPress={onAdd} />
    </Card>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <View style={ls.modalOverlay}>
      <Pressable style={ls.modalBackdrop} onPress={onClose} />
      <View style={ls.modalSheet}>
        <View style={ls.modalHandleRow}>
          <View style={ls.modalHandle} />
          <Pressable onPress={onClose} hitSlop={10} style={ls.modalClose}>
            <Text style={ls.modalCloseTxt}>Fechar</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={ls.modalScroll} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={ls.costRow}>
      <Muted style={{ flex: 1 }}>{label}</Muted>
      <Text style={[ls.costVal, numStyle]}>{value}</Text>
    </View>
  );
}

/** Logo de instituição a partir do registro de marca. */
function InstLogo({ inst, size = 40 }: { inst: Institution; size?: number }) {
  return <InstitutionLogo initials={inst.initials} color={inst.color} fg={inst.fg} size={size} />;
}

/** Quadro de custo total da operação — transparência plena (CET, taxa, IOF). */
function CustoCompleto({
  valor,
  taxaAm,
  cetAm,
  cetAa,
  fee,
  iof,
  recebe,
  parcelaMes,
  months,
  total,
}: {
  valor: number;
  taxaAm: number;
  cetAm: number;
  cetAa: number;
  fee: number;
  iof: number;
  recebe: number;
  parcelaMes: number;
  months: number;
  total: number;
}) {
  return (
    <View style={{ gap: S.sm }}>
      <Label>Custo completo</Label>
      <Card style={{ gap: 6 }}>
        <CostRow label="Valor solicitado" value={formatBRL(valor)} />
        <CostRow label="Taxa a.m." value={`${taxaAm.toLocaleString("pt-BR")}%`} />
        <CostRow label="CET a.m." value={`${cetAm.toLocaleString("pt-BR")}%`} />
        <CostRow label="CET a.a." value={`${cetAa.toLocaleString("pt-BR")}%`} />
        <CostRow label="Taxa de análise" value={formatBRL(fee)} />
        <CostRow label="IOF" value={formatBRL(iof)} />
        <CostRow label="Você recebe (líquido)" value={formatBRL(recebe)} />
        <CostRow label="Parcela" value={`${formatBRL(parcelaMes)}/mês × ${months}`} />
        <View style={ls.totalRow}>
          <Muted style={{ flex: 1, color: C.text, fontWeight: "800" }}>Total a pagar</Muted>
          <Text style={[ls.costVal, { fontSize: 15 }, numStyle]}>{formatBRL(total)}</Text>
        </View>
      </Card>
    </View>
  );
}

const ms = StyleSheet.create({
  bigMoney: { color: C.text, fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  parcelaVal: { color: C.text, fontSize: 20, fontWeight: "900", fontVariant: ["tabular-nums"] },
  qrBox: {
    height: 160,
    borderRadius: 16,
    borderColor: C.border,
    borderWidth: 1,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  qrEmoji: { fontSize: 96, color: C.text },
});

const ls = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: S.sm },
  name: { color: C.text, fontSize: 16, fontWeight: "800" },
  caption: { color: C.muted, fontSize: 12, fontWeight: "600" },
  badges: { gap: 4, alignItems: "flex-end" },
  numbers: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  amount: { color: C.text, fontSize: 24, fontWeight: "900", fontVariant: ["tabular-nums"] },
  rate: { color: C.text, fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
  delta: { color: C.accent, fontSize: 15, fontWeight: "900" },
  lock: { width: 22, height: 24, alignItems: "center", justifyContent: "flex-end" },
  lockBody: { width: 18, height: 13, borderRadius: 3, backgroundColor: C.faint },
  lockShackle: {
    position: "absolute",
    top: 0,
    width: 12,
    height: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: C.faint,
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderColor: C.border,
    borderWidth: 1,
    maxHeight: "90%",
    paddingHorizontal: S.lg,
    paddingBottom: S.xl,
  },
  modalHandleRow: { flexDirection: "row", alignItems: "center", paddingTop: S.md },
  modalHandle: { position: "absolute", left: 0, right: 0, alignSelf: "center", width: 40, height: 4, borderRadius: 999, backgroundColor: C.border, top: S.md },
  modalClose: { marginLeft: "auto", paddingVertical: 4 },
  modalCloseTxt: { color: C.muted, fontSize: 14, fontWeight: "700" },
  modalScroll: { gap: S.md, paddingTop: S.md, paddingBottom: S.lg },
  modalTitle: { color: C.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  matchBig: { alignItems: "center", gap: 6, paddingVertical: S.sm },
  matchBigNum: { color: C.ai, fontSize: 56, fontWeight: "900", letterSpacing: -2 },
  facLabel: { color: C.text, fontSize: 14, fontWeight: "700", flex: 1 },
  facPct: { color: C.text, fontSize: 14, fontWeight: "900", fontVariant: ["tabular-nums"] },
  costRow: { flexDirection: "row", alignItems: "center", gap: S.sm },
  costVal: { color: C.text, fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    marginTop: 2,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  modalHead: { flexDirection: "row", alignItems: "center", gap: S.sm },
  feeHighlight: {
    flexDirection: "row",
    alignItems: "center",
    gap: S.sm,
    backgroundColor: C.accentSoft,
    borderRadius: 10,
    padding: S.sm,
  },
  feeVal: { color: C.accent, fontSize: 15, fontWeight: "900", fontVariant: ["tabular-nums"] },
});
