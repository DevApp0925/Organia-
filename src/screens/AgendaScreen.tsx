import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {useAgenda} from '../contexts/AgendaContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const Logo = require('../assets/logo.png');

// Funções utilitárias para formatação
const formatarDataParaInput = (dataISO: string): Date => {
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};

const formatarDataISO = (date: Date): string => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

const formatarHoraParaInput = (horaStr: string): Date => {
  const [hora, minuto] = horaStr.split(':').map(Number);
  const now = new Date();
  now.setHours(hora, minuto, 0, 0);
  return now;
};

const formatarHoraStr = (date: Date): string => {
  const hora = String(date.getHours()).padStart(2, '0');
  const minuto = String(date.getMinutes()).padStart(2, '0');
  return `${hora}:${minuto}`;
};

export const AgendaScreen = () => {
  const {theme} = useTheme();
  const {
    compromissos,
    tarefas,
    adicionarCompromisso,
    editarCompromisso,
    excluirCompromisso,
    adicionarTarefa,
    editarTarefa,
    excluirTarefa,
  } = useAgenda();

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoItem, setTipoItem] = useState<'compromisso' | 'tarefa'>('compromisso');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itemEditando, setItemEditando] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'compromissos' | 'tarefas'>('compromissos');

  // Estados do formulário de compromisso
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(formatarDataISO(new Date()));
  const [hora, setHora] = useState(formatarHoraStr(new Date()));

  // Estados para o DateTimePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estado do formulário de tarefa
  const [nomeTarefa, setNomeTarefa] = useState('');

  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  const abrirModalAdicionar = (tipo: 'compromisso' | 'tarefa') => {
    limparFormulario();
    setTipoItem(tipo);
    setModoEdicao(false);
    setModalVisible(true);
  };

  const abrirModalEditar = (id: string, tipo: 'compromisso' | 'tarefa') => {
    setModoEdicao(true);
    setItemEditando(id);
    setTipoItem(tipo);

    if (tipo === 'compromisso') {
      const compromisso = compromissos.find(c => c.id === id);
      if (compromisso) {
        setTitulo(compromisso.titulo);
        setDescricao(compromisso.descricao);
        setData(compromisso.data);
        setHora(compromisso.hora);
      }
    } else {
      const tarefa = tarefas.find(t => t.id === id);
      if (tarefa) {
        setNomeTarefa(tarefa.nome);
      }
    }

    setModalVisible(true);
    setMenuAberto(null);
  };

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setData(formatarDataISO(new Date()));
    setHora(formatarHoraStr(new Date()));

    setNomeTarefa('');
    setItemEditando(null);
  };

  const salvarItem = () => {
    if (tipoItem === 'compromisso') {
      if (!titulo || !data || !hora) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
        return;
      }

      if (modoEdicao && itemEditando) {
        editarCompromisso(itemEditando, {titulo, descricao, data, hora});
      } else {
        adicionarCompromisso({titulo, descricao, data, hora});
      }
    } else {
      if (!nomeTarefa) {
        Alert.alert('Erro', 'Digite o nome da tarefa');
        return;
      }

      if (modoEdicao && itemEditando) {
        editarTarefa(itemEditando, {nome: nomeTarefa});
      } else {
        adicionarTarefa({nome: nomeTarefa, concluida: false});
      }
    }

    setModalVisible(false);
    limparFormulario();
  };

  const confirmarExclusao = (id: string, tipo: 'compromisso' | 'tarefa') => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir este ${tipo === 'compromisso' ? 'compromisso' : 'tarefa'}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (tipo === 'compromisso') {
              excluirCompromisso(id);
            } else {
              excluirTarefa(id);
            }
            setMenuAberto(null);
          },
        },
      ]
    );
  };

  const formatarData = (dataISO: string) => {
    const [ano, mes, dia] = dataISO.split('-');
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return `${diasSemana[date.getDay()]}, ${dia} de ${meses[parseInt(mes) - 1]}`;
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setData(formatarDataISO(selectedDate));
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setHora(formatarHoraStr(selectedTime));
    }
  };

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
        <Text style={[styles.sectionTitle, {color: theme.text}]}>Sua Agenda</Text>
        <Text style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
          Gerencie seus compromissos e tarefas
        </Text>
      </View>

      {/* Botão Adicionar Item */}
      <TouchableOpacity
        style={[styles.addButton, {backgroundColor: theme.primary}]}
        onPress={() => abrirModalAdicionar(abaAtiva === 'compromissos' ? 'compromisso' : 'tarefa')}>
        <Icon name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Adicionar Item</Text>
      </TouchableOpacity>

      {/* Abas */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            abaAtiva === 'compromissos' && {backgroundColor: theme.primary},
            {backgroundColor: abaAtiva === 'compromissos' ? theme.primary : theme.surface},
          ]}
          onPress={() => setAbaAtiva('compromissos')}>
          <Text
            style={[
              styles.tabText,
              {color: abaAtiva === 'compromissos' ? '#FFFFFF' : theme.textSecondary},
            ]}>
            Compromissos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {backgroundColor: abaAtiva === 'tarefas' ? theme.primary : theme.surface},
          ]}
          onPress={() => setAbaAtiva('tarefas')}>
          <Text
            style={[
              styles.tabText,
              {color: abaAtiva === 'tarefas' ? '#FFFFFF' : theme.textSecondary},
            ]}>
            Lista de Tarefas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de itens */}
      <ScrollView style={styles.listContainer}>
        {abaAtiva === 'compromissos' ? (
          compromissos.length === 0 ? (
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
              Nenhum compromisso cadastrado
            </Text>
          ) : (
            compromissos.map(compromisso => (
              <View key={compromisso.id} style={[styles.itemCard, {backgroundColor: theme.surface}]}>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, {color: theme.text}]}>{compromisso.titulo}</Text>
                  <Text style={[styles.itemDescription, {color: theme.textSecondary}]}>
                    {compromisso.descricao}
                  </Text>
                  <View style={styles.itemDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="event" size={16} color={theme.iconActive} />
                      <Text style={[styles.detailText, {color: theme.textSecondary}]}>
                        {formatarData(compromisso.data)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="access-time" size={16} color={theme.iconActive} />
                      <Text style={[styles.detailText, {color: theme.textSecondary}]}>
                        {compromisso.hora}
                      </Text>
                    </View>
                  </View>

                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuAberto(menuAberto === compromisso.id ? null : compromisso.id)}>
                  <Icon name="more-vert" size={24} color={theme.text} />
                </TouchableOpacity>
                {menuAberto === compromisso.id && (
                  <View style={[styles.menuDropdown, {backgroundColor: theme.surfaceLight}]}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => abrirModalEditar(compromisso.id, 'compromisso')}>
                      <Icon name="edit" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, {color: theme.text}]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => confirmarExclusao(compromisso.id, 'compromisso')}>
                      <Icon name="delete" size={20} color={theme.error} />
                      <Text style={[styles.menuItemText, {color: theme.error}]}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )
        ) : (
          tarefas.length === 0 ? (
            <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
              Nenhuma tarefa cadastrada
            </Text>
          ) : (
            tarefas.map(tarefa => (
              <View key={tarefa.id} style={[styles.itemCard, {backgroundColor: theme.surface}]}>
                <View style={styles.itemContent}>
                  <View style={styles.tarefaRow}>
                    <TouchableOpacity
                      onPress={() => editarTarefa(tarefa.id, {concluida: !tarefa.concluida})}>
                      <Icon
                        name={tarefa.concluida ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={tarefa.concluida ? theme.success : theme.icon}
                      />
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.tarefaNome,
                        {color: theme.text},
                        tarefa.concluida && styles.tarefaConcluida,
                      ]}>
                      {tarefa.nome}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuAberto(menuAberto === tarefa.id ? null : tarefa.id)}>
                  <Icon name="more-vert" size={24} color={theme.text} />
                </TouchableOpacity>
                {menuAberto === tarefa.id && (
                  <View style={[styles.menuDropdown, {backgroundColor: theme.surfaceLight}]}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => abrirModalEditar(tarefa.id, 'tarefa')}>
                      <Icon name="edit" size={20} color={theme.text} />
                      <Text style={[styles.menuItemText, {color: theme.text}]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => confirmarExclusao(tarefa.id, 'tarefa')}>
                      <Icon name="delete" size={20} color={theme.error} />
                      <Text style={[styles.menuItemText, {color: theme.error}]}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Modal de Adicionar/Editar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: theme.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: theme.text}]}>
                {modoEdicao ? 'Editar' : 'Adicionar'} {tipoItem === 'compromisso' ? 'Compromisso' : 'Tarefa'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {tipoItem === 'compromisso' ? (
                <>
                  <Text style={[styles.label, {color: theme.textSecondary}]}>Título *</Text>
                  <TextInput
                    style={[styles.input, {backgroundColor: theme.surfaceLight, color: theme.text}]}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder="Ex: Reunião de Equipe"
                    placeholderTextColor={theme.textTertiary}
                  />

                  <Text style={[styles.label, {color: theme.textSecondary}]}>Descrição</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, {backgroundColor: theme.surfaceLight, color: theme.text}]}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Detalhes do compromisso..."
                    placeholderTextColor={theme.textTertiary}
                    multiline
                    numberOfLines={3}
                  />

                  {/* Seletor de Data */}
                  <Text style={[styles.label, {color: theme.textSecondary}]}>Data *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.pickerButton, {backgroundColor: theme.surfaceLight}]}
                    onPress={() => setShowDatePicker(true)}>
                    <Text style={{color: theme.text}}>{data}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={formatarDataParaInput(data)}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* Seletor de Hora */}
                  <Text style={[styles.label, {color: theme.textSecondary}]}>Hora *</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.pickerButton, {backgroundColor: theme.surfaceLight}]}
                    onPress={() => setShowTimePicker(true)}>
                    <Text style={{color: theme.text}}>{hora}</Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={formatarHoraParaInput(hora)}
                      mode="time"
                      display="default"
                      onChange={onChangeTime}
                      is24Hour={true}
                    />
                  )}
                </>
              ) : (
                <>
                  <Text style={[styles.label, {color: theme.textSecondary}]}>Nome da Tarefa *</Text>
                  <TextInput
                    style={[styles.input, {backgroundColor: theme.surfaceLight, color: theme.text}]}
                    value={nomeTarefa}
                    onChangeText={setNomeTarefa}
                    placeholder="Ex: Comprar mantimentos"
                    placeholderTextColor={theme.textTertiary}
                  />
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, {backgroundColor: theme.primary}]}
              onPress={salvarItem}>
              <Text style={styles.saveButtonText}>{modoEdicao ? 'Salvar Alterações' : 'Adicionar'}</Text>
            </TouchableOpacity>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    position: 'relative',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
  reminderBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  reminderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  menuDropdown: {
    position: 'absolute',
    right: 16,
    top: 50,
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tarefaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tarefaNome: {
    fontSize: 16,
    flex: 1,
  },
  tarefaConcluida: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalForm: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '500',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    paddingVertical: 16,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});