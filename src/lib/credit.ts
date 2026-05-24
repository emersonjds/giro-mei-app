/* ---------------------------------------------------------------------------
   Domínio de LINHAS DE CRÉDITO — vitrine com análise de match.
   Depois do score, mapeamos quais linhas o perfil destrava, quais documentos
   faltam pra desbloquear novas linhas e quanto cada documento melhora a oferta.
   Dinheiro sempre em reais inteiros. Tudo mock para a demo.
--------------------------------------------------------------------------- */

import {
  DOC_TYPES,
  DocType,
  ScoreInput,
  computeScore,
  computeCredit,
} from "./data";

/* ----------------------------- documentos --------------------------------- */

/** Documentos fiscais que destravam linhas públicas/cooperadas. */
export const EXTRA_DOC_TYPES: DocType[] = [
  { id: "das_mei", label: "DAS-MEI pago", hint: "Regularidade fiscal — guias do ano", group: "fiscal" },
  { id: "dasn", label: "DASN-SIMEI", hint: "Declaração anual de faturamento", group: "fiscal" },
  { id: "nfse", label: "Notas fiscais (NFS-e)", hint: "Comprova faturamento real", group: "fiscal" },
  { id: "cnd", label: "Certidão negativa (CND)", hint: "Sem débitos com a Fazenda", group: "fiscal" },
  { id: "end_comercial", label: "Endereço comercial", hint: "Comprovante do ponto de trabalho", group: "fiscal" },
];

export const ALL_DOC_TYPES: DocType[] = [...DOC_TYPES, ...EXTRA_DOC_TYPES];

function docById(id: string): DocType | undefined {
  return ALL_DOC_TYPES.find((d) => d.id === id);
}

/* --------------------------- objetivo do crédito -------------------------- */

export type CreditPurpose =
  | "material"
  | "giro"
  | "ferramenta"
  | "ajudante"
  | "ampliar"
  | "emergencia"
  | "antecipar"
  | "quitar";

export const CREDIT_PURPOSES: { id: CreditPurpose; label: string; icon: string; blurb: string }[] = [
  { id: "material", icon: "📦", label: "Comprar material/insumos", blurb: "Produtos, ferramentas e insumos para prestar seu serviço com qualidade." },
  { id: "giro", icon: "💸", label: "Capital de giro", blurb: "Fôlego para o mês: pagar as contas enquanto o pagamento do cliente não cai." },
  { id: "ferramenta", icon: "🧰", label: "Ferramenta/equipamento", blurb: "Equipamento novo que rende mais serviço e atende mais clientes." },
  { id: "ajudante", icon: "🤝", label: "Contratar ajudante", blurb: "Mais uma mão para crescer e pegar trabalho maior." },
  { id: "ampliar", icon: "📈", label: "Ampliar o negócio", blurb: "Crescer: novo ponto, mais clientes, abrir uma nova frente." },
  { id: "emergencia", icon: "🛟", label: "Emergência/imprevisto", blurb: "Um aperto agora — dinheiro rápido para não parar de trabalhar." },
  { id: "antecipar", icon: "📅", label: "Antecipar recebíveis", blurb: "Receber hoje o que o cliente paga lá na frente." },
  { id: "quitar", icon: "💳", label: "Quitar dívida mais cara", blurb: "Trocar um juro alto por um custo menor." },
];

/** Aderência (2=ideal, 1=bom, 0=neutro) de cada lineId por objetivo. */
export const GOAL_FIT: Record<CreditPurpose, Record<string, 0 | 1 | 2>> = {
  material: { insumos: 2, pnmpo: 1, sicoob: 1 },
  giro: { antecipacao: 2, pronampe: 2, pnmpo: 1, sicoob: 1, giro_fintech: 1 },
  ferramenta: { pnmpo: 1, acredita: 1, sicoob: 1, insumos: 1, pronampe: 1 },
  ajudante: { pnmpo: 2, acredita: 1, sicoob: 1, pronampe: 1 },
  ampliar: { acredita: 2, pronampe: 2, pnmpo: 1, sicoob: 1 },
  emergencia: { giro_fintech: 2, antecipacao: 1 },
  antecipar: { antecipacao: 2, insumos: 1, giro_fintech: 1 },
  quitar: { pronampe: 2, acredita: 1, sicoob: 1 },
};

