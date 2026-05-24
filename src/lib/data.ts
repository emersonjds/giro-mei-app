/* ---------------------------------------------------------------------------
   Núcleo de dados/lógica — capital de giro para MEIs (e informais virando MEI).
   Modelo v6: dupla validação — score alternativo próprio ("2ª camada") + aval
   do FAMPE/Sebrae (até 80%). Garantia = FAMPE, não agenda de trabalhos futuros.
   Sirve qualquer ofício. Tudo mock para fins de demonstração.
--------------------------------------------------------------------------- */

// `CreditPurpose` é definido em credit.ts; importado como tipo para o ScoreInput.
import type { CreditPurpose } from "./credit";

/* ------------------------------- formato --------------------------------- */

export function formatBRL(value: number): string {
  const neg = value < 0;
  let n = Math.round(Math.abs(value)).toString();
  let out = "";
  while (n.length > 3) {
    out = "." + n.slice(-3) + out;
    n = n.slice(0, -3);
  }
  out = n + out;
  return (neg ? "-" : "") + "R$ " + out;
}

export function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

export function formatCPF(s: string): string {
  const d = onlyDigits(s).slice(0, 11);
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9, 11)];
  let out = p[0];
  if (p[1]) out += "." + p[1];
  if (p[2]) out += "." + p[2];
  if (p[3]) out += "-" + p[3];
  return out;
}

/* ---------------------------- CPF (checksum) ------------------------------ */

export function isValidCPF(input: string): boolean {
  const c = onlyDigits(input);
  if (c.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i], 10) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(c[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i], 10) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(c[10], 10);
}

/* ------------------------------ CNPJ (mock) ------------------------------- */

function cnpjCheckDigits(base12: string): string {
  const calc = (nums: string): number => {
    const weights =
      nums.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < nums.length; i++) sum += parseInt(nums[i], 10) * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(base12);
  const d2 = calc(base12 + d1);
  return "" + d1 + d2;
}

