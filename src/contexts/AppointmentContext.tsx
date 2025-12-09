import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Appointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  description?: string;
  alertOffset?: number; // minutes before appointment
  color?: string;
  priority?: "low" | "medium" | "high";
}

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, appointment: Omit<Appointment, "id">) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentById: (id: string) => Appointment | undefined;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(
  undefined,
);

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error("useAppointments must be used within AppointmentProvider");
  }
  return context;
};

interface AppointmentProviderProps {
  children: ReactNode;
}

export const AppointmentProvider: React.FC<AppointmentProviderProps> = ({
  children,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const stored = await AsyncStorage.getItem("appointments");
      if (stored) {
        setAppointments(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppointments = async (newAppointments: Appointment[]) => {
    try {
      await AsyncStorage.setItem(
        "appointments",
        JSON.stringify(newAppointments),
      );
      setAppointments(newAppointments);
    } catch (error) {
      console.error("Error saving appointments:", error);
    }
  };

  const addAppointment = (appointment: Omit<Appointment, "id">) => {
    const id = Date.now().toString();
    const newAppointment: Appointment = {
      ...appointment,
      id,
    };
    saveAppointments([...appointments, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = (
    id: string,
    updatedData: Omit<Appointment, "id">,
  ) => {
    const updated = appointments.map((apt) =>
      apt.id === id ? { ...apt, ...updatedData } : apt,
    );
    saveAppointments(updated);
  };

  const deleteAppointment = (id: string) => {
    const filtered = appointments.filter((apt) => apt.id !== id);
    saveAppointments(filtered);
  };

  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments
      .filter((apt) => apt.date === date)
      .sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
  };

  const getAppointmentById = (id: string): Appointment | undefined => {
    return appointments.find((apt) => apt.id === id);
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getAppointmentsByDate,
        getAppointmentById,
      }}
    >
      {!isLoading && children}
    </AppointmentContext.Provider>
  );
};