/** Nível de aderência da linha ao objetivo (0 se objetivo nulo/ausente). */
export function goalFit(lineId: string, purpose: CreditPurpose | null | undefined): 0 | 1 | 2 {
  if (!purpose) return 0;
  return GOAL_FIT[purpose]?.[lineId] ?? 0;
}

/* --------------------------- instituições parceiras ----------------------- */

export type Institution = {
  id: string;
  name: string; // nome completo
  short: string; // nome curto (chips)
  initials: string; // monograma do "logo"
  color: string; // cor de marca (fundo do logo)
  fg: string; // cor do texto sobre a marca
  kind: string; // natureza regulatória
};

/** Registro de instituições financeiras parceiras. O "logo" é um monograma de
    marca (sem assets) — basta trocar por <Image> quando houver os arquivos. */
export const INSTITUTIONS: Record<string, Institution> = {
  caixa: { id: "caixa", name: "Caixa Econômica Federal", short: "Caixa", initials: "CX", color: "#005CA9", fg: "#FFFFFF", kind: "Banco público federal" },
  bb: { id: "bb", name: "Banco do Brasil", short: "BB", initials: "BB", color: "#FAE128", fg: "#003399", kind: "Banco público (aval União)" },
  crediamigo: { id: "crediamigo", name: "CrediAmigo · Banco do Nordeste", short: "CrediAmigo", initials: "CA", color: "#E8730C", fg: "#FFFFFF", kind: "Microcrédito produtivo (PNMPO)" },
  sicoob: { id: "sicoob", name: "Sicoob", short: "Sicoob", initials: "SI", color: "#1B9E8F", fg: "#FFFFFF", kind: "Cooperativa de crédito" },
  bv: { id: "bv", name: "BV Financeira", short: "BV", initials: "BV", color: "#16181D", fg: "#FFE600", kind: "Financeira de varejo" },
  cora: { id: "cora", name: "Cora SCD", short: "Cora", initials: "CO", color: "#E5337E", fg: "#FFFFFF", kind: "Fintech de crédito (SCD)" },
  adianta: { id: "adianta", name: "Adianta Recebíveis", short: "Adianta", initials: "AD", color: "#0E8F6E", fg: "#FFFFFF", kind: "SCD de recebíveis" },
};

/* ------------------------------ catálogo ---------------------------------- */

export type CreditArchetype = "recebivel" | "risco" | "gov";

export type CreditLine = {
  id: string;
  name: string;
  provider: string;
  institutionId: string; // chave em INSTITUTIONS
  archetype: CreditArchetype;
  purpose: string;
  ticketMin: number;
  ticketMax: number;
  termMin: number; // meses
  termMax: number; // meses
  baseRate: number; // taxa a.m. piso (%)
  minScore: number;
  requiredDocs: string[]; // ids obrigatórios (CNPJ ativo é pré-requisito de todas, via flow.formalized)
  boostDocs: string[]; // ids opcionais que melhoram a oferta
  highlight: string;
};

