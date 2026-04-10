import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

  useEffect(() => {
      fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

        const result = await response.json();
      setTasks(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
        setError('Please enter a task title');
      return;
    }

    try {
      setError(null);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
          headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.error);
      }

      setNewTaskTitle('');
      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

    const toggleTaskComplete = async (taskId, currentCompleted) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentCompleted }),
      });

        const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (taskId) => {
      try {
      setError(null);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

        if (!response.ok) {
        throw new Error(result.error);
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
      if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

    return (
    <div className="app">
      <div className="container">
          <h1>Task Manager</h1>

        <form onSubmit={addTask} className="add-task-form">
          <input
            type="text"
            value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="task-input"
          />
            <button type="submit" className="btn btn-add">
            Add Task
          </button>
        </form>

        {error && <div className="error-message">Error: {error}</div>}

        <div className="filter-section">
          <button
            className={`btn btn-filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`btn btn-filter ${filter === 'incomplete' ? 'active' : ''}`}
            onClick={() => setFilter('incomplete')}
          >
            To Do
          </button>
            <button
            className={`btn btn-filter ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Done
          </button>
        </div>

        {loading ? (
          <p className="loading">Loading tasks...</p>
        ) : (
          <>
            {filteredTasks.length === 0 ? (
              <p className="no-tasks">
                {filter === 'all' 
                  ? 'No tasks yet! Add one above' 
                    : `No ${filter} tasks.`}
              </p>
            ) : (
              <ul className="task-list">
                {filteredTasks.map((task) => (
                    <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-content">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskComplete(task.id, task.completed)}
                          className="task-checkbox"
                      />
                      <span className="task-title">{task.title}</span>
                      <span className="task-date">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                      <button
                      onClick={() => deleteTask(task.id)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!loading && tasks.length > 0 && (
            <div className="task-stats">
            <strong>Total:</strong> {tasks.length} tasks | 
            <strong> Completed:</strong> {tasks.filter(t => t.completed).length} | 
              <strong> To Do:</strong> {tasks.filter(t => !t.completed).length}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
