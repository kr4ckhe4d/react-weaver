
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
import 'react-resizable/css/styles.css';
import { IconMove, IconTrash } from './icons';
import { cn } from '@/lib/utils';

interface CanvasItemRendererProps {
  component: CanvasComponent;
}

const CanvasItemRendererInner: React.FC<CanvasItemRendererProps & { designContext: ReturnType<typeof useDesign> }> = ({ component, designContext }) => {
  const { type, props, children } = component;
  const commonProps = { id: component.id, ...props };
  const { addComponent, selectComponent: contextSelectComponent } = designContext;

  const handleDropOnContainer = (event: React.DragEvent<HTMLDivElement>, containerId: string) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent drop from bubbling to main canvas if it's a nested drop
    const componentType = event.dataTransfer.getData('application/react-weaver-component');
    const target = event.currentTarget as HTMLElement; // The drop target (e.g., CardContent)
    const rect = target.getBoundingClientRect();
    
    // Calculate position relative to the drop target element
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (componentType) {
      addComponent(componentType, { x, y }, containerId);
    }
  };

  const handleDragOverContainer = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.stopPropagation();
  };
  
  // A simple mapping from type to actual component rendering logic
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
          <ShadCardContent 
            className="flex-grow relative" // Added relative for child positioning
            onDrop={(e) => handleDropOnContainer(e, component.id)}
            onDragOver={handleDragOverContainer}
          >
            {(!children || children.length === 0) && (props.content || 'Card Content')}
            {children && children.map(child => (
              <CanvasItemRenderer key={child.id} component={child} />
            ))}
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
  const designContext = useDesign();
  const { selectedComponentId, selectComponent, updateComponentPosition, updateComponentSize, deleteComponent, bringToFront } = designContext;
  const isSelected = component.id === selectedComponentId;
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const itemStartPos = useRef({ x: 0, y: 0 });

  const componentConfig = getComponentConfig(component.type);
  const minWidth = componentConfig?.defaultSize.width ? Math.max(GRID_SIZE, componentConfig.defaultSize.width / 2) : GRID_SIZE;
  const minHeight = componentConfig?.defaultSize.height ? Math.max(GRID_SIZE, componentConfig.defaultSize.height / 2) : GRID_SIZE;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.react-resizable-handle') || (e.target as HTMLElement).closest('button, input, textarea, select') || (e.target as HTMLElement).closest('[data-component-id] [data-component-id]') ) { // Prevent drag if clicking on child or controls
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    selectComponent(component.id);
    if (!component.parentId) { // Only bring top-level components to front
        bringToFront(component.id);
    }
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
      }, component.parentId); // Pass parentId for context
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
  }, [isDragging, isSelected, component.id, component.parentId, updateComponentPosition]);


  const onResize: ResizableBoxProps['onResize'] = (event, { size }) => {
    updateComponentSize(component.id, { width: size.width, height: size.height }, component.parentId);
  };
  
  const onResizeStop: ResizableBoxProps['onResizeStop'] = (event, { size }) => {
    updateComponentSize(component.id, { width: size.width, height: size.height }, component.parentId);
    selectComponent(component.id);
     if (!component.parentId) {
        bringToFront(component.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComponent(component.id, component.parentId);
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
    zIndex: component.parentId ? 'auto' : component.zIndex, // Children z-index is managed by parent
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
        draggableOpts={{ grid: [GRID_SIZE, GRID_SIZE], disabled: true }}
        className={cn(
            "absolute group/canvas-item",
            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-canvas-background shadow-2xl",
            "transition-shadow duration-150 ease-in-out"
        )}
        style={{...wrapperStyle, cursor: 'default'}}
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
            className="relative w-full h-full outline-none bg-background" // Added bg-background for children visibility
            onMouseDown={handleMouseDown}
            onClick={(e) => { e.stopPropagation(); selectComponent(component.id); if (!component.parentId) bringToFront(component.id);}}
            data-component-id={component.id}
            data-selected={isSelected}
        >
            <div className={cn("w-full h-full", isDragging ? "pointer-events-none select-none" : "")}>
              <CanvasItemRendererInner component={component} designContext={designContext} />
            </div>
            
            {isSelected && (
            <>
                <div 
                    className="absolute -top-3 -left-3 p-0.5 bg-primary text-primary-foreground rounded-full cursor-grab active:cursor-grabbing shadow-lg opacity-0 group-hover/canvas-item:opacity-100 transition-opacity"
                    title="Move"
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
