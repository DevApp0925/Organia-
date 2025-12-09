import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Appointment } from "../contexts/AppointmentContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onEdit: (appointment: Appointment) => void;
    onDelete: (id: string) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
    visible,
    onClose,
    appointment,
    onEdit,
    onDelete,
}) => {
    const { colors } = useTheme();

    if (!appointment) return null;

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr + "T00:00:00"), "d 'de' MMMM 'de' yyyy", {
                locale: ptBR,
            });
        } catch {
            return dateStr;
        }
    };

    const getPriorityLabel = (priority?: string) => {
        switch (priority) {
            case "high":
                return "Alta";
            case "medium":
                return "Média";
            case "low":
                return "Baixa";
            default:
                return "Baixa";
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "high":
                return "#EF4444";
            case "medium":
                return "#F59E0B";
            case "low":
                return "#10B981";
            default:
                return "#10B981";
        }
    };

    const getAlertLabel = (offset?: number) => {
        if (!offset) return "Sem alarme";
        if (offset % 1440 === 0) {
            const days = offset / 1440;
            return `${days} ${days === 1 ? 'dia' : 'dias'} antes`;
        }
        if (offset % 60 === 0) {
            const hours = offset / 60;
            return `${hours} ${hours === 1 ? 'hora' : 'horas'} antes`;
        }
        return `${offset} min antes`;
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.card }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Detalhes</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <View style={[styles.colorStrip, { backgroundColor: appointment.color || colors.primary }]} />

                        <Text style={[styles.appointmentTitle, { color: colors.text }]}>
                            {appointment.title}
                        </Text>

                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Data:</Text>
                            <Text style={[styles.value, { color: colors.text }]}>
                                {formatDate(appointment.date)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Horário:</Text>
                            <Text style={[styles.value, { color: colors.text }]}>
                                {appointment.time}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Prioridade:</Text>
                            <View style={[styles.badge, { backgroundColor: getPriorityColor(appointment.priority) + "20" }]}>
                                <Text style={[styles.badgeText, { color: getPriorityColor(appointment.priority) }]}>
                                    {getPriorityLabel(appointment.priority)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Alarme:</Text>
                            <Text style={[styles.value, { color: colors.text }]}>
                                {getAlertLabel(appointment.alertOffset)}
                            </Text>
                        </View>

                        {appointment.description ? (
                            <View style={styles.section}>
                                <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 4 }]}>Descrição:</Text>
                                <Text style={[styles.description, { color: colors.text }]}>
                                    {appointment.description}
                                </Text>
                            </View>
                        ) : null}
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary + "20" }]}
                            onPress={() => {
                                onClose();
                                onEdit(appointment);
                            }}
                        >
                            <Text style={[styles.buttonText, { color: colors.primary }]}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.danger + "20" }]}
                            onPress={() => {
                                onClose();
                                onDelete(appointment.id);
                            }}
                        >
                            <Text style={[styles.buttonText, { color: colors.danger }]}>Deletar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    container: {
        borderRadius: 16,
        maxHeight: "80%",
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        fontSize: 20,
        padding: 4,
    },
    content: {
        padding: 20,
    },
    colorStrip: {
        height: 4,
        width: 40,
        borderRadius: 2,
        marginBottom: 16,
    },
    appointmentTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 24,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        width: 80,
    },
    value: {
        fontSize: 16,
        fontWeight: "500",
        flex: 1,
    },
    section: {
        marginTop: 8,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});

export default AppointmentDetailsModal;