export const CREDIT_LINES: CreditLine[] = [
  {
    id: "antecipacao",
    name: "Antecipação de Recebíveis",
    provider: "SCD parceira",
    institutionId: "adianta",
    archetype: "recebivel",
    purpose: "Antecipa seus contratos futuros e vira capital de giro",
    ticketMin: 2000,
    ticketMax: 60000,
    termMin: 3,
    termMax: 8,
    baseRate: 2.4,
    minScore: 600,
    requiredDocs: ["contratos", "extrato"],
    boostDocs: ["nfse", "das_mei"],
    highlight: "Garantida pela sua carteira de clientes — taxa menor",
  },
  {
    id: "pnmpo",
    name: "Microcrédito Produtivo (PNMPO)",
    provider: "Banco comunitário / SCM",
    institutionId: "crediamigo",
    archetype: "gov",
    purpose: "Crédito orientado para microempreendedor",
    ticketMin: 1000,
    ticketMax: 21000,
    termMin: 4,
    termMax: 24,
    baseRate: 1.9,
    minScore: 300,
    requiredDocs: ["end_comercial"],
    boostDocs: ["das_mei", "luz", "agua"],
    highlight: "Porta de entrada, juros baixos",
  },
  {
    id: "acredita",
    name: "Acredita / Caixa",
    provider: "Programa federal (Caixa)",
    institutionId: "caixa",
    archetype: "gov",
    purpose: "Crédito para quem está saindo da informalidade",
    ticketMin: 1000,
    ticketMax: 15000,
    termMin: 12,
    termMax: 36,
    baseRate: 1.7,
    minScore: 560,
    requiredDocs: ["das_mei", "end_comercial"],
    boostDocs: ["dasn", "cnd"],
    highlight: "Programa público para recém-formalizados",
  },
  {
    id: "sicoob",
    name: "Capital de Giro Cooperativa",
    provider: "Cooperativa (Sicoob/Cresol)",
    institutionId: "sicoob",
    archetype: "gov",
    purpose: "Giro e insumos para o associado",
    ticketMin: 1000,
    ticketMax: 25000,
    termMin: 6,
    termMax: 36,
    baseRate: 2.2,
    minScore: 600,
    requiredDocs: ["das_mei", "extrato"],
    boostDocs: ["end_comercial", "nfse"],
    highlight: "Cooperativa: condições de associado",
  },
  {
    id: "insumos",
    name: "Crédito para Insumos",
    provider: "Financeira de varejo",
    institutionId: "bv",
    archetype: "recebivel",
    purpose: "Compra parcelada de insumos e equipamentos do seu ofício",
    ticketMin: 500,
    ticketMax: 20000,
    termMin: 3,
    termMax: 12,
    baseRate: 2.5,
    minScore: 620,
    requiredDocs: ["nfse"],
    boostDocs: ["contratos"],
    highlight: "Insumos agora, paga conforme os serviços entram",
  },
  {
    id: "pronampe",
    name: "PRONAMPE",
    provider: "Banco de varejo (aval União)",
    institutionId: "bb",
    archetype: "gov",
    purpose: "Capital de giro com garantia da União",
    ticketMin: 3000,
    ticketMax: 30000,
    termMin: 12,
    termMax: 48,
    baseRate: 1.5,
    minScore: 640,
    requiredDocs: ["dasn", "das_mei", "cnd"],
    boostDocs: ["extrato"],
    highlight: "Menor custo, garantido pela União",
  },
  {
    id: "giro_fintech",
    name: "Capital de Giro Fintech",
    provider: "Fintech de crédito (SCD)",
    institutionId: "cora",
    archetype: "risco",
    purpose: "Giro rápido, 100% digital",
    ticketMin: 2000,
    ticketMax: 50000,
    termMin: 6,
    termMax: 24,
    baseRate: 3.5,
    minScore: 680,
    requiredDocs: ["extrato", "das_mei"],
    boostDocs: ["dasn", "nfse"],
    highlight: "Aprovação rápida pelo histórico",
  },
];

/** Instituição financeira responsável pela linha. */
export function institutionFor(line: CreditLine): Institution {
  return INSTITUTIONS[line.institutionId];
}

/** Instituição a partir do id da linha (usado pelo contrato salvo). */
export function institutionForLineId(lineId: string): Institution | undefined {
  const l = CREDIT_LINES.find((x) => x.id === lineId);
  return l ? INSTITUTIONS[l.institutionId] : undefined;
}

/* --------------------------- pesos por arquétipo -------------------------- */

export type WeightSet = {
  score: number;
  docs: number;
  custo: number;
  valor: number;
  prazo: number;
};

export const WEIGHTS: Record<CreditArchetype, WeightSet> = {
  recebivel: { score: 0.15, docs: 0.2, custo: 0.25, valor: 0.25, prazo: 0.15 },
  risco: { score: 0.4, docs: 0.2, custo: 0.2, valor: 0.1, prazo: 0.1 },
  gov: { score: 0.2, docs: 0.45, custo: 0.15, valor: 0.1, prazo: 0.1 },
};

/* ------------------------- impacto dos documentos ------------------------- */

export type DocDelta = {
  points: number;
  label: string;
  rateDelta: number; // redução de taxa a.m. (negativo) quando enviado como boost
  rationale: string;
};

export const DOC_DELTAS: Record<string, DocDelta> = {
  contratos: { points: 18, label: "Contratos de serviço", rateDelta: 0, rationale: "Vira garantia — o coração da antecipação de recebíveis" },
  dasn: { points: 12, label: "DASN-SIMEI", rateDelta: -0.2, rationale: "Comprova faturamento anual; destrava PRONAMPE e Acredita" },
  das_mei: { points: 10, label: "DAS-MEI pago", rateDelta: -0.3, rationale: "Regularidade fiscal; exigido por 4 linhas" },
  nfse: { points: 9, label: "Notas fiscais (NFS-e)", rateDelta: -0.4, rationale: "Comprova receita real; reduz a taxa" },
  cnd: { points: 8, label: "Certidão negativa (CND)", rateDelta: -0.2, rationale: "Sem débitos; destrava linhas públicas" },
  end_comercial: { points: 5, label: "Endereço comercial", rateDelta: 0, rationale: "Prova o ponto de trabalho; destrava PNMPO/Sicoob" },
  extrato: { points: 7, label: "Extrato bancário", rateDelta: -0.2, rationale: "Fluxo de caixa comprovado" },
};

