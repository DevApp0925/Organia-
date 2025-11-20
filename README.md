# OrganiaPlus
Organia+ | Agenda e Gerenciamento de Tempo

O Organia+ é um aplicativo móvel de agenda e produtividade desenvolvido em React Native/TypeScript, com foco total em Tema Escuro e usabilidade. Ele oferece gerenciamento CRUD (Criar, Editar, Excluir) completo para compromissos e tarefas, com persistência de dados local e uma interface limpa, moderna e responsiva. É o seu organizador diário, construído em uma base de código robusta e eficiente.

✨ Funcionalidades Principais

Tema Escuro Padrão: O aplicativo é iniciado com o tema escuro ativo, com a opção de alternar para o tema claro na tela de Configurações.

Controle Total de Itens:

Funcionalidade CRUD (Criação, Leitura, Edição e Exclusão) completa para Compromissos.

Ações de Editar e Excluir itens acessíveis via menu de três pontos (...).

Gerenciamento Simplificado de Tarefas: Ao adicionar uma nova Tarefa, o usuário é solicitado a informar apenas o nome, priorizando a agilidade.

Persistência de Dados: Todos os compromissos e tarefas são salvos localmente (AsyncStorage), garantindo que os dados permaneçam após o fechamento do app.

Visualização de Calendário: Marcação visual dos dias com compromissos. Ao clicar em um dia, um resumo dos eventos agendados é exibido.

Design Clean: Interface moderna e fiel ao design proposto, utilizando componentes estilizados e gradientes.

💻 Tecnologias Utilizadas

Framework: React Native (Bare Workflow)

Linguagem: TypeScript

Estilização: Styled Components (para componentes reutilizáveis e temas)

Navegação: React Navigation (Stack e Bottom Tabs)

Persistência de Dados: @react-native-async-storage/async-storage

Animações/Gestos: react-native-reanimated e react-native-gesture-handler

⚙️ Como Rodar o Projeto

Este guia pressupõe que você já tem o ambiente de desenvolvimento React Native (Node.js v20+, Java 17+, Android SDK) configurado.

1. Instalação e Setup

Crie um novo projeto React Native e navegue até a pasta:

npx @react-native-community/cli init Organia
cd Organia


2. Instalar Dependências

Instale todas as bibliotecas necessárias:

# Dependências principais
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-native-async-storage/async-storage react-native-calendars react-native-linear-gradient react-native-vector-icons styled-components

# Dependências de gestos e animação (Reanimated)
npm install react-native-gesture-handler react-native-reanimated

# Dependências de desenvolvimento (tipos)
npm install -D @types/react-native-vector-icons @types/styled-components-react-native @react-native-community/cli


⚠️ NOTA IMPORTANTE (SOLUÇÃO DE PROBLEMAS DE BUILD):
Devido a problemas de compatibilidade do Gradle, algumas configurações nativas são obrigatórias após a instalação.

Arquivo de Configuração

Linha a Adicionar

Propósito

android/gradle.properties

reanimated.nodeJSDir=C:\\Program Files\\nodejs (Ajuste o caminho!)

Corrige erro Process 'command 'node'' finished with non-zero exit value 1

android/app/build.gradle

apply from: "../../node_modules/react-native-vector-icons/fonts.gradle" (No final)

Corrige erro de "fonte não encontrada" (vector-icons)

babel.config.js

Adicionar plugins: ['react-native-reanimated/plugin']

Ativa o plugin de animação.

index.js

Adicionar import 'react-native-gesture-handler'; (No topo)

Registra o handler de gestos antes de qualquer renderização.

3. Rodar o App (Android)

Abra seu emulador (dispositivo virtual) via Android Studio e garanta que ele esteja na tela inicial.

Rode o comando na raiz do projeto:

<!-- end list -->

npx react-native run-android


Após o BUILD SUCCESSFUL, o aplicativo deve ser instalado e aberto no emulador.
