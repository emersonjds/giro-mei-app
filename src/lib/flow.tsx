/* ---------------------------------------------------------------------------
   Estado da jornada, compartilhado entre as telas (CPF -> CNPJ -> docs -> score).
--------------------------------------------------------------------------- */
import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import {
  DEFAULT_PERSONA,
  DEFAULT_MONTHLY_REVENUE,
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
  monthlyRevenue: number;
  setMonthlyRevenue: (v: number) => void;
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

  /** Produto é capital de giro — finalidade não é coletada (sempre null). */
  purpose: CreditPurpose | null;
  requestedAmount: number | null;
  setRequestedAmount: (v: number) => void;

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
  const [trade, setTrade] = useState(DEFAULT_PERSONA.trade);
  const [monthlyRevenue, setMonthlyRevenueState] = useState(DEFAULT_MONTHLY_REVENUE);
  const [cpf, setCpf] = useState(DEFAULT_PERSONA.suggestedCPF);
  const [search, setSearch] = useState<CnpjSearch | null>(null);
  const [createdCNPJ, setCreatedCNPJ] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [requestedAmount, setRequestedAmountState] = useState<number | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  const value = useMemo<FlowState>(() => {
    const formalized = search?.status === "found" || createdCNPJ !== null;
    const activeCNPJ =
      search?.status === "found" ? search.cnpj : createdCNPJ ?? null;

    const persona: Persona = { ...DEFAULT_PERSONA, trade, monthlyRevenue };

    return {
      persona,
      trade,
      setTrade,
      monthlyRevenue,
      setMonthlyRevenue: (v: number) => setMonthlyRevenueState(Math.max(0, v)),
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

      purpose: null,
      requestedAmount,
      setRequestedAmount: (v: number) => setRequestedAmountState(v),

      contract,
      requestCredit: (lineId: string) => {
        const line = CREDIT_LINES.find((l) => l.id === lineId);
        if (!line) return;
        const c = buildContract(line, {
          persona,
          formalized,
          uploaded,
          purpose: null,
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
        setTrade(DEFAULT_PERSONA.trade);
        setMonthlyRevenueState(DEFAULT_MONTHLY_REVENUE);
        setCpf(DEFAULT_PERSONA.suggestedCPF);
        setSearch(null);
        setCreatedCNPJ(null);
        setUploaded([]);
        setSelectedLineId(null);
        setRequestedAmountState(null);
        setContract(null);
      },
    };
  }, [
    trade,
    monthlyRevenue,
    cpf,
    search,
    createdCNPJ,
    uploaded,
    selectedLineId,
    requestedAmount,
    contract,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFlow(): FlowState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFlow precisa estar dentro de <FlowProvider>");
  return ctx;
}