/** Reduções de taxa por boostDoc enviado (a.m., negativo). */
const BOOST_RATE: Record<string, number> = {
  nfse: -0.4,
  das_mei: -0.3,
  dasn: -0.2,
  cnd: -0.2,
  extrato: -0.2,
};

const RATE_FLOOR = 2.0;

/* -------------------------------- helpers --------------------------------- */

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function roundHundred(n: number): number {
  return Math.round(n / 100) * 100;
}

/** Ajuste da taxa por faixa de score, sobre a base da linha. */
function scoreRateAdjust(score: number): number {
  if (score >= 800) return -0.3;
  if (score >= 680) return 0;
  return 0.8;
}

/* ------------------------------- cálculos --------------------------------- */

/** Taxa a.m. (%) da linha: base + ajuste de faixa - reduções por boostDocs enviados. */
export function lineRate(line: CreditLine, score: number, uploaded: string[] = []): number {
  let rate = line.baseRate + scoreRateAdjust(score);
  for (const id of line.boostDocs) {
    if (uploaded.includes(id) && BOOST_RATE[id]) rate += BOOST_RATE[id];
  }
  return round1(Math.max(RATE_FLOOR, rate));
}

/** CET aproximado a partir da taxa a.m.; soma 2 p.p. de IOF/tarifas no a.a. */
export function lineCET(monthlyRatePct: number): { amPct: number; aaPct: number } {
  const aa = (Math.pow(1 + monthlyRatePct / 100, 12) - 1) * 100 + 2;
  return { amPct: round1(monthlyRatePct), aaPct: round1(aa) };
}

/** Limite personalizado: oferta do modelo de recebíveis, limitada ao teto da linha.
    Se o tomador pediu um valor, o alvo é o pedido (limitado à faixa da linha). */
export function lineAmount(line: CreditLine, input: ScoreInput): number {
  if (input.requestedAmount != null) {
    const target = clamp(input.requestedAmount, line.ticketMin, line.ticketMax);
    return roundHundred(target);
  }
  const base = computeCredit(input).amount;
  const capped = Math.min(base, line.ticketMax);
  return roundHundred(Math.max(line.ticketMin, capped));
}

