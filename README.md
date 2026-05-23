# Giro MEI

**Capital de giro para quem o banco não enxerga.**

Giro MEI é um app que ajuda microempreendedores informais a saírem da
informalidade, montarem um histórico e destravarem crédito justo. A ideia
central: a **agenda de trabalhos futuros** vira garantia — esses recebíveis
projetados entram no sistema bancário como lastro para uma oferta de crédito.

A demo usa como persona a **Dona Keila, trancista** em Grajaú (SP). Todos os
dados são simulados (mock), sem integrações externas reais.

## Como funciona

1. **Entrada** — login social/telefone (demo: qualquer opção entra direto).
2. **Onboarding** — explicação da proposta.
3. **CPF** — validação real do dígito verificador.
4. **CNPJ** — consulta simulada CPF → CNPJ; se não houver, abre a criação do MEI.
5. **Agenda de trabalhos** — os contratos futuros que servem de garantia.
6. **Objetivo do crédito** — para que o dinheiro será usado.
7. **Documentos** — contas, extrato e documentos fiscais que reforçam o score.
8. **Score** — pontuação 300–1000 calculada a partir da agenda, formalização,
   contas em dia, movimentação bancária e tempo de ofício.
9. **Área logada** (abas): Início, Crédito (vitrine de linhas com análise de
   match), Entradas e Documentos.

## Stack

- [Expo](https://expo.dev) SDK 56 + [Expo Router](https://docs.expo.dev/router/introduction) (rotas por arquivo)
- React Native 0.85 / React 19
- TypeScript (strict)
- React Native Reanimated + Gesture Handler

## Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou superior
- [pnpm](https://pnpm.io) 10 (`npm install -g pnpm`)
- App **Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

## Como rodar

```bash
# 1. Instale as dependências
pnpm install

# 2. Inicie o servidor de desenvolvimento
pnpm start
```

O terminal vai exibir um **QR Code**. Para abrir no celular:

- **Android** — abra o app **Expo Go** e toque em *Scan QR code*.
- **iOS** — aponte a **câmera** nativa para o QR e toque na notificação.

> O celular e o computador precisam estar na **mesma rede Wi‑Fi**. Em redes que
> bloqueiam conexões locais, rode com túnel: `pnpm start --tunnel`.

### Outras formas de abrir

```bash
pnpm android   # abre no emulador/dispositivo Android
pnpm ios       # abre no simulador iOS (requer Xcode no macOS)
pnpm web       # abre no navegador
pnpm lint      # roda o ESLint
```

## Estrutura

```
src/
├── app/                 # rotas (Expo Router)
│   ├── index.tsx        # login
│   ├── intro.tsx        # onboarding
│   ├── cpf.tsx          # CPF
│   ├── cnpj.tsx         # consulta/criação de CNPJ (MEI)
│   ├── obras.tsx        # agenda de trabalhos
│   ├── objetivo.tsx     # objetivo do crédito
│   ├── documentos.tsx   # envio de documentos
│   ├── score.tsx        # score de crédito
│   ├── perfil.tsx       # perfil
│   └── (app)/           # área logada (abas: início, crédito, entradas, docs)
└── lib/
    ├── data.ts          # persona, score e dados de domínio
    ├── credit.ts        # linhas de crédito e análise de match
    ├── flow.tsx         # estado compartilhado da jornada
    └── ui.tsx           # design system (tema e componentes)
```

## Licença

Veja [LICENSE](./LICENSE).
