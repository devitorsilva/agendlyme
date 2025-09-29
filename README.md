# AgendlyMe - MVP para Salões e Barbearias

Um sistema completo de agendamento para salões de beleza e barbearias, desenvolvido com React Native (Expo) e Firebase.

## 🎯 Objetivo

Lançar um MVP funcional para salões/barbearias com:

- ✅ Marcação simplificada
- ✅ Gestão de agenda por profissional
- ✅ Perfis de clientes
- ✅ Lembretes por e-mail/push
- ✅ Integração opcional com Google Calendar

## 🏗️ Arquitetura

### Frontend

- **Expo (React Native)** + React Native Web
- **expo-router** para navegação
- **react-hook-form** + **zod** para formulários
- **@tanstack/react-query** para cache de dados
- **zustand** para gerenciamento de estado

### Backend

- **Cloud Firestore** (banco de dados)
- **Cloud Functions** (Node.js/TypeScript)
- **Firebase Authentication** (Email/Google/Apple/Facebook)
- **Firebase Storage** (mídia)
- **FCM** (notificações push)

### Integrações

- **Google Calendar OAuth** (offline access)
- **SendGrid/Resend** (e-mail)
- **Expo Notifications** (push)

## 📊 Modelagem de Dados

### Coleções Principais

- `users/{userId}`: Perfil e preferências do usuário
- `salons/{salonId}`: Dados do salão
- `services/{serviceId}`: Serviços oferecidos
- `staff/{staffId}`: Membros da equipe
- `appointments/{appointmentId}`: Agendamentos
- `reviews/{reviewId}`: Avaliações
- `cash_register/{dayId}`: Controle de caixa

## 🚀 Configuração do Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Firebase
- Conta Google Cloud (para OAuth)
- Conta SendGrid/Resend (para emails)

### Instalação

1. **Clone o repositório:**

```bash
git clone <repository-url>
cd fo-agendlyme
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Instale as dependências das Functions:**

```bash
cd functions
npm install
cd ..
```

4. **Configure as variáveis de ambiente:**

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais do Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
```

5. **Configure o Firebase:**

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Faça login no Firebase
firebase login

# Inicialize o projeto (se necessário)
firebase init
```

6. **Deploy das regras e Functions:**

```bash
# Deploy das regras do Firestore
firebase deploy --only firestore:rules

# Deploy das Functions
firebase deploy --only functions

# Deploy completo
firebase deploy
```

### Executando o Projeto

```bash
# Executar no Expo
npm start

# Executar na web
npm run web

# Executar no Android
npm run android

# Executar no iOS (apenas macOS)
npm run ios
```

### Executando os Emuladores Firebase

```bash
# Iniciar todos os emuladores
firebase emulators:start

# Iniciar apenas Firestore e Functions
firebase emulators:start --only firestore,functions
```

## 🔒 Segurança

### Regras do Firestore

As regras implementadas garantem:

- **Multi-tenant por salonId**: Segregação completa dos dados
- **RBAC (Role-Based Access Control)**: Owner, Staff, Client
- **Validação de dados**: Campos obrigatórios e tipos corretos
- **Prevenção de escalação**: Usuários não podem alterar próprios roles

### Custom Claims

```javascript
{
  roles: ['owner', 'staff', 'client'],
  salonIds: ['salon_id_1', 'salon_id_2']
}
```

## 📱 Funcionalidades

### ✅ Implementadas

- [x] Sistema de autenticação (Email/Google)
- [x] Gestão de salões
- [x] Cadastro de serviços
- [x] Gestão de equipe
- [x] Criação de agendamentos
- [x] Prevenção de conflitos de horário
- [x] Cloud Functions para operações críticas
- [x] Integração com Google Calendar
- [x] Sistema de lembretes por email
- [x] Regras de segurança do Firestore

### 🔄 Em Desenvolvimento

- [ ] Interface de calendário visual
- [ ] Notificações push
- [ ] Sistema de reviews
- [ ] Controle de caixa
- [ ] Relatórios e analytics

### 🎯 Próximas Features

- [ ] Pagamentos online (Stripe)
- [ ] Chat em tempo real
- [ ] Multi-filial
- [ ] App para clientes

## 🧪 Testes

```bash
# Executar testes unitários
npm test

# Executar testes das Functions
cd functions
npm test
```

## 📦 Deploy

### Ambiente de Produção

```bash
# Build para produção
npm run build

# Deploy completo
firebase deploy

# Deploy apenas Functions
firebase deploy --only functions

# Deploy apenas hosting
firebase deploy --only hosting
```

### Ambiente de Desenvolvimento

```bash
# Deploy para projeto de desenvolvimento
firebase use dev
firebase deploy
```

## 📊 Monitoramento

- **Firebase Console**: Logs e métricas das Functions
- **Crashlytics**: Crash reporting (mobile)
- **Analytics**: Uso do app
- **Performance Monitoring**: Performance do app

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- Email: suporte@agendlyme.com
- Documentação: [docs.agendlyme.com](https://docs.agendlyme.com)
- Issues: [GitHub Issues](https://github.com/yourusername/agendlyme/issues)

---

**AgendlyMe** - Simplificando a gestão de salões e barbearias 💇‍♀️✂️
