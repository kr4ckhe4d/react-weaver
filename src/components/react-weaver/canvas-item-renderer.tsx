
"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { CanvasComponent } from '@/types';
import { useDesign } from '@/contexts/design-context';
import { getComponentConfig, GRID_SIZE } from './available-components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card as ShadCard, CardHeader as ShadCardHeader, CardTitle as ShadCardTitle, CardDescription as ShadCardDescription, CardContent as ShadCardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ResizableBox, type ResizableBoxProps } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Import react-resizable styles
import { IconMove, IconMaximize, IconTrash } from './icons';
import { cn } from '@/lib/utils';

interface CanvasItemRendererProps {
  component: CanvasComponent;
}

// A simple mapping from type to actual component rendering logic
const renderComponent = (component: CanvasComponent) => {
  const { type, props } = component;
  const commonProps = { id: component.id, ...props }; // Pass ID for DOM if needed

  switch (type) {
    case 'button':
      return <Button {...commonProps}>{props.children || 'Button'}</Button>;
    case 'input':
      return <Input {...commonProps} className={cn("w-full h-full", props.className)} />;
    case 'text':
      return <p {...commonProps} className={cn("p-1 select-none", props.className)}>{props.children || 'Text Block'}</p>;
    case 'card':
      return (
        <ShadCard {...commonProps} className={cn("w-full h-full overflow-hidden flex flex-col", props.className)}>
          <ShadCardHeader>
            <ShadCardTitle>{props.title || 'Card Title'}</ShadCardTitle>
            {props.description && <ShadCardDescription>{props.description}</ShadCardDescription>}
          </ShadCardHeader>
          <ShadCardContent className="flex-grow">
            <p>{props.content || 'Card Content'}</p>
          </ShadCardContent>
        </ShadCard>
      );
    case 'image':
      return <img src={props.src} alt={props.alt} {...commonProps} className={cn("w-full h-full object-contain", props.className)} data-ai-hint={props['data-ai-hint']}/>;
    case 'checkbox':
        return (
            <div className="flex items-center space-x-2 p-1">
                <Checkbox id={`${component.id}-checkbox`} checked={props.checked} {...commonProps} />
                <label htmlFor={`${component.id}-checkbox`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {props.label || "Checkbox"}
                </label>
            </div>
        );
    case 'switch':
        return (
             <div className="flex items-center space-x-2 p-1">
                <Switch id={`${component.id}-switch`} checked={props.checked} {...commonProps} />
                <label htmlFor={`${component.id}-switch`}>{props.label || "Toggle"}</label>
            </div>
        );
    case 'placeholder':
        return <div className={cn("w-full h-full bg-muted/50 border border-dashed border-foreground/30 flex items-center justify-center text-muted-foreground", props.className)}>{props.text || "Placeholder"}</div>;
    default:
      return <div className="w-full h-full bg-destructive/20 border border-destructive text-destructive-foreground flex items-center justify-center p-2">Unknown component: {type}</div>;
  }
};


const CanvasItemRenderer: React.FC<CanvasItemRendererProps> = ({ component }) => {
  const { selectedComponentId, selectComponent, updateComponentPosition, updateComponentSize, deleteComponent, bringToFront } = useDesign();
  const isSelected = component.id === selectedComponentId;
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const itemStartPos = useRef({ x: 0, y: 0 });

  const componentConfig = getComponentConfig(component.type);
  const minWidth = componentConfig?.defaultSize.width ? Math.max(GRID_SIZE, componentConfig.defaultSize.width / 2) : GRID_SIZE;
  const minHeight = componentConfig?.defaultSize.height ? Math.max(GRID_SIZE, componentConfig.defaultSize.height / 2) : GRID_SIZE;


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent drag from starting if clicking on resize handle or other interactive elements within the component
    if ((e.target as HTMLElement).closest('.react-resizable-handle') || (e.target as HTMLElement).closest('button, input, textarea, select')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    selectComponent(component.id);
    bringToFront(component.id);
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    itemStartPos.current = { x: component.x, y: component.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !isSelected) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      updateComponentPosition(component.id, {
        x: itemStartPos.current.x + dx,
        y: itemStartPos.current.y + dy,
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isSelected, component.id, updateComponentPosition]);


  const onResize: ResizableBoxProps['onResize'] = (event, { size }) => {
    updateComponentSize(component.id, { width: size.width, height: size.height });
  };
  
  const onResizeStop: ResizableBoxProps['onResizeStop'] = (event, { size }) => {
    updateComponentSize(component.id, { width: size.width, height: size.height });
     // Ensure selection and bring to front on resize interaction
    selectComponent(component.id);
    bringToFront(component.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComponent(component.id);
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
    zIndex: component.zIndex,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <ResizableBox
        width={component.width}
        height={component.height}
        minConstraints={[minWidth, minHeight]}
        maxConstraints={[Infinity, Infinity]}
        onResize={onResize}
        onResizeStop={onResizeStop}
        draggableOpts={{ grid: [GRID_SIZE, GRID_SIZE], disabled: true }} // Disable ResizableBox's own drag
        className={cn(
            "absolute group/canvas-item",
            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-canvas-background shadow-2xl",
            "transition-shadow duration-150 ease-in-out"
        )}
        style={{...wrapperStyle, cursor: 'default'}} // Override cursor for ResizableBox itself
        handle={(handleAxis, ref) => (
            <div
            ref={ref}
            className={cn(
                `react-resizable-handle react-resizable-handle-${handleAxis}`,
                "bg-primary/80 opacity-0 group-hover/canvas-item:opacity-100 group-data-[selected=true]/canvas-item:opacity-100",
                "transition-opacity duration-150"
            )}
            style={{
                width: '10px', height: '10px',
                position: 'absolute',
                ...(handleAxis === 's' && { bottom: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' }),
                ...(handleAxis === 'w' && { top: '50%', left: '-5px', transform: 'translateY(-50%)', cursor: 'w-resize' }),
                ...(handleAxis === 'e' && { top: '50%', right: '-5px', transform: 'translateY(-50%)', cursor: 'e-resize' }),
                ...(handleAxis === 'n' && { top: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' }),
                ...(handleAxis === 'sw' && { bottom: '-5px', left: '-5px', cursor: 'sw-resize' }),
                ...(handleAxis === 'se' && { bottom: '-5px', right: '-5px', cursor: 'se-resize' }),
                ...(handleAxis === 'nw' && { top: '-5px', left: '-5px', cursor: 'nw-resize' }),
                ...(handleAxis === 'ne' && { top: '-5px', right: '-5px', cursor: 'ne-resize' }),
            }}
            />
        )}
        >
        <div 
            className="relative w-full h-full outline-none"
            onMouseDown={handleMouseDown}
            onClick={(e) => { e.stopPropagation(); selectComponent(component.id); bringToFront(component.id);}} // Ensure selection on click
            data-component-id={component.id}
            data-selected={isSelected}
        >
            {/* Render the actual component */}
            <div className="w-full h-full pointer-events-none select-none"> {/* Prevents interaction with inner elements during drag */}
              {renderComponent(component)}
            </div>
            
            {/* Controls for selected item */}
            {isSelected && (
            <>
                <div 
                    className="absolute -top-3 -left-3 p-0.5 bg-primary text-primary-foreground rounded-full cursor-grab active:cursor-grabbing shadow-lg opacity-0 group-hover/canvas-item:opacity-100 transition-opacity"
                    title="Move"
                    onMouseDown={(e) => { /* This is part of the larger drag area now */ }}
                >
                    <IconMove size={14} />
                </div>
                <button
                    className="absolute -top-3 -right-3 p-0.5 bg-destructive text-destructive-foreground rounded-full cursor-pointer shadow-lg opacity-0 group-hover/canvas-item:opacity-100 transition-opacity"
                    onClick={handleDelete}
                    title="Delete"
                >
                    <IconTrash size={14} />
                </button>
            </>
            )}
        </div>
    </ResizableBox>
  );
};

export default CanvasItemRenderer;