/** Parcela pela Tabela Price (inteiro). Juros 0 => divisão simples. */
export function parcela(amount: number, monthlyRatePct: number, months: number): number {
  if (months <= 0) return amount;
  const i = monthlyRatePct / 100;
  if (i === 0) return Math.round(amount / months);
  const factor = (i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
  return Math.round(amount * factor);
}

export type MatchFactor = {
  key: "score" | "docs" | "custo" | "valor" | "prazo";
  label: string;
  value0a1: number; // 0..1
  explanation: string;
};

export type LineMatch = {
  line: CreditLine;
  eligible: boolean;
  unlocked: boolean;
  missingDocs: DocType[];
  status: "best" | "unlocked" | "locked" | "future";
  matchScore: number; // 0..100
  matchPotential: number; // 0..100, assumindo missingDocs enviados
  factors: MatchFactor[];
  rate: number; // a.m. %
  cet: { amPct: number; aaPct: number };
  amount: number;
  parcelaEstimada: number; // por mês
  idealForGoal: boolean; // goalFit === 2 para o objetivo atual
  goalFitLevel: 0 | 1 | 2; // aderência ao objetivo atual
};

const FACTOR_LABELS: Record<MatchFactor["key"], string> = {
  score: "Seu score",
  docs: "Documentos",
  custo: "Custo",
  valor: "Valor",
  prazo: "Prazo",
};

/* Para normalizar o custo, precisamos do intervalo de CET a.a. do catálogo
   considerando o score atual (taxas variam com a faixa). */
function catalogCETRange(score: number): { min: number; max: number } {
  const aas = CREDIT_LINES.map((l) => lineCET(lineRate(l, score)).aaPct);
  return { min: Math.min(...aas), max: Math.max(...aas) };
}

/**
 * f_docs: fração de requiredDocs presentes + boostDocs (peso 0.5, satura em 1).
 * Se faltar algum obrigatório, o fator é teto em 0.4.
 */
function docFactor(line: CreditLine, uploaded: string[]): { value: number; missing: DocType[] } {
  const missing: DocType[] = [];
  let reqPresent = 0;
  for (const id of line.requiredDocs) {
    if (uploaded.includes(id)) reqPresent++;
    else {
      const d = docById(id);
      if (d) missing.push(d);
    }
  }
  const reqTotal = line.requiredDocs.length || 1;
  const reqFrac = reqPresent / reqTotal;
  const boostPresent = line.boostDocs.filter((id) => uploaded.includes(id)).length;
  const boostFrac = (boostPresent * 0.5) / (line.boostDocs.length || 1);
  let value = clamp(reqFrac + boostFrac, 0, 1);
  if (reqPresent < line.requiredDocs.length) value = Math.min(value, 0.4);
  return { value, missing };
}

function buildFactors(
  line: CreditLine,
  input: ScoreInput,
  score: number,
  uploaded: string[],
  amount: number,
  cetAA: number,
  range: { min: number; max: number },
): { factors: MatchFactor[]; matchScore: number; missing: DocType[] } {
  const w = WEIGHTS[line.archetype];

  const fScore = clamp((score - 300) / 700, 0, 1);
  const { value: fDocs, missing } = docFactor(line, uploaded);

  const span = range.max - range.min || 1;
  const fCusto = clamp(1 - (cetAA - range.min) / span, 0, 1);

  let fValor: number;
  if (input.requestedAmount != null) {
    const req = input.requestedAmount;
    const shortfall = req > 0 ? Math.max(0, req - line.ticketMax) / req : 0;
    fValor = 1 - clamp(shortfall, 0, 1);
  } else {
    const mid = (line.ticketMin + line.ticketMax) / 2;
    fValor = 1 - clamp(Math.abs(amount - mid) / mid, 0, 1);
  }

  const targetTerm = 12; // prazo-alvo do capital de giro (meses)
  const fPrazo = line.termMax >= targetTerm ? 1 : 0.6;

  const factors: MatchFactor[] = [
    { key: "score", label: FACTOR_LABELS.score, value0a1: fScore, explanation: `Score ${score} de 1000 — peso ${Math.round(w.score * 100)}% nesta linha.` },
    { key: "docs", label: FACTOR_LABELS.docs, value0a1: fDocs, explanation: missing.length ? `Faltam ${missing.length} documento(s) obrigatório(s).` : "Documentos obrigatórios completos." },
    { key: "custo", label: FACTOR_LABELS.custo, value0a1: fCusto, explanation: `CET de ${cetAA.toLocaleString("pt-BR")}% a.a. comparado às outras linhas.` },
    { key: "valor", label: FACTOR_LABELS.valor, value0a1: fValor, explanation: `Limite de ${amount.toLocaleString("pt-BR")} dentro da faixa da linha.` },
    { key: "prazo", label: FACTOR_LABELS.prazo, value0a1: fPrazo, explanation: line.termMax >= targetTerm ? "Prazo confortável para o capital de giro." : "Prazo mais curto que o ideal para o giro." },
  ];

  const sum =
    w.score * fScore +
    w.docs * fDocs +
    w.custo * fCusto +
    w.valor * fValor +
    w.prazo * fPrazo;

  return { factors, matchScore: Math.round(100 * sum), missing };
}

export function matchLine(line: CreditLine, input: ScoreInput): LineMatch {
  const score = computeScore(input).score;
  const uploaded = input.uploaded;
  const range = catalogCETRange(score);

  const eligible = score >= line.minScore;
  const unlocked = eligible && line.requiredDocs.every((id) => uploaded.includes(id));

  const rate = lineRate(line, score, uploaded);
  const cet = lineCET(rate);
  const amount = lineAmount(line, input);
  const term = Math.round((line.termMin + line.termMax) / 2);
  const parcelaEstimada = parcela(amount, rate, term);

  const { factors, matchScore, missing } = buildFactors(
    line,
    input,
    score,
    uploaded,
    amount,
    cet.aaPct,
    range,
  );

  // Potencial: assume todos os missingDocs (obrigatórios + boosts) enviados.
  const uploadedAll = Array.from(
    new Set([...uploaded, ...line.requiredDocs, ...line.boostDocs]),
  );
  const rangePot = catalogCETRange(score);
  const ratePot = lineRate(line, score, uploadedAll);
  const cetPot = lineCET(ratePot);
  const { matchScore: matchPotential } = buildFactors(
    line,
    input,
    score,
    uploadedAll,
    amount,
    cetPot.aaPct,
    rangePot,
  );

  let status: LineMatch["status"];
  if (!eligible) status = "future";
  else if (!unlocked) status = "locked";
  else status = "unlocked";

  const goalFitLevel = goalFit(line.id, input.purpose);

  return {
    line,
    eligible,
    unlocked,
    missingDocs: missing,
    status,
    matchScore,
    matchPotential: Math.max(matchPotential, matchScore),
    factors,
    rate,
    cet,
    amount,
    parcelaEstimada,
    idealForGoal: goalFitLevel === 2,
    goalFitLevel,
  };
}

/** Ordena de forma ESTÁVEL por chave numérica decrescente (não altera empates). */
function stableSortDesc<T>(arr: T[], key: (x: T) => number): T[] {
  return arr
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const d = key(b.item) - key(a.item);
      return d !== 0 ? d : a.idx - b.idx;
    })
    .map((x) => x.item);
}

