import { io } from "socket.io-client";
import { useEffect, useRef, useState, useCallback } from "react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("sync:tasks", (allTasks) => {
      setTasks(allTasks);
      setLoading(false);
    });

    socket.on("task:created", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on("task:updated", (updated) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });

    socket.on("task:moved", ({ taskId, column }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, column } : t))
      );
    });

    socket.on("task:deleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createTask = useCallback((data) => {
    socketRef.current?.emit("task:create", data);
  }, []);

  const updateTask = useCallback((data) => {
    socketRef.current?.emit("task:update", data);
  }, []);

  const moveTask = useCallback((taskId, column) => {
    socketRef.current?.emit("task:move", { taskId, column });
  }, []);

  const deleteTask = useCallback((taskId) => {
    socketRef.current?.emit("task:delete", taskId);
  }, []);

  return { connected, tasks, loading, createTask, updateTask, moveTask, deleteTask };
}
