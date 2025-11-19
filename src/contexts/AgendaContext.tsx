import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Compromisso, Tarefa} from '../types';

interface AgendaContextType {
  compromissos: Compromisso[];
  tarefas: Tarefa[];
  adicionarCompromisso: (compromisso: Omit<Compromisso, 'id'>) => void;
  editarCompromisso: (id: string, compromisso: Partial<Omit<Compromisso, 'lembrete'>>) => void;
  excluirCompromisso: (id: string) => void;
  adicionarTarefa: (tarefa: Omit<Tarefa, 'id'>) => void;
  editarTarefa: (id: string, tarefa: Partial<Tarefa>) => void;
  excluirTarefa: (id: string) => void;
  obterCompromissosPorData: (data: string) => Compromisso[];
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const AgendaProvider = ({children}: {children: ReactNode}) => {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    salvarDados();
  }, [compromissos, tarefas]);

  const carregarDados = async () => {
    try {
      const compromissosData = await AsyncStorage.getItem('compromissos');
      const tarefasData = await AsyncStorage.getItem('tarefas');
      
      if (compromissosData) {
        setCompromissos(JSON.parse(compromissosData));
      }
      if (tarefasData) {
        setTarefas(JSON.parse(tarefasData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const salvarDados = async () => {
    try {
      await AsyncStorage.setItem('compromissos', JSON.stringify(compromissos));
      await AsyncStorage.setItem('tarefas', JSON.stringify(tarefas));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const adicionarCompromisso = (compromisso: Omit<Compromisso, 'id'>) => {
    const novoCompromisso: Compromisso = {
      ...compromisso,
      id: Date.now().toString(),
    };
    setCompromissos([...compromissos, novoCompromisso]);
  };

  const editarCompromisso = (id: string, compromissoAtualizado: Partial<Compromisso>) => {
    setCompromissos(
      compromissos.map(c =>
        c.id === id ? {...c, ...compromissoAtualizado} : c
      )
    );
  };

  const excluirCompromisso = (id: string) => {
    setCompromissos(compromissos.filter(c => c.id !== id));
  };

  const adicionarTarefa = (tarefa: Omit<Tarefa, 'id'>) => {
    const novaTarefa: Tarefa = {
      ...tarefa,
      id: Date.now().toString(),
    };
    setTarefas([...tarefas, novaTarefa]);
  };

  const editarTarefa = (id: string, tarefaAtualizada: Partial<Tarefa>) => {
    setTarefas(
      tarefas.map(t =>
        t.id === id ? {...t, ...tarefaAtualizada} : t
      )
    );
  };

  const excluirTarefa = (id: string) => {
    setTarefas(tarefas.filter(t => t.id !== id));
  };

  const obterCompromissosPorData = (data: string): Compromisso[] => {
    return compromissos.filter(c => c.data === data);
  };

  return (
    <AgendaContext.Provider
      value={{
        compromissos,
        tarefas,
        adicionarCompromisso,
        editarCompromisso,
        excluirCompromisso,
        adicionarTarefa,
        editarTarefa,
        excluirTarefa,
        obterCompromissosPorData,
      }}>
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = () => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda deve ser usado dentro de AgendaProvider');
  }
  return context;
};
