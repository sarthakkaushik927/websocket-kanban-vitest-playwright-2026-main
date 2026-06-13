const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

let tasks = [
  {
    id: "task-1",
    title: "Set up project repo",
    description: "Initialize git and folder structure",
    column: "todo",
    priority: "high",
    category: "feature",
    attachments: [],
    createdAt: Date.now(),
  },
  {
    id: "task-2",
    title: "Design DB schema",
    description: "Figure out how to store tasks",
    column: "inprogress",
    priority: "medium",
    category: "feature",
    attachments: [],
    createdAt: Date.now(),
  },
  {
    id: "task-3",
    title: "Fix login redirect bug",
    description: "Users get kicked after 10 minutes",
    column: "done",
    priority: "high",
    category: "bug",
    attachments: [],
    createdAt: Date.now(),
  },
];

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  socket.emit("sync:tasks", tasks);

  socket.on("task:create", (taskData) => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: taskData.title || "Untitled",
      description: taskData.description || "",
      column: taskData.column || "todo",
      priority: taskData.priority || "medium",
      category: taskData.category || "feature",
      attachments: taskData.attachments || [],
      createdAt: Date.now(),
    };
    tasks.push(newTask);
    io.emit("task:created", newTask);
  });

  socket.on("task:update", (updatedTask) => {
    const idx = tasks.findIndex((t) => t.id === updatedTask.id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updatedTask };
      io.emit("task:updated", tasks[idx]);
    }
  });

  socket.on("task:move", ({ taskId, column }) => {
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      tasks[idx].column = column;
      io.emit("task:moved", { taskId, column });
    }
  });

  socket.on("task:delete", (taskId) => {
    tasks = tasks.filter((t) => t.id !== taskId);
    io.emit("task:deleted", taskId);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

module.exports = { app, server, io };
