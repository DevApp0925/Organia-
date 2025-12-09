import notifee, {
    AndroidImportance,
    TimestampTrigger,
    TriggerType,
} from "@notifee/react-native";
import { Appointment } from "../contexts/AppointmentContext";

class NotificationService {
    async requestPermission() {
        const settings = await notifee.requestPermission();
        console.log("Permission settings:", settings);
    }

    async createChannel() {
        await notifee.createChannel({
            id: "appointments_v2",
            name: "Compromissos",
            importance: AndroidImportance.HIGH,
            sound: "toque_notificacao",
        });
    }

    private formatTimeOffset(minutes: number): string {
        if (minutes % 1440 === 0) {
            const days = minutes / 1440;
            return `${days} ${days === 1 ? 'dia' : 'dias'}`;
        }
        if (minutes % 60 === 0) {
            const hours = minutes / 60;
            return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
        return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }

    async scheduleAppointmentNotification(appointment: Appointment) {
        console.log("Scheduling notification for:", appointment);
        const { date, time, title, id, alertOffset } = appointment;

        if (!alertOffset) {
            return;
        }

        const appointmentDate = new Date(`${date}T${time}:00`);
        const notificationDate = new Date(
            appointmentDate.getTime() - alertOffset * 60000,
        );

        const formattedOffset = this.formatTimeOffset(alertOffset);

        if (notificationDate.getTime() <= Date.now()) {
            console.log("Notification time is in the past. Checking if appointment is in the future...");
            if (appointmentDate.getTime() > Date.now()) {
                console.log("Appointment is in the future, showing notification immediately.");
                // Create a trigger for 1 second from now
                const trigger: TimestampTrigger = {
                    type: TriggerType.TIMESTAMP,
                    timestamp: Date.now() + 1000,
                };

                await this.createChannel();

                await notifee.createTriggerNotification(
                    {
                        id,
                        title: "Lembrete de Compromisso",
                        body: `Em ${formattedOffset} é seu compromisso "${title}"`,
                        android: {
                            channelId: "appointments_v2",
                            pressAction: {
                                id: "default",
                                launchActivity: "default",
                            },
                            sound: "toque_notificacao",
                            importance: AndroidImportance.HIGH,
                            smallIcon: "ic_notification",
                            color: "#4B6A9B",

                        },
                    },
                    trigger,
                );
                return;
            } else {
                console.log("Appointment is also in the past, skipping.");
                return;
            }
        }

        console.log("Notification scheduled for:", notificationDate);

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: notificationDate.getTime(),
        };

        await this.createChannel();

        await notifee.createTriggerNotification(
            {
                id,
                title: "Lembrete de Compromisso",
                body: `Em ${formattedOffset} é seu compromisso "${title}"`,
                android: {
                    channelId: "appointments_v2",
                    pressAction: {
                        id: "default",
                        launchActivity: "default",
                    },
                    sound: "toque_notificacao",
                    importance: AndroidImportance.HIGH,
                    smallIcon: "ic_notification",
                    color: "#4B6A9B",

                },
            },
            trigger,
        );
        console.log("Notification trigger created");
    }

    async cancelNotification(id: string) {
        await notifee.cancelNotification(id);
    }
}

export default new NotificationService();
