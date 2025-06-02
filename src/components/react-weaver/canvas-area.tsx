
"use client";
import React, { useRef, useCallback, useEffect } from 'react';
import { useDesign } from '@/contexts/design-context';
import CanvasItemRenderer from './canvas-item-renderer';
import { GRID_SIZE } from './available-components';
import { cn } from '@/lib/utils';

const CanvasArea: React.FC = () => {
  const { components, addComponent, selectComponent, canvasSize, setCanvasSize } = useDesign();
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, [setCanvasSize]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const componentType = event.dataTransfer.getData('application/react-weaver-component');
    if (componentType && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - canvasRect.left;
      const y = event.clientY - canvasRect.top;
      addComponent(componentType, { x, y });
    }
  }, [addComponent]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = 'move';
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // If clicked directly on canvas (not on a component item), deselect.
    if (event.target === canvasRef.current) {
      selectComponent(null);
    }
  };
  
  const gridStyle = {
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    minWidth: '100%',
    minHeight: '100%',
    backgroundImage: `
      linear-gradient(to right, hsl(var(--border)/0.5) 1px, transparent 1px),
      linear-gradient(to bottom, hsl(var(--border)/0.5) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };

  return (
    <div className="flex-grow bg-canvas-background overflow-auto p-4 relative h-full">
      <div
        ref={canvasRef}
        className="relative shadow-inner bg-background"
        style={gridStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleCanvasClick}
      >
        {components.map((comp) => (
          <CanvasItemRenderer key={comp.id} component={comp} />
        ))}
      </div>
    </div>
  );
};

export default CanvasArea;
