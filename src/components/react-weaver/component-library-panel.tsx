
"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { AVAILABLE_COMPONENTS, type AvailableComponent } from './available-components';
import { cn } from '@/lib/utils';

const ComponentLibraryPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, componentType: string) => {
    event.dataTransfer.setData('application/react-weaver-component', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categorizedComponents = useMemo(() => {
    const filtered = AVAILABLE_COMPONENTS.filter(comp =>
      comp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories: Record<string, AvailableComponent[]> = {};
    filtered.forEach(comp => {
      const category = comp.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(comp);
    });

    // Optional: Define a preferred category order
    const preferredOrder = ['Layout & Navigation', 'Forms', 'Content', 'Custom', 'Miscellaneous', 'Uncategorized'];
    return Object.entries(categories).sort(([catA], [catB]) => {
        const indexA = preferredOrder.indexOf(catA);
        const indexB = preferredOrder.indexOf(catB);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return catA.localeCompare(catB);
    });

  }, [searchTerm]);

  return (
    <Card className="h-full w-72 flex flex-col rounded-none border-r border-panel-border shadow-md">
      <CardHeader className="p-4 border-b border-panel-border">
        <CardTitle className="text-lg font-headline text-primary">Components</CardTitle>
      </CardHeader>
      <div className="p-2 border-b border-panel-border">
        <Input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 text-sm"
        />
      </div>
      <ScrollArea className="flex-grow">
        <CardContent className="p-0">
          {categorizedComponents.length === 0 && searchTerm && (
            <p className="p-4 text-sm text-muted-foreground text-center">No components found.</p>
          )}
          {categorizedComponents.map(([categoryName, componentsInCategory]) => (
            <div key={categoryName} className="pt-3 pb-1 px-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2 tracking-wider">{categoryName}</h3>
              <div className="grid grid-cols-2 gap-2">
                {componentsInCategory.map((comp) => (
                  <div
                    key={comp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, comp.id)}
                    className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-md border border-transparent",
                        "hover:border-primary hover:bg-accent/50 cursor-grab transition-all duration-150 group aspect-square"
                    )}
                    title={`Drag to add ${comp.name}`}
                  >
                    <comp.icon className="h-6 w-6 mb-1.5 text-primary group-hover:text-accent-foreground transition-colors" />
                    <span className="text-[11px] font-medium text-center text-foreground group-hover:text-accent-foreground transition-colors leading-tight">
                      {comp.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ComponentLibraryPanel;
