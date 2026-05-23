/* ---------------------------------------------------------------------------
   Estado da jornada, compartilhado entre as telas (CPF -> CNPJ -> docs -> score).
--------------------------------------------------------------------------- */
import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import {
  TRANCISTA,
  Persona,
  CnpjSearch,
  searchCNPJ,
  generateCNPJ,
} from "./data";
import {
  ALL_DOC_TYPES,
  CREDIT_LINES,
  CreditPurpose,
  Contract,
  buildContract,
  buildInstallments,
  nextBusinessDay,
} from "./credit";

const TODAY_ISO = "2026-05-23";

type FlowState = {
  persona: Persona;
  trade: string;
  setTrade: (v: string) => void;
  cpf: string;
  setCpf: (v: string) => void;

  search: CnpjSearch | null;
  runSearch: () => CnpjSearch;
  createdCNPJ: string | null;
  createMEI: () => string;
  formalized: boolean;
  activeCNPJ: string | null;

  uploaded: string[];
  toggleDoc: (id: string) => void;
  /** Demo: marca todos os documentos como enviados e formaliza o CNPJ. */
  simulateAllSent: () => void;

  selectedLineId: string | null;
  selectLine: (id: string) => void;

  purpose: CreditPurpose | null;
  setPurpose: (p: CreditPurpose) => void;
  requestedAmount: number | null;
  setRequestedAmount: (v: number) => void;
  goalFilterOn: boolean;
  toggleGoalFilter: () => void;

  contract: Contract | null;
  requestCredit: (lineId: string) => void;
  approveCredit: () => void;
  signContract: () => void;
  releaseDisbursement: () => void;
  payInstallment: (n: number) => void;

  reset: () => void;
};

const Ctx = createContext<FlowState | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [trade, setTrade] = useState(TRANCISTA.trade);
  const [cpf, setCpf] = useState(TRANCISTA.suggestedCPF);
  const [search, setSearch] = useState<CnpjSearch | null>(null);
  const [createdCNPJ, setCreatedCNPJ] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [purpose, setPurposeState] = useState<CreditPurpose | null>(null);
  const [requestedAmount, setRequestedAmountState] = useState<number | null>(null);
  const [goalFilterOn, setGoalFilterOn] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);

  const value = useMemo<FlowState>(() => {
    const formalized = search?.status === "found" || createdCNPJ !== null;
    const activeCNPJ =
      search?.status === "found" ? search.cnpj : createdCNPJ ?? null;

    return {
      persona: { ...TRANCISTA, trade },
      trade,
      setTrade,
      cpf,
      setCpf,
      search,
      runSearch: () => {
        const r = searchCNPJ(cpf);
        setSearch(r);
        return r;
      },
      createdCNPJ,
      createMEI: () => {
        const c = generateCNPJ(cpf);
        setCreatedCNPJ(c);
        return c;
      },
      formalized,
      activeCNPJ,
      uploaded,
      toggleDoc: (id: string) =>
        setUploaded((u) => (u.includes(id) ? u.filter((x) => x !== id) : [...u, id])),
      simulateAllSent: () => {
        setUploaded(ALL_DOC_TYPES.map((d) => d.id));
        if (search?.status !== "found" && createdCNPJ === null) {
          setCreatedCNPJ(generateCNPJ(cpf));
        }
      },
      selectedLineId,
      selectLine: (id: string) => setSelectedLineId(id),

      purpose,
      setPurpose: (p: CreditPurpose) => setPurposeState(p),
      requestedAmount,
      setRequestedAmount: (v: number) => setRequestedAmountState(v),
      goalFilterOn,
      toggleGoalFilter: () => setGoalFilterOn((on) => !on),

      contract,
      requestCredit: (lineId: string) => {
        const line = CREDIT_LINES.find((l) => l.id === lineId);
        if (!line) return;
        const c = buildContract(line, {
          persona: TRANCISTA,
          formalized,
          uploaded,
          purpose,
          requestedAmount,
        });
        setSelectedLineId(lineId);
        setContract(c);
      },
      approveCredit: () =>
        setContract((c) =>
          c ? { ...c, status: "aprovado", approvedAt: new Date(TODAY_ISO + "T00:00:00.000Z").toISOString() } : c,
        ),
      signContract: () =>
        setContract((c) => {
          if (!c) return c;
          const today = new Date(TODAY_ISO + "T00:00:00.000Z");
          const sched = nextBusinessDay(today, 1);
          const schedIso = sched.toISOString().slice(0, 10);
          const signed: Contract = {
            ...c,
            status: "desembolso_agendado",
            signedAt: today.toISOString(),
            scheduledDisbursementDate: schedIso,
          };
          return { ...signed, installments: buildInstallments(signed, sched) };
        }),
      releaseDisbursement: () =>
        setContract((c) =>
          c ? { ...c, status: "liberado", disbursedAt: new Date(TODAY_ISO + "T00:00:00.000Z").toISOString() } : c,
        ),
      payInstallment: (n: number) =>
        setContract((c) => {
          if (!c) return c;
          const paidAt = new Date(TODAY_ISO + "T00:00:00.000Z").toISOString();
          return {
            ...c,
            installments: c.installments.map((p) =>
              p.n === n ? { ...p, status: "paga", paidAt } : p,
            ),
          };
        }),

      reset: () => {
        setTrade(TRANCISTA.trade);
        setCpf(TRANCISTA.suggestedCPF);
        setSearch(null);
        setCreatedCNPJ(null);
        setUploaded([]);
        setSelectedLineId(null);
        setPurposeState(null);
        setRequestedAmountState(null);
        setGoalFilterOn(false);
        setContract(null);
      },
    };
  }, [
    trade,
    cpf,
    search,
    createdCNPJ,
    uploaded,
    selectedLineId,
    purpose,
    requestedAmount,
    goalFilterOn,
    contract,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFlow(): FlowState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFlow precisa estar dentro de <FlowProvider>");
  return ctx;
}
