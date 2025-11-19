# Organia+ - Aplicativo de Agenda

Aplicativo mobile de agenda desenvolvido em **React Native** (bare workflow) para gerenciamento de compromissos e tarefas.

##  Funcionalidades

###  Tela de Agenda
- Visualização de compromissos e tarefas
- Adicionar novos compromissos com título, descrição, **seletores de Data, Hora**
- Adicionar tarefas simples (apenas nome)
- Editar compromissos e tarefas existentes através do menu de 3 pontos
- Excluir compromissos e tarefas com confirmação
- Marcar tarefas como concluídas
- Alternância entre abas "Compromissos" e "Lista de Tarefas"

###  Tela de Calendário
- Visualização de calendário mensal interativo
- Indicadores visuais nos dias com compromissos
- Ao clicar em um dia com compromisso, exibe modal com detalhes
- Navegação entre meses (anterior/próximo)
- Destaque visual para o dia atual

###  Tela de Configurações
- **Tema Escuro/Claro**: Toggle funcional para alternar entre temas (única opção na tela)
- Tema padrão: **Escuro**
- Persistência da preferência de tema

###  Personalização
- **Logo**: A imagem fornecida (`logo.png`) é usada no cabeçalho das telas.
- **Ícone do App**: A imagem fornecida (`logo.png`) foi configurada como ícone do APK (Android).

##  Tecnologias Utilizadas

- **React Native 0.82.1** (bare workflow)
- **TypeScript**
- **React Navigation** (Bottom Tabs)
- **AsyncStorage** (persistência de dados)
- **React Native Vector Icons** (ícones Material Design)
- **Context API** (gerenciamento de estado)
- **@react-native-community/datetimepicker** (Seletores de Data/Hora)

##  Estrutura do Projeto

```
OrganiaMais/
├── src/
│   ├── screens/
│   │   ├── AgendaScreen.tsx
│   │   ├── CalendarioScreen.tsx
│   │   └── ConfiguracoesScreen.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   └── AgendaContext.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── types/
│   │   └── index.ts
│   └── assets/
│       └── logo.png  <-- Nova logo
├── android/
├── ios/
└── App.tsx
```
##  Uso do Aplicativo

### Adicionar Compromisso

1. Vá para a aba "Agenda"
2. Clique no botão "Adicionar Item"
3. Preencha o Título e Descrição
4. Use os **seletores** para escolher Data e Hora.
5. Clique em "Adicionar"

### Adicionar Tarefa

1. Vá para a aba "Agenda"
2. Clique na aba "Lista de Tarefas"
3. Clique no botão "Adicionar Item"
4. Digite o nome da tarefa
5. Clique em "Adicionar"

### Editar/Excluir

1. Clique nos 3 pontos (⋮) ao lado do item
2. Selecione "Editar" ou "Excluir"

### Visualizar Compromissos no Calendário

1. Vá para a aba "Calendário"
2. Dias com compromissos terão indicador visual
3. Clique no dia para ver os compromissos

### Alternar Tema

1. Vá para a aba "Configurações"
2. Ative/desative o switch "Tema Escuro"