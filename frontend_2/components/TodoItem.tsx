import React, { useState } from 'react';
import { Check, Edit2, Trash2, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { ImageUpload } from './ImageUpload';
import { Badge } from '../ui/badge';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  image?: string;
  createdAt: Date;
  completedAt?: Date;
  category?: string;
}

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, { text: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const handleComplete = () => {
    onUpdate(todo.id, { 
      completed: !todo.completed,
      completedAt: !todo.completed ? new Date() : undefined
    });
  };

  const handleImageAdd = (imageUrl: string) => {
    onUpdate(todo.id, { image: imageUrl });
  };

  const handleImageRemove = () => {
    onUpdate(todo.id, { image: undefined });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`group p-4 border rounded-lg transition-all duration-200 ${
      todo.completed 
        ? 'bg-muted/50 border-muted-foreground/20' 
        : 'bg-card border-border hover:shadow-md'
    }`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={handleComplete}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="mb-2"
              autoFocus
            />
          ) : (
            <div className="mb-2">
              <p className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                {todo.text}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Created {formatDate(todo.createdAt)}
                </span>
                {todo.completed && todo.completedAt && (
                  <Badge variant="secondary" className="text-xs">
                    Completed {formatDate(todo.completedAt)}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <ImageUpload
              onImageSelect={handleImageAdd}
              currentImage={todo.image}
              onImageRemove={handleImageRemove}
            />
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(todo.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};