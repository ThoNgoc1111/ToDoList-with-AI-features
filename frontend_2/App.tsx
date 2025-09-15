import React from 'react';
import { SupabaseTodoList } from './components/SupabaseTodoList';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <SupabaseTodoList />
      <Toaster />
    </div>
  );
}