/** Calcula e ordena todas as linhas; marca a melhor entre as desbloqueadas. */
export function rankLines(input: ScoreInput): LineMatch[] {
  const all = CREDIT_LINES.map((l) => matchLine(l, input));

  let unlocked = all
    .filter((m) => m.status === "unlocked")
    .sort((a, b) => b.matchScore - a.matchScore);
  // Reordenação secundária ESTÁVEL por aderência ao objetivo (não mexe no matchScore).
  if (input.purpose != null) {
    unlocked = stableSortDesc(unlocked, (m) => m.goalFitLevel);
  }
  const locked = all.filter((m) => m.status === "locked").sort((a, b) => b.matchPotential - a.matchPotential);
  const future = all.filter((m) => m.status === "future").sort((a, b) => b.matchPotential - a.matchPotential);

  if (unlocked.length) unlocked[0].status = "best";

  return [...unlocked, ...locked, ...future];
}

/** Quantas linhas seriam ocultadas por um filtro duro de objetivo (idealForGoal === false). */
export function goalRankedHidden(input: ScoreInput): number {
  if (input.purpose == null) return 0;
  return rankLines(input).filter((m) => !m.idealForGoal).length;
}

/** A melhor linha desbloqueada (status best), se houver. */
export function bestLine(ranked: LineMatch[]): LineMatch | undefined {
  return ranked.find((m) => m.status === "best");
}

/** A linha desbloqueada de menor CET a.a. (badge "Menor custo"). */
export function cheapestUnlocked(ranked: LineMatch[]): LineMatch | undefined {
  const u = ranked.filter((m) => m.status === "best" || m.status === "unlocked");
  if (!u.length) return undefined;
  return u.reduce((best, m) => (m.cet.aaPct < best.cet.aaPct ? m : best));
}

export type DocImpact = {
  doc: DocType;
  delta: DocDelta;
  unlocks: CreditLine[]; // linhas que este doc destrava (era requiredDoc faltante)
  sent: boolean;
};

/**
 * Para cada documento relevante, retorna quais linhas ele destrava e o delta.
 * Alimenta a seção "Por que os documentos importam".
 */
export function docImpact(input: ScoreInput): DocImpact[] {
  const uploaded = input.uploaded;
  const relevant = Object.keys(DOC_DELTAS);

  return relevant.map((id) => {
    const doc = docById(id)!;
    const delta = DOC_DELTAS[id];
    const sent = uploaded.includes(id);
    // Linhas elegíveis (pelo score) onde este doc é obrigatório e ainda falta.
    const score = computeScore(input).score;
    const unlocks = sent
      ? []
      : CREDIT_LINES.filter(
          (l) =>
            score >= l.minScore &&
            l.requiredDocs.includes(id) &&
            l.requiredDocs.filter((d) => d !== id).every((d) => uploaded.includes(d)),
        );
    return { doc, delta, unlocks, sent };
  });
}

/* ---------------------------- contratação --------------------------------- */

/** Taxa de validação/abertura: 1,5% do valor, piso R$49, teto R$600 (inteiro). */
export function validationFee(amount: number): number {
  return Math.round(Math.max(49, Math.min(0.015 * amount, 600)));
}

