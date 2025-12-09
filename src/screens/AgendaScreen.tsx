import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useAppointments, Appointment } from "../contexts/AppointmentContext";
import { useTasks, Task } from "../contexts/TaskContext";
import { useTheme } from "../contexts/ThemeContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DateTimePicker from "@react-native-community/datetimepicker";
import NotificationService from "../services/NotificationService";
import AppointmentDetailsModal from "../components/AppointmentDetailsModal";

const AgendaScreen = () => {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } =
    useAppointments();
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } =
    useTasks();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<"appointments" | "tasks">(
    "appointments",
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedDetailAppointment, setSelectedDetailAppointment] =
    useState<Appointment | null>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4B6A9B"); // Default color
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [alertOffset, setAlertOffset] = useState<number | undefined>(undefined);

  // Alarm State
  const [alarmUnit, setAlarmUnit] = useState<"minutes" | "hours" | "days">("minutes");
  const [alarmValue, setAlarmValue] = useState<number | undefined>(undefined);

  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskEnergy, setTaskEnergy] = useState<"low" | "medium" | "high">("medium");
  const [energyFilter, setEnergyFilter] = useState<"all" | "low" | "medium">("all");

  useEffect(() => {
    NotificationService.requestPermission();
  }, []);

  // Sync alertOffset when unit or value changes
  useEffect(() => {
    if (alarmValue === undefined) {
      setAlertOffset(undefined);
      return;
    }

    let multiplier = 1;
    if (alarmUnit === 'hours') multiplier = 60;
    if (alarmUnit === 'days') multiplier = 1440; // 24 * 60

    setAlertOffset(alarmValue * multiplier);
  }, [alarmUnit, alarmValue]);

  const handleAddOrUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Erro", "Por favor, insira o nome da tarefa");
      return;
    }

    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Data inválida. Por favor, selecione a data novamente.");
      }

      const dateStr = format(date, "yyyy-MM-dd");
      const timeStr = format(date, "HH:mm");

      if (selectedAppointment) {
        updateAppointment(selectedAppointment.id, {
          title,
          date: dateStr,
          time: timeStr,
          description: description || "",
          alertOffset,
          color: color || "#4B6A9B",
          priority,
        });

        try {
          if (alertOffset) {
            await NotificationService.scheduleAppointmentNotification({
              ...selectedAppointment,
              title,
              date: dateStr,
              time: timeStr,
              description: description || "",
              alertOffset,
              color: color || "#4B6A9B",
              priority,
            });
          } else {
            await NotificationService.cancelNotification(selectedAppointment.id);
          }
        } catch (error) {
          console.error("Error scheduling/cancelling notification:", error);
        }
      } else {
        const newAppointment = addAppointment({
          title,
          date: dateStr,
          time: timeStr,
          description: description || "",
          alertOffset,
          color: color || "#4B6A9B",
          priority: priority,
        });

        if (alertOffset && newAppointment) {
          try {
            await NotificationService.scheduleAppointmentNotification(newAppointment);
          } catch (error) {
            console.error("Error scheduling notification:", error);
          }
        }
      }

      resetForm();
      setModalVisible(false);

    } catch (error: any) {
      console.error("Error saving appointment:", error);
      Alert.alert("Erro ao salvar", error.message || "Ocorreu um erro desconhecido.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDate(new Date());
    setDescription("");
    setColor("#4B6A9B");
    setPriority("low");
    setAlertOffset(undefined);
    setAlarmUnit("minutes");
    setAlarmValue(undefined);
    setSelectedAppointment(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setTitle(appointment.title);
    const [year, month, day] = appointment.date.split("-").map(Number);
    const [hours, minutes] = appointment.time.split(":").map(Number);
    setDate(new Date(year, month - 1, day, hours, minutes));
    setDescription(appointment.description || "");
    setColor(appointment.color || "#4B6A9B");
    setPriority(appointment.priority || "low");

    const offset = appointment.alertOffset;
    if (offset) {
      if (offset % 1440 === 0) {
        setAlarmUnit('days');
        setAlarmValue(offset / 1440);
      } else if (offset % 60 === 0) {
        setAlarmUnit('hours');
        setAlarmValue(offset / 60);
      } else {
        setAlarmUnit('minutes');
        setAlarmValue(offset);
      }
    } else {
      setAlarmValue(undefined);
      setAlarmUnit('minutes');
    }

    setModalVisible(true);
    setMenuVisible(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirmar",
      "Tem certeza que deseja deletar este compromisso?",
      [
        { text: "Cancelar", onPress: () => { } },
        {
          text: "Deletar",
          onPress: () => {
            deleteAppointment(id);
            NotificationService.cancelNotification(id);
            setMenuVisible(null);
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleAddOrUpdateTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert("Erro", "Por favor, insira o nome da tarefa");
      return;
    }

    if (selectedTask) {
      updateTask(selectedTask.id, taskTitle, taskEnergy);
    } else {
      addTask(taskTitle, taskEnergy);
    }

    resetTaskForm();
    setTaskModalVisible(false);
  };

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskEnergy("medium");
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskEnergy(task.energy || "medium");
    setTaskModalVisible(true);
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert(
      "Confirmar",
      "Tem certeza que deseja deletar esta tarefa?",
      [
        { text: "Cancelar", onPress: () => { } },
        {
          text: "Deletar",
          onPress: () => deleteTask(id),
          style: "destructive",
        },
      ],
    );
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const filteredTasks = tasks.filter(task => {
    if (energyFilter === 'all') return true;
    if (energyFilter === 'medium') return task.energy === 'low' || task.energy === 'medium';
    if (energyFilter === 'low') return task.energy === 'low';
    return true;
  });

  const AppointmentItem = ({ item }: { item: Appointment }) => {
    const formatDate = (dateStr: string) => {
      try {
        return format(new Date(dateStr + "T00:00:00"), "d 'de' MMMM", {
          locale: ptBR,
        });
      } catch {
        return dateStr;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.appointmentItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderLeftWidth: 4,
            borderLeftColor: item.color || colors.primary
          },
        ]}
        onPress={() => {
          setSelectedDetailAppointment(item);
          setDetailsModalVisible(true);
        }}
      >
        <View style={styles.appointmentContent}>
          <Text style={[styles.appointmentTitle, { color: colors.text }]}>
            {item.title}
            {item.priority && item.priority !== "low" && (
              <Text
                style={{
                  fontSize: 12,
                  color: item.priority === "high" ? colors.danger : "#F59E0B",
                  fontWeight: "bold",
                }}
              >
                {" "}
                {item.priority === "high" ? "[ALTA]" : "[MÉDIA]"}
              </Text>
            )}
          </Text>
          <Text
            style={[styles.appointmentTime, { color: colors.textSecondary }]}
          >
            {item.time} • {formatDate(item.date)}
          </Text>
          {item.description && (
            <Text
              style={[
                styles.appointmentDescription,
                { color: colors.textSecondary },
              ]}
            >
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
            onPress={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger + "20" }]}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
          >
            <Text style={[styles.actionButtonText, { color: colors.danger }]}>🗑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity >
    );
  };

  const TaskItem = ({ item }: { item: Task }) => {
    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => toggleTaskCompletion(item.id)}
      >
        <View style={styles.taskContent}>
          <View style={[
            styles.checkbox,
            {
              borderColor: item.completed ? colors.primary : colors.textSecondary,
              backgroundColor: item.completed ? colors.primary : "transparent"
            }
          ]}>
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.taskTitle,
                {
                  color: item.completed ? colors.textSecondary : colors.text,
                  textDecorationLine: item.completed ? "line-through" : "none"
                }
              ]}
            >
              {item.title}
            </Text>
            {item.energy && !item.completed && (
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <View style={{
                  backgroundColor: item.energy === 'high' ? '#FECACA' : item.energy === 'medium' ? '#FDE68A' : '#D1FAE5',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4
                }}>
                  <Text style={{
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: item.energy === 'high' ? '#EF4444' : item.energy === 'medium' ? '#D97706' : '#059669'
                  }}>
                    {item.energy === 'high' ? '⚡ PESADA' : item.energy === 'medium' ? '⚖️ MÉDIA' : '🍃 LEVE'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
            onPress={(e) => {
              e.stopPropagation();
              handleEditTask(item);
            }}
          >
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger + "20" }]}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteTask(item.id);
            }}
          >
            <Text style={[styles.actionButtonText, { color: colors.danger }]}>🗑</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Organia+
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Agenda</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "appointments" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary
                },
                { borderColor: colors.border }
              ]}
              onPress={() => setActiveTab("appointments")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "appointments" ? "#FFF" : colors.text }
                ]}
              >
                Compromissos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "tasks" && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary
                },
                { borderColor: colors.border }
              ]}
              onPress={() => setActiveTab("tasks")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "tasks" ? "#FFF" : colors.text }
                ]}
              >
                Lista de Tarefas
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {activeTab === "appointments" ? "Gerencie seus compromissos" : "Gerencie suas tarefas"}
          </Text>

          {activeTab === "tasks" && (
            <View style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: colors.card, padding: 4, borderRadius: 12 }}>
              {[
                { label: "😴 Cansado", value: "low", color: "#10B981" },
                { label: "😐 Normal", value: "medium", color: "#F59E0B" },
                { label: "💪 Com Pique", value: "all", color: "#3B82F6" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    alignItems: 'center',
                    borderRadius: 8,
                    backgroundColor: energyFilter === option.value ? option.color : 'transparent',
                  }}
                  onPress={() => setEnergyFilter(option.value as any)}
                >
                  <Text style={{
                    fontWeight: 'bold',
                    fontSize: 12,
                    color: energyFilter === option.value ? '#FFF' : colors.textSecondary
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === "appointments" ? (
            sortedAppointments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text
                  style={[styles.emptyStateText, { color: colors.textSecondary }]}
                >
                  Nenhum compromisso agendado
                </Text>
              </View>
            ) : (
              <FlatList
                data={sortedAppointments}
                renderItem={AppointmentItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )
          ) : (
            tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text
                  style={[styles.emptyStateText, { color: colors.textSecondary }]}
                >
                  Nenhuma tarefa criada
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredTasks}
                renderItem={TaskItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          if (activeTab === "appointments") {
            resetForm();
            setSelectedAppointment(null);
            setModalVisible(true);
          } else {
            resetTaskForm();
            setTaskModalVisible(true);
          }
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.closeButton, { color: colors.text }]}>
                ✕
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedAppointment ? "Editar Tarefa" : "Adicionar Tarefa"}
            </Text>
            <View style={styles.spacer} />
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nome da Tarefa
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ex: Reunião com cliente"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Data e Hora</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      justifyContent: "center",
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: colors.text }}>
                    {format(date, "dd/MM/yyyy")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      justifyContent: "center",
                    },
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ color: colors.text }}>
                    {format(date, "HH:mm")}
                  </Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(date);
                      newDate.setFullYear(selectedDate.getFullYear());
                      newDate.setMonth(selectedDate.getMonth());
                      newDate.setDate(selectedDate.getDate());
                      setDate(newDate);
                    }
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(date);
                      newDate.setHours(selectedDate.getHours());
                      newDate.setMinutes(selectedDate.getMinutes());
                      setDate(newDate);
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Descrição
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    height: 80,
                  },
                ]}
                placeholder="Adicione detalhes..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Prioridade</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[
                  { label: "Baixa", value: "low", color: "#10B981" },
                  { label: "Média", value: "medium", color: "#F59E0B" },
                  { label: "Alta", value: "high", color: "#EF4444" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      {
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor:
                          priority === option.value ? option.color : colors.border,
                        backgroundColor:
                          priority === option.value
                            ? option.color + "20"
                            : "transparent",
                      },
                    ]}
                    onPress={() => setPriority(option.value as any)}
                  >
                    <Text
                      style={{
                        color:
                          priority === option.value ? option.color : colors.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Alarme</Text>

              <View style={{ flexDirection: "row", marginBottom: 12, backgroundColor: colors.card, borderRadius: 8, padding: 4 }}>
                {[
                  { label: "Minutos", value: "minutes" },
                  { label: "Horas", value: "hours" },
                  { label: "Dias", value: "days" }
                ].map((u) => (
                  <TouchableOpacity
                    key={u.value}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      alignItems: 'center',
                      borderRadius: 6,
                      backgroundColor: alarmUnit === u.value ? colors.primary : 'transparent'
                    }}
                    onPress={() => {
                      setAlarmUnit(u.value as any);
                    }}
                  >
                    <Text style={{
                      color: alarmUnit === u.value ? '#FFF' : colors.textSecondary,
                      fontWeight: '600',
                      fontSize: 13
                    }}>
                      {u.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>

                <TouchableOpacity
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: alarmValue === undefined ? colors.primary : 'transparent'
                  }}
                  onPress={() => setAlarmValue(undefined)}
                >
                  <Text style={{
                    color: alarmValue === undefined ? '#FFF' : colors.text,
                    fontWeight: '500',
                    fontSize: 14
                  }}>
                    Sem alarme
                  </Text>
                </TouchableOpacity>

                {[1, 5, 15, 30, 40].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      {
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor:
                          alarmValue === val
                            ? colors.primary
                            : colors.card,
                      },
                    ]}
                    onPress={() => setAlarmValue(val)}
                  >
                    <Text
                      style={{
                        color:
                          alarmValue === val ? "#FFF" : colors.text,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {val} {alarmUnit === 'days' ? (val === 1 ? 'dia' : 'dias') : (alarmUnit === 'hours' ? (val === 1 ? 'hora' : 'horas') : 'min')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleAddOrUpdate}
            >
              <Text style={styles.submitButtonText}>
                {selectedAppointment ? "Atualizar" : "Adicionar"}
              </Text>
            </TouchableOpacity>

            {selectedAppointment && (
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: colors.danger }]}
                onPress={() => {
                  handleDelete(selectedAppointment.id);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
                  Deletar Compromisso
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>

      </Modal >

      <Modal
        transparent
        visible={taskModalVisible}
        animationType="slide"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
              <Text style={[styles.closeButton, { color: colors.text }]}>
                ✕
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedTask ? "Editar Tarefa" : "Adicionar Tarefa"}
            </Text>
            <View style={styles.spacer} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nome da Tarefa
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ex: Comprar leite"
                placeholderTextColor={colors.textSecondary}
                value={taskTitle}
                onChangeText={setTaskTitle}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nível de Energia</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[
                  { label: "🍃 Leve", value: "low", color: "#10B981" },
                  { label: "⚖️ Média", value: "medium", color: "#F59E0B" },
                  { label: "⚡ Pesada", value: "high", color: "#EF4444" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      {
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor:
                          taskEnergy === option.value ? option.color : colors.border,
                        backgroundColor:
                          taskEnergy === option.value
                            ? option.color + "20"
                            : "transparent",
                        alignItems: 'center'
                      },
                    ]}
                    onPress={() => setTaskEnergy(option.value as any)}
                  >
                    <Text
                      style={{
                        color:
                          taskEnergy === option.value ? option.color : colors.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleAddOrUpdateTask}
            >
              <Text style={styles.submitButtonText}>
                {selectedTask ? "Atualizar" : "Adicionar"}
              </Text>
            </TouchableOpacity>

            {selectedTask && (
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: colors.danger }]}
                onPress={() => {
                  handleDeleteTask(selectedTask.id);
                  setTaskModalVisible(false);
                }}
              >
                <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
                  Deletar Tarefa
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <AppointmentDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        appointment={selectedDetailAppointment}
        onEdit={(appointment) => {
          handleEdit(appointment);
        }}
        onDelete={(id) => {
          handleDelete(id);
        }}
      />
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2430",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  appointmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  appointmentContent: {
    flex: 1,
    marginRight: 12,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 13,
    marginBottom: 4,
  },
  appointmentDescription: {
    fontSize: 12,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  spacer: {
    width: 40,
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 32,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
});

export default AgendaScreen;
