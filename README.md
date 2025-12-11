# Organia+
Organia+ | Agenda e Gerenciamento de Tempo

O Organia+ é um aplicativo móvel de agenda e produtividade desenvolvido em React Native/TypeScript, com foco total em Tema Escuro e usabilidade. Ele oferece gerenciamento CRUD (Criar, Editar, Excluir) completo para compromissos e tarefas, com persistência de dados local e uma interface limpa, moderna e responsiva. É o seu organizador diário, construído em uma base de código robusta e eficiente.

## ✨ Funcionalidades Principais
- **Tema Escuro Padrão:** O aplicativo é iniciado com o tema escuro ativo, com a opção de alternar para o tema claro na tela de Configurações.
- **Controle Total de Itens:** Funcionalidade CRUD (Criação, Leitura, Edição e Exclusão) completa para Compromissos.
- **Ações de Editar e Excluir:** itens acessíveis via menu de três pontos (...).
- **Gerenciamento Simplificado de Tarefas:** Ao adicionar uma nova Tarefa, o usuário é solicitado a informar apenas o nome, priorizando a agilidade.
- **Persistência de Dados:** Todos os compromissos e tarefas são salvos localmente (AsyncStorage), garantindo que os dados permaneçam após o fechamento do app.
- **Visualização de Calendário:** Marcação visual dos dias com compromissos. Ao clicar em um dia, um resumo dos eventos agendados é exibido.
- **Alarme:** O usuário é notificado sobre seus compromissos.
- **Sistema de Energia:** As tarefas quando são criadas, é selecionado quanto de "energia" é necessário para concluí-las, e no dia, o usuário seleciona sua disposição para concluir as tarefas.
- **Design Clean:** Interface moderna e fiel ao design proposto, utilizando componentes estilizados e gradientes.

## 💻 Tecnologias Utilizadas

- **Framework:** React Native (Bare Workflow)
- **Linguagem:** TypeScript
- **Estilização:** Styled Components (para componentes reutilizáveis e temas)
- **Navegação:** React Navigation (Stack e Bottom Tabs), @react-native-screens e @react-native-safe-area-context
- **Persistência de Dados:** @react-native-async-storage/async-storage
- **Animações/Gestos:** @react-native-reanimated e @react-native-gesture-handler
- **Notificações:** @notifee/react-native
- **Data/Hora:** @react-native-community/datetimepicker e @date-fns

## ⚙️ Como Rodar o Projeto

Este guia pressupõe que você já tem o ambiente de desenvolvimento React Native (Node.js v20+, Java 17+, Android SDK, npm) configurado.

1. Na raiz do projeto: `npm install` (Instalar pacotes e dependências essenciais)
2. Inicie o Servidor Metro com o comando: `npm start`
3. Rodar em um emulador Android instalado: `npm run android` |  Rodar em um emulador IOS instalado: `npm run ios`

Após o **BUILD SUCCESSFUL**, o aplicativo deve ser instalado e aberto no emulador.

## 📱 Arquivo APK para instalar em um dispositivo móvel Android:
O arquivo APK está na pasta: `...android\app\release\app-release.apk`