/** IOF estimado (alíquota fixa + diária), inteiro. */
export function iofEstimate(amount: number, days = 180): number {
  return Math.round(amount * 0.0038 + amount * 0.000082 * days);
}

/**
 * CET fiel pela TIR do fluxo. t0 = desembolso líquido L = amount - fee - iof.
 * Resolve i mensal por bissecção em [0, 0.20] tal que VP das N parcelas = L.
 * Retorna amPct (i*100) e aaPct (((1+i)^12 - 1)*100), 1 casa.
 */
export function contractCET(
  amount: number,
  monthlyRatePct: number,
  months: number,
  fee: number,
  iof: number,
): { amPct: number; aaPct: number } {
  const L = amount - fee - iof;
  const pmt = parcela(amount, monthlyRatePct, months);

  // VP das N parcelas a uma taxa i, menos o líquido recebido.
  const npv = (i: number): number => {
    if (i === 0) return pmt * months - L;
    const pv = pmt * (1 - Math.pow(1 + i, -months)) / i;
    return pv - L;
  };

  let lo = 0;
  let hi = 0.2;
  // npv é decrescente em i; queremos a raiz npv(i) = 0.
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid);
    if (Math.abs(v) < 1e-6) {
      lo = mid;
      hi = mid;
      break;
    }
    if (v > 0) lo = mid;
    else hi = mid;
  }
  const i = (lo + hi) / 2;
  const aa = (Math.pow(1 + i, 12) - 1) * 100;
  return { amPct: round1(i * 100), aaPct: round1(aa) };
}

export type ContractStatus =
  | "em_analise"
  | "aprovado"
  | "contrato_assinado"
  | "desembolso_agendado"
  | "liberado";

export type Installment = {
  n: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  status: "a_vencer" | "paga" | "atrasada";
  paidAt?: string;
};

export type Contract = {
  lineId: string;
  lineName: string;
  provider: string;
  amount: number;
  rate: number; // a.m. %
  months: number;
  fee: number;
  iof: number;
  netAmount: number;
  cetAA: number;
  status: ContractStatus;
  requestedAt: string; // ISO
  approvedAt?: string;
  signedAt?: string;
  scheduledDisbursementDate?: string;
  disbursedAt?: string;
  installments: Installment[];
};

/** "Agora" da demo. */
const TODAY_ISO = "2026-05-23";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d.getTime());
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

/** Próximo dia útil a partir de `from` (pula sábado/domingo). */
export function nextBusinessDay(from: Date, n = 1): Date {
  let r = new Date(from.getTime());
  let added = 0;
  while (added < n) {
    r = addDays(r, 1);
    const wd = r.getUTCDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return r;
}

/** Data ISO -> dd/mm/aaaa. */
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Monta o contrato em análise a partir da linha e do input atual. */
export function buildContract(line: CreditLine, input: ScoreInput): Contract {
  const score = computeScore(input).score;
  const amount = lineAmount(line, input);
  const rate = lineRate(line, score, input.uploaded);
  const months = Math.round((line.termMin + line.termMax) / 2);
  const fee = validationFee(amount);
  const iof = iofEstimate(amount, months * 30);
  const netAmount = amount - fee - iof;
  const cetAA = contractCET(amount, rate, months, fee, iof).aaPct;

  return {
    lineId: line.id,
    lineName: line.name,
    provider: line.provider,
    amount,
    rate,
    months,
    fee,
    iof,
    netAmount,
    cetAA,
    status: "em_analise",
    requestedAt: new Date(TODAY_ISO + "T00:00:00.000Z").toISOString(),
    installments: [],
  };
}

/** Gera as N parcelas iguais a partir de `fromDate` (+30 dias cada). */
export function buildInstallments(contract: Contract, fromDate: Date): Installment[] {
  const pmt = parcela(contract.amount, contract.rate, contract.months);
  const today = new Date(TODAY_ISO + "T00:00:00.000Z");
  const out: Installment[] = [];
  for (let n = 1; n <= contract.months; n++) {
    const due = addDays(fromDate, 30 * n);
    const dueIso = isoDate(due);
    const overdue = due.getTime() < today.getTime();
    out.push({
      n,
      dueDate: dueIso,
      amount: pmt,
      status: overdue ? "atrasada" : "a_vencer",
    });
  }
  return out;
}
