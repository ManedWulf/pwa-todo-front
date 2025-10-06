import { useEffect, useMemo, useState } from "react";
import { api, setAuth } from "../api";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Chip,
  Checkbox,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// === Modelo alineado a tu backend ===
type Task = {
  _id: string;
  title: string;
  description?: string;
  status: "Pendiente" | "En Progreso" | "Completada";
  clienteId?: string;
  createdAt?: string;
  deleted?: boolean;
};

// Normaliza lo que venga del backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTask(x: any): Task {
  return {
    _id: String(x?._id ?? x?.id),
    title: String(x?.title ?? "(sin título)"),
    description: x?.description ?? "",
    status:
      x?.status === "Completada" ||
      x?.status === "En Progreso" ||
      x?.status === "Pendiente"
        ? x.status
        : "Pendiente",
    clienteId: x?.clienteId,
    createdAt: x?.createdAt,
    deleted: !!x?.deleted,
  };
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");          // ⬅️ Nuevo
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState(""); // ⬅️ Nuevo

  useEffect(() => {
    setAuth(localStorage.getItem("token"));
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks"); // { items: [...] }
      const raw = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setTasks(raw.map(normalizeTask));
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const d = description.trim();
    if (!t) return;
    const { data } = await api.post("/tasks", { title: t, description: d }); // ⬅️ Envia descripción
    const created = normalizeTask(data?.task ?? data);
    setTasks((prev) => [created, ...prev]);
    setTitle("");
    setDescription("");
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === "Completada" ? "Pendiente" : "Completada";
    const updated = { ...task, status: newStatus };
    setTasks((prev) => prev.map((x) => (x._id === task._id ? updated : x)));
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
    } catch {
      setTasks((prev) => prev.map((x) => (x._id === task._id ? task : x)));
    }
  }

  function startEdit(task: Task) {
    setEditingId(task._id);
    setEditingTitle(task.title);
    setEditingDescription(task.description ?? "");
  }

  async function saveEdit(taskId: string) {
    const newTitle = editingTitle.trim();
    const newDesc = editingDescription.trim();
    if (!newTitle) return;

    const before = tasks.find((t) => t._id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, title: newTitle, description: newDesc } : t))
    );
    setEditingId(null);
    try {
      await api.put(`/tasks/${taskId}`, { title: newTitle, description: newDesc }); // ⬅️ Envía descripción
    } catch {
      if (before) setTasks((prev) => prev.map((t) => (t._id === taskId ? before : t)));
    }
  }

  async function removeTask(taskId: string) {
    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      setTasks(backup);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setAuth(null);
    window.location.href = "/"; // login
  }

  const filtered = useMemo(() => {
    let list = tasks;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(s) ||
          (t.description || "").toLowerCase().includes(s) // ⬅️ Busca también por descripción
      );
    }
    if (filter === "active") list = list.filter((t) => t.status !== "Completada");
    if (filter === "completed") list = list.filter((t) => t.status === "Completada");
    return list;
  }, [tasks, search, filter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "Completada").length;
    return { total, done, pending: total - done };
  }, [tasks]);

  return (
    <Box className="wrap">
  {/* ===== Topbar ===== */}
  <AppBar position="static" color="primary">
    <Toolbar>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>To-Do PWA</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography>Total: {stats.total}</Typography>
        <Typography>Hechas: {stats.done}</Typography>
        <Typography>Pendientes: {stats.pending}</Typography>
      </Box>
      <Button color="error" variant="contained" onClick={logout}>Salir</Button>
    </Toolbar>
  </AppBar>

  <Box component="main" sx={{ p: 3 }}>
    {/* ===== Crear ===== */}
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Agregar tarea</Typography>
      <Box component="form" onSubmit={addTask} sx={{ display: 'grid', gap: 2 }}>
        <TextField
          fullWidth
          label="Título de la tarea…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          fullWidth
          label="Descripción (opcional)…"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button variant="contained" type="submit">Agregar</Button>
      </Box>
    </Paper>

    {/* ===== Toolbar ===== */}
    <Box className="toolbar" sx={{ mb: 3 }}>
      <TextField
        fullWidth
        label="Buscar por título o descripción…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip
          label="Todas"
          color={filter === "all" ? "primary" : "default"}
          onClick={() => setFilter("all")}
        />
        <Chip
          label="Activas"
          color={filter === "active" ? "primary" : "default"}
          onClick={() => setFilter("active")}
        />
        <Chip
          label="Hechas"
          color={filter === "completed" ? "primary" : "default"}
          onClick={() => setFilter("completed")}
        />
      </Box>
    </Box>

    {/* ===== Lista ===== */}
    {loading ? (
      <Typography>Cargando…</Typography>
    ) : filtered.length === 0 ? (
      <Typography color="text.secondary">Sin tareas</Typography>
    ) : (
      <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
        {filtered.map((t) => (
          <Paper
            key={t._id}
            sx={{
              mb: 2,
              p: 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              backgroundColor: t.status === "Completada" ? '#e0f7fa' : 'inherit',
            }}
          >
            <Checkbox
              checked={t.status === "Completada"}
              onChange={() => toggleTask(t)}
            />

            <Box sx={{ flexGrow: 1 }}>
              {editingId === t._id ? (
                <>
                  <TextField
                    fullWidth
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="Título"
                    autoFocus
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    placeholder="Descripción"
                  />
                </>
              ) : (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ cursor: 'pointer' }}
                    onDoubleClick={() => startEdit(t)}
                  >
                    {t.title}
                  </Typography>
                  {t.description && (
                    <Typography variant="body2" color="text.secondary">
                      {t.description}
                    </Typography>
                  )}
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {editingId === t._id ? (
                <Button variant="outlined" onClick={() => saveEdit(t._id)}>Guardar</Button>
              ) : (
                <IconButton onClick={() => startEdit(t)} title="Editar">
                  <EditIcon />
                </IconButton>
              )}
              <IconButton color="error" onClick={() => removeTask(t._id)} title="Eliminar">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    )}
  </Box>
</Box>
  );
}