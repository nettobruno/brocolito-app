# Brocolito App

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000000)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=000000)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo Router](https://img.shields.io/badge/Expo%20Router-000020?style=for-the-badge&logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)

Aplicativo em Expo e React Native para cadastro, histórico e comparação de medidas corporais do Brocolito.

<img width="2172" height="724" alt="ChatGPT Image 11 de mai  de 2026, 23_20_24" src="https://github.com/user-attachments/assets/53d95dc1-e3b7-4c78-bfca-d957bf5466ad" />

---

## Stack

- Expo 54
- React 19
- React Native 0.81
- Expo Router
- TypeScript
- AsyncStorage
- Nunito via `@expo-google-fonts/nunito`

---

## Funcionalidades

- Onboarding, cadastro e login
- Sessão autenticada com token JWT
- Perfil do usuário
- Objetivo do usuário: perder peso ou ganhar peso
- Cadastro, edição e exclusão de medições corporais
- Histórico de medições
- Comparativo de evolução por medida
- Mensagens de progresso baseadas no objetivo
- Informações educativas em métricas de peso, cintura e abdômen

---

## Pré-requisitos

- Node.js compatível com Expo 54
- npm
- Expo CLI via `npx expo`
- API Brocolito acessível

Para rodar com a API local, suba o projeto `brocolito-api` em:

```text
http://localhost:3000
```

---

## Configuração

Crie um arquivo `.env` na raiz do app:

```bash
cp .env.example .env
```

Configure a URL da API:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

Para apontar para produção, use a URL publicada da API:

```env
EXPO_PUBLIC_API_BASE_URL=https://sua-api.example.com
```

Variáveis com prefixo `EXPO_PUBLIC_` são expostas no bundle do app. Não coloque segredos nesse arquivo.

---

## Rodando localmente

Instale as dependências:

```bash
npm install
```

Inicie o Expo:

```bash
npm start
```

Rodar no navegador:

```bash
npm run web
```

Rodar no Android:

```bash
npm run android
```

Rodar no iOS:

```bash
npm run ios
```

Se testar em celular físico com API local, `localhost` aponta para o próprio celular. Nesse caso, use o IP da máquina que está rodando a API:

```env
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:3000
```

---

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm start` | Inicia o Expo |
| `npm run web` | Inicia o app no navegador |
| `npm run android` | Abre no Android |
| `npm run ios` | Abre no iOS |
| `npm run lint` | Roda o lint do Expo |
| `npx tsc --noEmit` | Checa tipos TypeScript |

---

## Fluxo de desenvolvimento

1. Suba a API:

```bash
cd ../brocolito-api
bin/rails server
```

2. Configure o `.env` do app:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

3. Inicie o app:

```bash
cd ../brocolito-app
npm start
```

4. Crie uma conta ou use um usuário dos seeds da API.

---

## Estrutura principal

```text
app/
  (app)/                 Rotas autenticadas
  login.tsx              Login
  onboarding.tsx         Tela inicial
  register.tsx           Cadastro
src/
  components/            Componentes reutilizáveis
  context/AuthContext.tsx Sessão e token JWT
  services/api.ts        Cliente HTTP da API
  types/                 Tipos TypeScript
  utils/                 Formatação, objetivos e insights
```

---

## Qualidade

Lint:

```bash
npm run lint
```

Typecheck:

```bash
npx tsc --noEmit
```

---

## Observações

- O app espera que a API retorne JWT no login.
- O token é armazenado no AsyncStorage.
- O arquivo `.env` é ignorado pelo Git.
- `.env.example` existe apenas como referência de configuração.
