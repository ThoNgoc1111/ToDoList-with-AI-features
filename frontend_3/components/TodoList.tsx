import React, { useState, useEffect } from 'react';
import { Plus, Images, Filter, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TodoItem, Todo } from './TodoItem';
import { Slideshow } from './Slideshow';
import { MemoryDashboard } from './MemoryDashboard';

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSlideshow, setShowSlideshow] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      const parsedTodos = JSON.parse(saved).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoText('');
    }
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !todo.completed) || 
      (filter === 'completed' && todo.completed);
    
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    withImages: todos.filter(t => t.image).length
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2">Visual Todo List</h1>
            <p className="text-muted-foreground">
              Track your progress and create memories with photos
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl">{stats.completed}/{stats.total}</div>
            <p className="text-sm text-muted-foreground">
              {stats.withImages} with photos
            </p>
          </div>
        </div>

        <MemoryDashboard 
          todos={todos} 
          onCreateSlideshow={() => setShowSlideshow(true)} 
        />

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new todo..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addTodo}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({todos.length})</SelectItem>
              <SelectItem value="active">Active ({stats.total - stats.completed})</SelectItem>
              <SelectItem value="completed">Completed ({stats.completed})</SelectItem>
            </SelectContent>
          </Select>
          {stats.withImages > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowSlideshow(true)}
            >
              <Images className="w-4 h-4 mr-2" />
              View Photos ({stats.withImages})
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? 'No todos match your search.' : 'No todos yet. Add one above!'}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>

      <Slideshow
        todos={todos}
        isOpen={showSlideshow}
        onClose={() => setShowSlideshow(false)}
      />
    </div>
  );
};