
"use client";
import React from 'react';
import type { CanvasComponent } from '@/types';
import { useDesign } from '@/contexts/design-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card as ShadCard, CardHeader as ShadCardHeader, CardTitle as ShadCardTitle, CardDescription as ShadCardDescription, CardContent as ShadCardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const renderPreviewComponent = (component: CanvasComponent): JSX.Element | null => {
  const { type, props, children } = component;
  const commonProps = { ...props }; 

  // Common style for absolutely positioned children within a container
  const childStyle: React.CSSProperties = component.parentId ? {
    position: 'absolute',
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
  } : {};


  switch (type) {
    case 'button':
      return <Button {...commonProps} style={childStyle}>{props.children || 'Button'}</Button>;
    case 'input':
      return <Input {...commonProps} className={cn("w-full h-full", props.className)} style={childStyle} readOnly={false} />;
    case 'text':
      return <p {...commonProps} className={cn("p-1", props.className)} style={childStyle}>{props.children || 'Text Block'}</p>;
    case 'card':
      return (
        <ShadCard {...commonProps} className={cn("w-full h-full overflow-hidden flex flex-col", props.className)} style={childStyle}>
          <ShadCardHeader>
            <ShadCardTitle>{props.title || 'Card Title'}</ShadCardTitle>
            {props.description && <ShadCardDescription>{props.description}</ShadCardDescription>}
          </ShadCardHeader>
          <ShadCardContent className="flex-grow relative"> {/* Added relative for child positioning */}
            {(!children || children.length === 0) && (props.content || 'Card Content')}
            {children && children.map(child => (
                <div key={`preview-child-${child.id}`} style={{position: 'absolute', left: child.x, top: child.y, width: child.width, height: child.height}}>
                    {renderPreviewComponent(child)}
                </div>
            ))}
          </ShadCardContent>
        </ShadCard>
      );
    case 'image':
      return <img src={props.src} alt={props.alt} {...commonProps} className={cn("w-full h-full object-contain", props.className)} style={childStyle} data-ai-hint={props['data-ai-hint']} />;
    case 'checkbox':
        return (
            <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Checkbox id={`${component.id}-preview-checkbox`} checked={props.checked} {...commonProps} disabled={false} />
                <label htmlFor={`${component.id}-preview-checkbox`} className="text-sm font-medium leading-none">
                    {props.label || "Checkbox"}
                </label>
            </div>
        );
    case 'switch':
        return (
             <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Switch id={`${component.id}-preview-switch`} checked={props.checked} {...commonProps} disabled={false} />
                <label htmlFor={`${component.id}-preview-switch`}>{props.label || "Toggle"}</label>
            </div>
        );
    case 'placeholder':
        return <div className={cn("w-full h-full bg-muted/50 border border-dashed border-foreground/30 flex items-center justify-center text-muted-foreground", props.className)} style={childStyle}>{props.text || "Placeholder"}</div>;
    default:
      return <div className="w-full h-full bg-destructive/20 border border-destructive text-destructive-foreground flex items-center justify-center p-2" style={childStyle}>Unknown component: {type}</div>;
  }
};

const DesignPreviewRenderer: React.FC = () => {
  const { components, canvasSize } = useDesign();

  const previewContainerStyle: React.CSSProperties = {
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    position: 'relative',
    backgroundColor: 'hsl(var(--background))', 
    boxShadow: '0 0 10px rgba(0,0,0,0.1)', 
    margin: 'auto', // Centers the canvas if ScrollArea is larger
  };

  return (
    <ScrollArea className="w-full h-full bg-muted/20"> 
        <div style={previewContainerStyle}>
            {components.filter(c => !c.parentId) // Only render top-level components directly
            .sort((a,b) => a.zIndex - b.zIndex)
            .map((comp) => (
            <div
                key={`preview-${comp.id}`}
                style={{
                position: 'absolute',
                left: comp.x,
                top: comp.y,
                width: comp.width,
                height: comp.height,
                zIndex: comp.zIndex,
                }}
            >
                {renderPreviewComponent(comp)}
            </div>
            ))}
        </div>
    </ScrollArea>
  );
};

export default DesignPreviewRenderer;