export function formatCNPJ(raw: string): string {
  const d = onlyDigits(raw).padStart(14, "0").slice(0, 14);
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/** Gera um CNPJ com dígitos verificadores válidos, derivado do CPF. */
export function generateCNPJ(cpf: string): string {
  const d = onlyDigits(cpf);
  const base8 = (d.slice(0, 8) || "00000000").padEnd(8, "0");
  const base12 = base8 + "0001"; // matriz
  const dv = cnpjCheckDigits(base12);
  return formatCNPJ(base12 + dv);
}

export type CnpjSearch =
  | { status: "found"; cnpj: string; razao: string; cnae: string; abertura: string; situacao: string }
  | { status: "none" };

/**
 * Simula a consulta CPF -> CNPJ. (Em produção: Receita Federal / SERPRO ou
 * um provedor de dados de CNPJ.) Regra determinística para a demo:
 * soma dos dígitos par => NÃO possui CNPJ (mostramos a criação do MEI);
 * ímpar => já possui um CNPJ ativo.
 */
export function searchCNPJ(cpf: string): CnpjSearch {
  const d = onlyDigits(cpf);
  const sum = d.split("").reduce((a, c) => a + parseInt(c, 10), 0);
  if (sum % 2 === 0) return { status: "none" };
  return {
    status: "found",
    cnpj: generateCNPJ(cpf),
    razao: "KEILA FERNANDES SERVIÇOS MEI",
    cnae: "9602-5/01 — Outros serviços de beleza e higiene pessoal",
    abertura: "12/03/2021",
    situacao: "Ativa",
  };
}

/* ----------------------------- persona base ------------------------------- */

/**
 * Persona genérica para qualquer MEI. O sinal de renda é o faturamento médio
 * mensal (monthlyRevenue), editável pelo usuário na tela de movimento.
 * Não há mais lista de "obras/agenda" — a garantia é o FAMPE, não recebíveis
 * futuros específicos de um ofício.
 */
export type Persona = {
  name: string;
  trade: string;
  age: number;
  location: string;
  yearsInTrade: number;
  /** CPF válido pré-preenchido para a demo (o usuário pode trocar). */
  suggestedCPF: string;
  /** Faturamento médio mensal declarado pelo usuário (R$). Editável. */
  monthlyRevenue: number;
};

/** Valor padrão de faturamento mensal para a demo (qualquer ofício). */
export const DEFAULT_MONTHLY_REVENUE = 2800;

export const DEFAULT_PERSONA: Persona = {
  name: "Dona Keila",
  trade: "Autônoma",
  age: 34,
  location: "Grajaú, São Paulo",
  yearsInTrade: 11,
  suggestedCPF: "111.444.777-35", // CPF válido; soma par => sem CNPJ (vamos criar)
  monthlyRevenue: DEFAULT_MONTHLY_REVENUE,
};

/**
 * Faturamento anual projetado (12 meses). Usado como referência de capacidade
 * de pagamento — NÃO como garantia (a garantia é o FAMPE).
 */
export function annualRevenue(p: Persona): number {
  return p.monthlyRevenue * 12;
}

/* ------------------------------ documentos -------------------------------- */

export type DocType = {
  id: string;
  label: string;
  hint: string;
  group: "conta" | "banco" | "movimento" | "fiscal";
};

export const DOC_TYPES: DocType[] = [
  { id: "luz", label: "Conta de luz", hint: "Últimos 3 meses", group: "conta" },
  { id: "agua", label: "Conta de água", hint: "Últimos 3 meses", group: "conta" },
  { id: "telefone", label: "Telefone / internet", hint: "Fatura recente", group: "conta" },
  { id: "aluguel", label: "Comprovante de aluguel", hint: "Recibo ou contrato", group: "conta" },
  { id: "extrato", label: "Extrato bancário", hint: "PDF dos últimos 90 dias", group: "banco" },
  { id: "contratos", label: "Comprovante de faturamento", hint: "Nota fiscal, recibo ou contrato de serviço", group: "movimento" },
];

export const CONTA_DOC_IDS = DOC_TYPES.filter((d) => d.group === "conta").map((d) => d.id);

/* -------------------------------- score ----------------------------------- */

export type ScoreFactor = {
  label: string;
  points: number;
  strength: number; // 0..1
  positive: boolean;
  explanation: string;
};

export type ScoreResult = {
  score: number; // 300..1000
  ratingLabel: string;
  ratingTone: "great" | "good" | "fair";
  factors: ScoreFactor[];
};

const SCORE_FLOOR = 300;
const SCORE_RANGE = 700;

/**
 * Saturação do faturamento mensal usada na calibragem do score.
 * Representa o nível em que o fator "movimento" atinge peso máximo.
 */
export const REVENUE_SATURATION = 8000;

export type ScoreInput = {
  persona: Persona;
  formalized: boolean; // possui/possuirá CNPJ
  uploaded: string[]; // ids de documentos enviados
  /** Objetivo do crédito — NÃO afeta o score; influencia ranking/UI. */
  purpose?: CreditPurpose | null;
  /** Valor pedido — NÃO afeta o score; influencia limite/fator valor. */
  requestedAmount?: number | null;
};

/**
 * Score "2ª camada": modelo alternativo próprio, calibrado pela realidade do
 * trabalho informal. Fatores: faturamento/movimento + dados bancários +
 * contas em dia + formalização + experiência. Range 300–1000.
 *
 * NÃO é o score Serasa/SPC; é a camada de avaliação complementar que,
 * junto com o aval do FAMPE/Sebrae, destrava o crédito para quem o banco
 * sempre negou.
 */
export function computeScore({ persona, formalized, uploaded }: ScoreInput): ScoreResult {
  const contasUp = CONTA_DOC_IDS.filter((id) => uploaded.includes(id)).length;
  const hasExtrato = uploaded.includes("extrato");
  const hasFaturamento = uploaded.includes("contratos");

  // Força do faturamento: satura em REVENUE_SATURATION (teto do score deste fator).
  const revenueStrength = Math.min(persona.monthlyRevenue / REVENUE_SATURATION, 1);
  // Boost adicional se comprovante de faturamento foi enviado.
  const movimentoStrength = Math.min(revenueStrength + (hasFaturamento ? 0.15 : 0), 1);

  const weights = [
    {
      label: "Movimento do seu trabalho",
      weight: 0.32,
      strength: movimentoStrength,
      explanation: hasFaturamento
        ? `Faturamento de ${formatBRL(persona.monthlyRevenue)}/mês comprovado — movimento real do negócio.`
        : `Faturamento declarado de ${formatBRL(persona.monthlyRevenue)}/mês — envie um comprovante para reforçar.`,
    },
    {
      label: "Formalização (CNPJ ativo)",
      weight: 0.22,
      strength: formalized ? 1 : 0.2,
      explanation: formalized
        ? "CNPJ ativo: sai da informalidade e entra no sistema bancário formal."
        : "Sem CNPJ ainda — a formalização destrava boa parte do score.",
    },
    {
      label: "Contas em dia (água, luz, telefone, aluguel)",
      weight: 0.2,
      strength: contasUp / CONTA_DOC_IDS.length,
      explanation: `${contasUp} de ${CONTA_DOC_IDS.length} contas comprovadas — pagamento recorrente em dia.`,
    },
    {
      label: "Movimentação bancária",
      weight: 0.16,
      strength: hasExtrato ? 1 : 0.15,
      explanation: hasExtrato
        ? "Extrato conectado — entradas e saídas comprovam o fluxo de caixa."
        : "Sem extrato — envie para comprovar a movimentação.",
    },
    {
      label: "Experiência no ofício",
      weight: 0.1,
      strength: Math.min(persona.yearsInTrade / 20, 1),
      explanation: `${persona.yearsInTrade} anos de profissão — reputação e constância de trabalho.`,
    },
  ];

  const weightedSum = weights.reduce((acc, w) => acc + w.weight * w.strength, 0);
  const score = Math.round(SCORE_FLOOR + SCORE_RANGE * weightedSum);

  const factors: ScoreFactor[] = weights.map((w) => ({
    label: w.label,
    points: Math.round(SCORE_RANGE * w.weight * w.strength),
    strength: w.strength,
    positive: w.strength >= 0.6,
    explanation: w.explanation,
  }));

  let ratingLabel = "Risco moderado";
  let ratingTone: ScoreResult["ratingTone"] = "fair";
  if (score >= 800) {
    ratingLabel = "Excelente pagador";
    ratingTone = "great";
  } else if (score >= 680) {
    ratingLabel = "Bom pagador";
    ratingTone = "good";
  }

  return { score, ratingLabel, ratingTone, factors };
}

/* -------------------------- estimativa de crédito ------------------------- */

/**
 * Estimativa de capital de giro elegível com base no score e no faturamento.
 * A garantia real da operação é o aval do FAMPE/Sebrae (até 80%) — não os
 * recebíveis futuros. Esta função calibra apenas o limite indicativo.
 */
export function computeCredit(input: ScoreInput): { amount: number; monthlyRate: number } {
  const { score } = computeScore(input);
  // LTV sobre a capacidade anual: score alto destrava mais meses de faturamento.
  const coverMonths = score >= 800 ? 6 : score >= 680 ? 4 : 2.5;
  const amount = Math.round((input.persona.monthlyRevenue * coverMonths) / 100) * 100;
  const monthlyRate = score >= 800 ? 2.4 : score >= 680 ? 3.3 : 4.6;
  return { amount, monthlyRate };
}

/* ----------------------------- parceiros ---------------------------------- */

export const BANK_PARTNERS = [
  "Banco comunitário parceiro",
  "Fintech de crédito de impacto",
  "Cooperativa de crédito (Sicoob)",
  "Banco de varejo (esteira PJ)",
];
