import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Download, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Todo } from './TodoItem';

interface SlideshowProps {
  todos: Todo[];
  isOpen: boolean;
  onClose: () => void;
}

export const Slideshow: React.FC<SlideshowProps> = ({ todos, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const todosWithImages = todos.filter(todo => todo.image);
  
  if (todosWithImages.length === 0) return null;

  const currentTodo = todosWithImages[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % todosWithImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + todosWithImages.length) % todosWithImages.length);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Memory Slideshow</DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {todosWithImages.length}
              </span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <img
              src={currentTodo.image}
              alt={currentTodo.text}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {todosWithImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="p-6 pt-0 border-t">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="mb-2">{currentTodo.text}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Created: {formatDate(currentTodo.createdAt)}</span>
                {currentTodo.completed && currentTodo.completedAt && (
                  <span>Completed: {formatDate(currentTodo.completedAt)}</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          {todosWithImages.length > 1 && (
            <div className="flex gap-1 mt-4 justify-center">
              {todosWithImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};