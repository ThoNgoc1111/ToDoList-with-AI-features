import React, { useState, useEffect } from 'react';
import { Plus, Images, Filter, Search, Cloud, CloudOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { TodoItem, Todo } from './TodoItem';
import { Slideshow } from './Slideshow';
import { MemoryDashboard } from './MemoryDashboard';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const SupabaseTodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [userId] = useState(() => {
    // Generate or get persistent user ID
    let id = localStorage.getItem('todo-user-id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('todo-user-id', id);
    }
    return id;
  });

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-39e078d6`;

  // Load todos from server
  const loadTodos = async () => {
    try {
      const response = await fetch(`${serverUrl}/todos`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'x-user-id': userId
        }
      });
      
      if (!response.ok) throw new Error('Failed to load todos');
      
      const data = await response.json();
      const parsedTodos = data.todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
      }));
      
      setTodos(parsedTodos);
      setIsOnline(true);
    } catch (error) {
      console.log('Failed to load todos from server:', error);
      setIsOnline(false);
      // Fallback to localStorage
      const saved = localStorage.getItem('todos-backup');
      if (saved) {
        const parsedTodos = JSON.parse(saved).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
        }));
        setTodos(parsedTodos);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save todos to server
  const saveTodos = async (todosToSave: Todo[]) => {
    try {
      const response = await fetch(`${serverUrl}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'x-user-id': userId
        },
        body: JSON.stringify({ todos: todosToSave })
      });
      
      if (!response.ok) throw new Error('Failed to save todos');
      
      setIsOnline(true);
      // Also save to localStorage as backup
      localStorage.setItem('todos-backup', JSON.stringify(todosToSave));
    } catch (error) {
      console.log('Failed to save todos to server:', error);
      setIsOnline(false);
      // Save to localStorage as fallback
      localStorage.setItem('todos-backup', JSON.stringify(todosToSave));
      toast.error('Working offline - changes saved locally');
    }
  };

  // Upload image to server
  const uploadImage = async (imageData: string): Promise<string | null> => {
    try {
      const response = await fetch(`${serverUrl}/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'x-user-id': userId
        },
        body: JSON.stringify({
          imageData,
          fileName: `todo-image-${Date.now()}.jpg`
        })
      });
      
      if (!response.ok) throw new Error('Failed to upload image');
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.log('Failed to upload image:', error);
      toast.error('Failed to upload image to cloud, using local storage');
      return imageData; // Fallback to local data URL
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    if (todos.length > 0 && !isLoading) {
      saveTodos(todos);
    }
  }, [todos, isLoading]);

  const addTodo = async () => {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoText('');
      
      if (isOnline) {
        toast.success('Todo added!');
      }
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    // Handle image upload if there's a new image
    if (updates.image && updates.image.startsWith('data:image/')) {
      const uploadedUrl = await uploadImage(updates.image);
      if (uploadedUrl) {
        updates.image = uploadedUrl;
      }
    }

    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    toast.success('Todo deleted');
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1>Visual Todo List</h1>
              {isOnline ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Synced
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <CloudOff className="w-3 h-3" />
                  Offline
                </Badge>
              )}
            </div>
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