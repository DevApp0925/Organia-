import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  FlatList,
  ViewStyle,
  TextStyle,
  Image,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAppointments } from "../contexts/AppointmentContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import AppointmentDetailsModal from "../components/AppointmentDetailsModal";
import AppointmentFormModal from "../components/AppointmentFormModal";
import NotificationService from "../services/NotificationService";
import { Alert } from "react-native";

interface CalendarDayProps {
  date: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  indicatorColor?: string;
  isSelected: boolean;
  colors: any;
  onPress: (date: Date) => void;
  dayLabel: string;
}

const CalendarDayComponent: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday,
  indicatorColor,
  isSelected,
  colors,
  onPress,
  dayLabel,
}) => {
  if (!date) {
    return <View style={styles.dayCell} />;
  }

  const dayCellStyle: ViewStyle[] = [
    styles.dayCell,
    {
      backgroundColor: isSelected
        ? colors.primary
        : indicatorColor
          ? indicatorColor + "30"
          : colors.card,
      borderWidth: isToday ? 2 : 0,
      borderColor: colors.primary,
    },
  ];

  const dayTextStyle: TextStyle[] = [
    styles.dayText,
    {
      color: isSelected
        ? "#FFF"
        : isCurrentMonth
          ? colors.text
          : colors.textSecondary,
      fontWeight: isToday ? "700" : "500",
    },
  ];

  return (
    <TouchableOpacity style={dayCellStyle} onPress={() => onPress(date)}>
      <Text style={dayTextStyle}>{dayLabel}</Text>
      {indicatorColor && (
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: isSelected ? "#FFF" : indicatorColor,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const CalendarScreen = () => {
  const { colors } = useTheme();
  const { getAppointmentsByDate, deleteAppointment, updateAppointment } = useAppointments();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [apptDetailsModalVisible, setApptDetailsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDetailAppointment, setSelectedDetailAppointment] = useState<any | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);
  const emptyDays = Array(firstDayOfWeek).fill(null);
  const calendarDays = [...emptyDays, ...daysInMonth];

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayPress = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);
  };

  const dayLabel = (date: Date | null) => {
    if (!date) return "";
    return format(date, "d");
  };

  const getIndicatorColor = (date: Date | null) => {
    if (!date) return undefined;
    const dateStr = format(date, "yyyy-MM-dd");
    const dayAppts = getAppointmentsByDate(dateStr);

    if (dayAppts.length === 0) return undefined;

    if (dayAppts.some(a => a.priority === 'high')) return "#EF4444"; // Red
    if (dayAppts.some(a => a.priority === 'medium')) return "#F59E0B"; // Yellow
    return "#10B981"; // Green (Low)
  };

  const selectedAppointments = selectedDate
    ? getAppointmentsByDate(selectedDate)
    : [];

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
            setApptDetailsModalVisible(false);
            // If no more appointments, maybe close the day modal? Optional.
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleUpdateAppointment = async (data: any) => {
    if (!selectedDetailAppointment) return;

    try {
      updateAppointment(selectedDetailAppointment.id, data);

      if (data.alertOffset) {
        await NotificationService.scheduleAppointmentNotification({
          ...selectedDetailAppointment,
          ...data,
        });
      } else {
        await NotificationService.cancelNotification(selectedDetailAppointment.id);
      }

      setEditModalVisible(false);
      setSelectedDetailAppointment(null);
    } catch (error) {
      console.error("Error updating appointment", error);
      Alert.alert("Erro", "Falha ao atualizar compromisso");
    }
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
          <Text style={[styles.title, { color: colors.text }]}>Calendário</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Visualize seus compromissos
          </Text>

          <View
            style={[
              styles.calendarContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.monthHeader,
                {
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity onPress={handlePrevMonth}>
                <Text style={[styles.arrowButton, { color: colors.text }]}>
                  ‹
                </Text>
              </TouchableOpacity>

              <Text style={[styles.monthTitle, { color: colors.text }]}>
                {format(currentDate, "MMMM yyyy", { locale: ptBR })
                  .charAt(0)
                  .toUpperCase() +
                  format(currentDate, "MMMM yyyy", { locale: ptBR }).slice(1)}
              </Text>

              <TouchableOpacity onPress={handleNextMonth}>
                <Text style={[styles.arrowButton, { color: colors.text }]}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysHeader}>
              {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((day) => (
                <View key={day} style={styles.weekDayCell}>
                  <Text
                    style={[
                      styles.weekDayText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date
                  ? isSameMonth(date, currentDate)
                  : false;
                const isToday = date ? isSameDay(date, new Date()) : false;

                const indicatorColor = getIndicatorColor(date);
                const dayStr = date ? format(date, "yyyy-MM-dd") : "";
                const isSelected = selectedDate === dayStr;
                const label = date ? dayLabel(date) : "";

                return (
                  <CalendarDayComponent
                    key={index}
                    date={date}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    indicatorColor={indicatorColor}
                    isSelected={isSelected}
                    colors={colors}
                    onPress={handleDayPress}
                    dayLabel={label}
                  />
                );
              })}
            </View>
          </View>


          {
            selectedDate && (
              <View style={{ marginTop: 24, paddingBottom: 24 }}>
                <Text style={[styles.title, { fontSize: 20, marginBottom: 12, color: colors.text }]}>
                  {format(new Date(selectedDate + "T00:00:00"), "d 'de' MMMM", {
                    locale: ptBR,
                  })
                    .charAt(0)
                    .toUpperCase() +
                    format(new Date(selectedDate + "T00:00:00"), "d 'de' MMMM", {
                      locale: ptBR,
                    }).slice(1)}
                </Text>

                {selectedAppointments.length === 0 ? (
                  <View style={[styles.emptyState, { paddingVertical: 24 }]}>
                    <Text
                      style={[
                        styles.emptyStateText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Nenhum compromisso neste dia
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={selectedAppointments}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.appointmentDetail,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            borderLeftWidth: 4,
                            borderLeftColor: item.color || colors.primary
                          },
                        ]}
                        onPress={() => {
                          setSelectedDetailAppointment(item);
                          setApptDetailsModalVisible(true);
                        }}
                      >
                        <View style={styles.appointmentTimeContainer}>
                          <Text
                            style={[
                              styles.appointmentTime,
                              { color: colors.primary },
                            ]}
                          >
                            {item.time}
                          </Text>
                        </View>
                        <View style={styles.appointmentInfo}>
                          <Text
                            style={[
                              styles.appointmentTitle,
                              { color: colors.text },
                            ]}
                          >
                            {item.title}
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
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                )}
              </View>
            )
          }

        </View>
      </ScrollView>


      <AppointmentDetailsModal
        visible={apptDetailsModalVisible}
        onClose={() => setApptDetailsModalVisible(false)}
        appointment={selectedDetailAppointment}
        onEdit={(appointment) => {
          setApptDetailsModalVisible(false);
          setEditModalVisible(true);
        }}
        onDelete={(id) => {
          handleDelete(id);
        }}
        onDelete={(id) => {
          handleDelete(id);
        }}
      />

      <AppointmentFormModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleUpdateAppointment}
        initialData={selectedDetailAppointment}
        isEditing={true}
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
  calendarContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  arrowButton: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  weekDaysHeader: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: "1%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  } as ViewStyle,
  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
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
    flex: 1,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
  },
  appointmentDetail: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: "center",
  },
  appointmentTimeContainer: {
    paddingRight: 16,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: "700",
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  appointmentDescription: {
    fontSize: 12,
    fontStyle: "italic",
  },
});

export default CalendarScreen;
