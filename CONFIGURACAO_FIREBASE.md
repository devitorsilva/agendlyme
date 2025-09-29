# 🔥 Configuração do Firebase - AgendlyMe

## ⚠️ Erro Atual

Você está vendo o erro `Firebase: Error (auth/invalid-api-key)` porque as credenciais do Firebase não foram configuradas.

## 🚀 Passos para Resolver

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `agendlyme` (ou o nome que preferir)
4. Aceite os termos e continue
5. **Desabilite** o Google Analytics por enquanto (pode ativar depois)
6. Clique em "Criar projeto"

### 2. Configurar Autenticação

1. No painel do Firebase, vá em **Authentication**
2. Clique em **Começar**
3. Vá na aba **Sign-in method**
4. Habilite **Email/Password**
5. Habilite **Google** (opcional, mas recomendado)

### 3. Configurar Firestore

1. No painel do Firebase, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Modo de produção** (mais seguro)
4. Escolha uma localização (recomendo `southamerica-east1` para Brasil)
5. Clique em **Concluído**

### 4. Obter Credenciais do Projeto

1. No painel do Firebase, vá em **Configurações do projeto** (ícone de engrenagem)
2. Role para baixo até **Seus aplicativos**
3. Clique no ícone **Web** (`</>`)
4. Nome do app: `AgendlyMe`
5. **NÃO** marque "Também configurar o Firebase Hosting"
6. Clique em **Registrar app**
7. **Copie** as credenciais que aparecem

### 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Substitua pelos valores do seu projeto Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 6. Exemplo de Configuração

Seu arquivo `.env` deve ficar assim (com seus valores reais):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=agendlyme-12345.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=agendlyme-12345
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=agendlyme-12345.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 7. Reiniciar o App

Após configurar o `.env`:

```bash
# Parar o servidor (Ctrl+C)
# Depois executar novamente
npm start
```

## 🔧 Configurações Adicionais (Opcional)

### Storage (para imagens)

1. Vá em **Storage** no painel Firebase
2. Clique em **Começar**
3. Aceite as regras padrão
4. Escolha a mesma localização do Firestore

### Functions (para funcionalidades avançadas)

1. Vá em **Functions** no painel Firebase
2. Clique em **Começar**
3. Siga as instruções para configurar o Firebase CLI

## ⚡ Teste Rápido

Após configurar tudo, você deve ver:

- Tela de login funcionando
- Possibilidade de criar conta
- Redirecionamento para dashboard

## 🆘 Problemas Comuns

### Erro: "Firebase: Error (auth/invalid-api-key)"

- Verifique se o arquivo `.env` existe
- Confirme se as variáveis começam com `EXPO_PUBLIC_`
- Reinicie o servidor após criar o `.env`

### Erro: "Firebase: Error (auth/domain-not-authorized)"

- No Firebase Console, vá em Authentication > Settings
- Adicione `localhost` e `127.0.0.1` nos domínios autorizados

### App não carrega

- Verifique se todas as dependências estão instaladas: `npm install`
- Limpe o cache: `npx expo start --clear`

## 📱 Próximos Passos

Após configurar o Firebase:

1. Teste o login/cadastro
2. Crie um salão
3. Adicione serviços
4. Faça um agendamento

---

**Precisa de ajuda?** Verifique os logs no terminal para mais detalhes sobre erros específicos.

---

Adicionar o Firebase ao seu app da Web
Completed
Registrar app
2
Adicionar o SDK do Firebase

Usar o npm

Usar a tag <script>
Se você já estiver usando o npm e um bundler de módulos, como webpack ou Rollup, execute o seguinte comando para instalar o SDK mais recente (Saiba mais):

npm install firebase
Depois inicialize o Firebase e comece a usar os SDKs dos produtos.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyCuiChmUQRAi30P8-txWfOTf1GZ163hS7Y",
authDomain: "agendlyme-5ea72.firebaseapp.com",
projectId: "agendlyme-5ea72",
storageBucket: "agendlyme-5ea72.firebasestorage.app",
messagingSenderId: "421458960387",
appId: "1:421458960387:web:6edf0054ef865c15766e36",
measurementId: "G-CR6EFB21V4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
Observação: essa opção usa o SDK modular para JavaScript , que reduz o tamanho do SDK.

Saiba mais sobre o Firebase para Web: Vamos começar, Referência da API Web SDK, Amostras
