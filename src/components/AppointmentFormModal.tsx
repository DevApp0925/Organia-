import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    SafeAreaView,
    ScrollView,
    Alert,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";

interface AppointmentFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    onDelete?: (id: string) => void;
    initialData?: any;
    isEditing: boolean;
}

const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
    visible,
    onClose,
    onSave,
    onDelete,
    initialData,
    isEditing,
}) => {
    const { colors } = useTheme();

    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
    const [alarmUnit, setAlarmUnit] = useState<"minutes" | "hours" | "days">("minutes");
    const [alarmValue, setAlarmValue] = useState<number | undefined>(undefined);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setTitle(initialData.title);
                const [year, month, day] = initialData.date.split("-").map(Number);
                const [hours, minutes] = initialData.time.split(":").map(Number);
                setDate(new Date(year, month - 1, day, hours, minutes));
                setDescription(initialData.description || "");
                setPriority(initialData.priority || "low");

                const offset = initialData.alertOffset;
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
            } else {
                resetForm();
            }
        }
    }, [visible, initialData]);

    const resetForm = () => {
        setTitle("");
        setDate(new Date());
        setDescription("");
        setPriority("low");
        setAlarmUnit("minutes");
        setAlarmValue(undefined);
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert("Erro", "Por favor, insira o nome da tarefa");
            return;
        }

        const dateStr = format(date, "yyyy-MM-dd");
        const timeStr = format(date, "HH:mm");

        let alertOffset = undefined;
        if (alarmValue !== undefined) {
            let multiplier = 1;
            if (alarmUnit === 'hours') multiplier = 60;
            if (alarmUnit === 'days') multiplier = 1440;
            alertOffset = alarmValue * multiplier;
        }

        onSave({
            title,
            date: dateStr,
            time: timeStr,
            description,
            priority,
            alertOffset,
        });
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
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
                    <TouchableOpacity onPress={onClose}>
                        <Text style={[styles.closeButton, { color: colors.text }]}>
                            ✕
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                        {isEditing ? "Editar Tarefa" : "Adicionar Tarefa"}
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
                        onPress={handleSave}
                    >
                        <Text style={styles.submitButtonText}>
                            {isEditing ? "Atualizar" : "Adicionar"}
                        </Text>
                    </TouchableOpacity>

                    {isEditing && onDelete && (
                        <TouchableOpacity
                            style={[styles.deleteButton, { borderColor: colors.danger }]}
                            onPress={() => {
                                if (initialData?.id) onDelete(initialData.id);
                            }}
                        >
                            <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
                                Deletar Compromisso
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        fontSize: 24,
        fontWeight: "bold",
        padding: 8,
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
});

export default AppointmentFormModal;
