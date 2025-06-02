
"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AVAILABLE_COMPONENTS } from './available-components';
import { Separator } from '../ui/separator';

const ComponentLibraryPanel: React.FC = () => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, componentType: string) => {
    event.dataTransfer.setData('application/react-weaver-component', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="h-full w-64 flex flex-col rounded-none border-r border-panel-border shadow-md">
      <CardHeader className="p-4 border-b border-panel-border">
        <CardTitle className="text-lg font-headline text-primary">Components</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-0">
          <ul className="space-y-1 p-2">
            {AVAILABLE_COMPONENTS.map((comp) => (
              <li key={comp.id}>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp.id)}
                  className="flex items-center p-2.5 rounded-md hover:bg-accent/50 cursor-grab transition-colors duration-150 group"
                  title={`Drag to add ${comp.name}`}
                >
                  <comp.icon className="h-5 w-5 mr-3 text-primary group-hover:text-accent-foreground" />
                  <span className="text-sm font-medium group-hover:text-accent-foreground">{comp.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ComponentLibraryPanel;
