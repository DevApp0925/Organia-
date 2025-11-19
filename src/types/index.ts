export interface Compromisso {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // ISO date string
  hora: string;

}

export interface Tarefa {
  id: string;
  nome: string;
  concluida: boolean;
}

export type ItemAgenda = Compromisso | Tarefa;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  icon: string;
  iconActive: string;
  error: string;
  success: string;
  calendar: {
    background: string;
    dayText: string;
    selectedDay: string;
    selectedDayText: string;
    todayBackground: string;
    todayText: string;
    weekDayText: string;
  };
}
