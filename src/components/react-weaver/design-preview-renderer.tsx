
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

// This function is a simplified version of renderComponent from CanvasItemRenderer
// It's focused purely on rendering the component's visual aspect.
const renderPreviewComponent = (component: CanvasComponent) => {
  const { type, props } = component;
  // Props passed to components here should not include interactive editing-related attributes
  // like `id` if they are not meant to be part of the final rendered component's DOM attributes.
  // However, for keying and basic rendering, `id` is fine for now.
  const commonProps = { ...props }; 

  switch (type) {
    case 'button':
      return <Button {...commonProps}>{props.children || 'Button'}</Button>;
    case 'input':
      return <Input {...commonProps} className={cn("w-full h-full", props.className)} readOnly />;
    case 'text':
      return <p {...commonProps} className={cn("p-1", props.className)}>{props.children || 'Text Block'}</p>;
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
      return <img src={props.src} alt={props.alt} {...commonProps} className={cn("w-full h-full object-contain", props.className)} data-ai-hint={props['data-ai-hint']} />;
    case 'checkbox':
        return (
            <div className="flex items-center space-x-2 p-1">
                <Checkbox id={`${component.id}-preview-checkbox`} checked={props.checked} {...commonProps} disabled />
                <label htmlFor={`${component.id}-preview-checkbox`} className="text-sm font-medium leading-none">
                    {props.label || "Checkbox"}
                </label>
            </div>
        );
    case 'switch':
        return (
             <div className="flex items-center space-x-2 p-1">
                <Switch id={`${component.id}-preview-switch`} checked={props.checked} {...commonProps} disabled />
                <label htmlFor={`${component.id}-preview-switch`}>{props.label || "Toggle"}</label>
            </div>
        );
    case 'placeholder':
        return <div className={cn("w-full h-full bg-muted/50 border border-dashed border-foreground/30 flex items-center justify-center text-muted-foreground", props.className)}>{props.text || "Placeholder"}</div>;
    default:
      return <div className="w-full h-full bg-destructive/20 border border-destructive text-destructive-foreground flex items-center justify-center p-2">Unknown component: {type}</div>;
  }
};

const DesignPreviewRenderer: React.FC = () => {
  const { components, canvasSize } = useDesign();

  const previewContainerStyle: React.CSSProperties = {
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    // Ensuring the preview area itself is visible and scrollable if content exceeds viewport
    minWidth: '100%', 
    minHeight: '100%',
    position: 'relative',
    backgroundColor: 'hsl(var(--background))', // Use theme background
    boxShadow: '0 0 10px rgba(0,0,0,0.1)', // Optional: subtle shadow for the "page"
    margin: 'auto', // Center the preview area if smaller than tab content
  };

  return (
    <ScrollArea className="w-full h-full bg-muted/20">
        <div style={previewContainerStyle} className="overflow-auto">
            {components.map((comp) => (
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
                className="pointer-events-none" // Prevent interaction with elements in preview if not desired
            >
                {renderPreviewComponent(comp)}
            </div>
            ))}
        </div>
    </ScrollArea>
  );
};

export default DesignPreviewRenderer;
