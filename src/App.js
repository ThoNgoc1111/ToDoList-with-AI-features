import React, { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch todos from backend
  useEffect(() => {
    setLoading(true);
    fetch("/api/todos")
      .then(res => res.json())
      .then(data => setTodos(data))
      .finally(() => setLoading(false));
  }, []);

  // Add a new todo
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo }),
    });
    const todo = await res.json();
    setTodos([...todos, todo]);
    setNewTodo("");
  };

  // Toggle completed
  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const updated = await res.json();
    setTodos(todos.map(t => t.id === id ? updated : t));
  };

  // Delete todo
  const handleDelete = async (id) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 30 }}>
      <h1>To-Do List</h1>
      <form onSubmit={handleAdd}>
        <input
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
          style={{ width: "80%" }}
        />
        <button type="submit">Add</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {todos.map(todo => (
            <li key={todo.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "8px 0",
                  opacity: todo.completed ? 0.5 : 1,
                  textDecoration: todo.completed ? "line-through" : "none"
                }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
              />
              <span style={{ flex: 1, marginLeft: 8 }}>{todo.text}</span>
              <button onClick={() => handleDelete(todo.id)} style={{ marginLeft: 8 }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;