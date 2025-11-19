import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {useAgenda} from '../contexts/AgendaContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Logo = require('../assets/logo.png');

export const CalendarioScreen = () => {
  const {theme} = useTheme();
  const {obterCompromissosPorData} = useAgenda();

  // Configuração de cores do calendário com fallback para evitar erros
  const calendarTheme = theme.calendar || {
    weekDayText: theme.textSecondary,
    todayBackground: theme.primary,
    selectedDay: theme.surfaceLight || '#ccc',
    dayText: theme.text,
    selectedDayText: '#FFFFFF',
  };

  const [mesAtual, setMesAtual] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [compromissosDodia, setCompromissosDodia] = useState<any[]>([]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const obterDiasDoMes = (data: Date) => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    
    const diasAnteriores = primeiroDia.getDay();
    const diasNoMes = ultimoDia.getDate();
    
    const dias: (number | null)[] = [];
    
    // Dias do mês anterior
    for (let i = 0; i < diasAnteriores; i++) {
      dias.push(null);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= diasNoMes; i++) {
      dias.push(i);
    }
    
    return dias;
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const formatarDataISO = (dia: number): string => {
    const ano = mesAtual.getFullYear();
    const mes = String(mesAtual.getMonth() + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    return `${ano}-${mes}-${diaStr}`;
  };

  const verificarCompromissoNoDia = (dia: number): boolean => {
    const dataISO = formatarDataISO(dia);
    const compromissos = obterCompromissosPorData?.(dataISO) || [];
    return compromissos.length > 0;
  };

  const handleDiaClick = (dia: number) => {
    const dataISO = formatarDataISO(dia);
    const compromissos = obterCompromissosPorData?.(dataISO) || [];
    
    if (compromissos.length > 0) {
      // Ordena os compromissos por horário antes de mostrar
      compromissos.sort((a, b) => a.hora.localeCompare(b.hora));
      setCompromissosDodia(compromissos);
      setModalVisible(true);
    }
  };

  const formatarData = (dataISO: string) => {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const ehHoje = (dia: number): boolean => {
    const hoje = new Date();
    return (
      dia === hoje.getDate() &&
      mesAtual.getMonth() === hoje.getMonth() &&
      mesAtual.getFullYear() === hoje.getFullYear()
    );
  };

  const dias = obterDiasDoMes(mesAtual);

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.background}]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.headerTitle, {color: theme.text}]}>Organia+</Text>
        </View>
      </View>

      {/* Título da seção */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>Calendário</Text>
        <Text style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
          Visualize seus compromissos
        </Text>
      </View>

      {/* Calendário */}
      <View style={[styles.calendarioContainer, {backgroundColor: theme.surface}]}>
        {/* Navegação do mês */}
        <View style={styles.mesNavegacao}>
          <TouchableOpacity onPress={mesAnterior} style={styles.navButton}>
            <Icon name="chevron-left" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.mesTexto, {color: theme.text}]}>
            {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </Text>
          <TouchableOpacity onPress={proximoMes} style={styles.navButton}>
            <Icon name="chevron-right" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Dias da semana */}
        <View style={styles.diasSemanaContainer}>
          {diasSemana.map((dia, index) => (
            <View key={index} style={styles.diaSemana}>
              <Text style={[styles.diaSemanaTexto, {color: calendarTheme.weekDayText}]}>
                {dia}
              </Text>
            </View>
          ))}
        </View>

        {/* Grade de dias */}
        <View style={styles.diasGrid}>
          {dias.map((dia, index) => {
            if (dia === null) {
              return <View key={`empty-${index}`} style={styles.diaVazio} />;
            }

            const temCompromisso = verificarCompromissoNoDia(dia);
            const hoje = ehHoje(dia);

            return (
              <TouchableOpacity
                key={`dia-${dia}`}
                style={[
                  styles.diaContainer,
                  hoje && {backgroundColor: calendarTheme.todayBackground},
                  temCompromisso && !hoje && {backgroundColor: calendarTheme.selectedDay},
                ]}
                onPress={() => handleDiaClick(dia)}>
                <Text
                  style={[
                    styles.diaTexto,
                    {color: calendarTheme.dayText},
                    (hoje || temCompromisso) && {color: calendarTheme.selectedDayText},
                    (hoje || temCompromisso) && styles.textoNegrito,
                  ]}>
                  {dia}
                </Text>
                {temCompromisso && (
                  <View style={[styles.indicadorCompromisso, {backgroundColor: calendarTheme.selectedDayText}]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Modal de compromissos do dia ATUALIZADO */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.surface}]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, {color: theme.text}]}>
                  Compromissos do Dia
                </Text>
                <Text style={[styles.modalSubtitle, {color: theme.primary}]}>
                  {compromissosDodia.length > 0 ? formatarData(compromissosDodia[0].data) : ''}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.compromissosList}>
              {compromissosDodia.map((compromisso, index) => (
                <View 
                    key={compromisso.id} 
                    style={[
                        styles.itemLista, 
                        {
                            borderBottomColor: theme.surfaceLight, 
                            borderBottomWidth: index === compromissosDodia.length - 1 ? 0 : 1 
                        }
                    ]}
                >
                  <View style={styles.linhaPrincipal}>
                    <View style={[styles.horaContainer, {backgroundColor: theme.surfaceLight}]}>
                        <Icon name="access-time" size={16} color={theme.primary} style={{marginRight: 4}}/>
                        <Text style={[styles.textoHora, {color: theme.text}]}>
                            {compromisso.hora}
                        </Text>
                    </View>
                    <Text style={[styles.textoTitulo, {color: theme.text}]}>
                      {compromisso.titulo}
                    </Text>
                  </View>
                  
                  {compromisso.descricao ? (
                      <Text style={[styles.textoDescricao, {color: theme.textSecondary}]}>
                        {compromisso.descricao}
                      </Text>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  calendarioContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  mesNavegacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  mesTexto: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  diasSemanaContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  diaSemana: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  diaSemanaTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  diasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  diaVazio: {
    width: '14.28%',
    aspectRatio: 1,
  },
  diaContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
  },
  diaTexto: {
    fontSize: 16,
  },
  textoNegrito: {
    fontWeight: 'bold',
  },
  indicadorCompromisso: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  // Estilos do Modal Atualizados
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', // Centraliza na tela
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  compromissosList: {
    marginBottom: 10,
  },
  // Novos estilos para a lista limpa
  itemLista: {
    paddingVertical: 16,
  },
  linhaPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  horaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  textoHora: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  textoDescricao: {
    fontSize: 14,
    marginLeft: 4, // Alinha visualmente com o título
    marginTop: 4,
  },
});