import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    energy: 'low' | 'medium' | 'high';
}

interface TaskContextType {
    tasks: Task[];
    addTask: (title: string, energy?: 'low' | 'medium' | 'high') => void;
    updateTask: (id: string, title: string, energy?: 'low' | 'medium' | 'high') => void;
    deleteTask: (id: string) => void;
    toggleTaskCompletion: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error("useTasks must be used within TaskProvider");
    }
    return context;
};

interface TaskProviderProps {
    children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const stored = await AsyncStorage.getItem("tasks");
            if (stored) {
                setTasks(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTasks = async (newTasks: Task[]) => {
        try {
            await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
            setTasks(newTasks);
        } catch (error) {
            console.error("Error saving tasks:", error);
        }
    };

    const addTask = (title: string, energy: 'low' | 'medium' | 'high' = 'medium') => {
        const newTask: Task = {
            id: Date.now().toString(),
            title,
            completed: false,
            createdAt: new Date().toISOString(),
            energy,
        };
        saveTasks([...tasks, newTask]);
    };

    const updateTask = (id: string, title: string, energy?: 'low' | 'medium' | 'high') => {
        const updated = tasks.map((task) =>
            task.id === id ? { ...task, title, energy: energy || task.energy } : task
        );
        saveTasks(updated);
    };

    const deleteTask = (id: string) => {
        const filtered = tasks.filter((task) => task.id !== id);
        saveTasks(filtered);
    };

    const toggleTaskCompletion = (id: string) => {
        const updated = tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks(updated);
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                updateTask,
                deleteTask,
                toggleTaskCompletion,
            }}
        >
            {!isLoading && children}
        </TaskContext.Provider>
    );
};
