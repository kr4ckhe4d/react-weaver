
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

// Import new ShadCN components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Import Custom Components
import ExampleCounter from '@/custom-components/ExampleCounter';

// Map of custom components for dynamic rendering
const CustomComponentMap: Record<string, React.FC<any>> = {
  'custom_ExampleCounter': ExampleCounter,
};


interface CanvasItemRendererProps {
  component: CanvasComponent;
}

const CanvasItemRendererInner: React.FC<CanvasItemRendererProps & { designContext: ReturnType<typeof useDesign> }> = ({ component, designContext }) => {
  const { type, props, children } = component;
  const commonProps = { id: component.id, ...props };
  const { addComponent, selectComponent: contextSelectComponent } = designContext;

  const handleDropOnContainer = (event: React.DragEvent<HTMLDivElement>, containerId: string) => {
    event.preventDefault();
    event.stopPropagation(); 
    const componentType = event.dataTransfer.getData('application/react-weaver-component');
    const target = event.currentTarget as HTMLElement; 
    const rect = target.getBoundingClientRect();
    
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
  
  if (type.startsWith('custom_')) {
    const CustomComp = CustomComponentMap[type];
    if (CustomComp) {
      // For custom components, we pass all props directly.
      // The custom component itself should handle its props.
      return <CustomComp {...commonProps} />;
    }
    return <div className="w-full h-full bg-destructive/20 border border-destructive text-destructive-foreground flex items-center justify-center p-2">Unknown custom component: {type}</div>;
  }

  switch (type) {
    case 'button':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onClickAction, ...buttonRenderProps } = commonProps;
      return <Button {...buttonRenderProps}>{props.children || 'Button'}</Button>;
    case 'input':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceInput, ...inputRenderProps } = commonProps;
      return <Input {...inputRenderProps} className={cn("w-full h-full", props.className)} />;
    case 'text':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { textAlign, fontWeight, fontSize, customTextColor, customBackgroundColor, className: userClassName, ...textRenderProps } = commonProps;
      const style: React.CSSProperties = {};
      if (customTextColor) style.color = customTextColor;
      if (customBackgroundColor) style.backgroundColor = customBackgroundColor;

      const textClasses: string[] = [];
      if (textAlign) textClasses.push(`text-${textAlign}`);
      if (fontWeight && fontWeight !== 'normal') textClasses.push(`font-${fontWeight}`);
      if (fontSize) textClasses.push(fontSize);
      
      return <p {...textRenderProps} style={style} className={cn("p-1 select-none", ...textClasses, userClassName)}>{props.children || 'Text Block'}</p>;
    case 'card':
      return (
        <ShadCard {...commonProps} className={cn("w-full h-full overflow-hidden flex flex-col", props.className)}>
          <ShadCardHeader>
            <ShadCardTitle>{props.title || 'Card Title'}</ShadCardTitle>
            {props.description && <ShadCardDescription>{props.description}</ShadCardDescription>}
          </ShadCardHeader>
          <ShadCardContent 
            className="flex-grow relative p-2" // Added padding for children
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { valueSource: _valueSourceCheckbox, ...checkboxRenderProps } = commonProps;
        return (
            <div className="flex items-center space-x-2 p-1">
                <Checkbox id={`${component.id}-checkbox`} checked={props.checked} {...checkboxRenderProps} />
                <label htmlFor={`${component.id}-checkbox`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {props.label || "Checkbox"}
                </label>
            </div>
        );
    case 'switch':
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { valueSource: _valueSourceSwitch, ...switchRenderProps } = commonProps;
        return (
             <div className="flex items-center space-x-2 p-1">
                <Switch id={`${component.id}-switch`} checked={props.checked} {...switchRenderProps} />
                <label htmlFor={`${component.id}-switch`}>{props.label || "Toggle"}</label>
            </div>
        );
    case 'placeholder':
        return <div className={cn("w-full h-full bg-muted/50 border border-dashed border-foreground/30 flex items-center justify-center text-muted-foreground", props.className)}>{props.text || "Placeholder"}</div>;
    case 'accordion':
      return (
        <Accordion type={props.type} collapsible={props.collapsible} className={cn("w-full", props.className)} {...commonProps}>
          {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
            <AccordionItem value={item.value || `item-${index}`} key={item.value || `item-${index}`}>
              <AccordionTrigger>{item.title || 'Accordion Title'}</AccordionTrigger>
              <AccordionContent>{item.content || 'Accordion content.'}</AccordionContent>
            </AccordionItem>
          )) : <AccordionItem value="default-item"><AccordionTrigger>Default Title</AccordionTrigger><AccordionContent>Default Content</AccordionContent></AccordionItem>}
        </Accordion>
      );
    case 'alert':
      return (
        <Alert variant={props.variant} className={cn("w-full", props.className)} {...commonProps}>
          {props.title && <AlertTitle>{props.title}</AlertTitle>}
          {props.description && <AlertDescription>{props.description}</AlertDescription>}
        </Alert>
      );
    case 'avatar':
      return (
        <Avatar className={cn(props.className)} {...commonProps}>
          <AvatarImage src={props.src} alt={props.alt || "Avatar"} />
          <AvatarFallback>{props.fallback || 'AV'}</AvatarFallback>
        </Avatar>
      );
    case 'badge':
      return <Badge variant={props.variant} className={cn(props.className)} {...commonProps}>{props.children || 'Badge'}</Badge>;
    case 'label':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceLabel, ...labelRenderProps } = commonProps;
      return <Label className={cn("p-1", props.className)} {...labelRenderProps}>{props.children || 'Label'}</Label>;
    case 'progress':
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceProgress, value: _staticValue, ...progressRenderProps } = commonProps;
      return <Progress value={props.value} {...progressRenderProps} className={cn("w-full", props.className)} />;
    case 'radioGroup':
      return (
        <RadioGroup defaultValue={props.defaultValue} className={cn("p-2 space-y-2", props.className)} {...commonProps}>
          {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
            <div className="flex items-center space-x-2" key={item.value || `radio-${index}`}>
              <RadioGroupItem value={item.value || `radio-${index}`} id={`${component.id}-${item.value || `radio-${index}`}`} />
              <Label htmlFor={`${component.id}-${item.value || `radio-${index}`}`}>{item.label || 'Option'}</Label>
            </div>
          )) : <div className="flex items-center space-x-2"><RadioGroupItem value="default" id={`${component.id}-default`} /><Label htmlFor={`${component.id}-default`}>Default Option</Label></div>}
        </RadioGroup>
      );
    case 'scrollArea':
      return (
        <ScrollArea className={cn("w-full h-full border rounded-md", props.className)} {...commonProps}
            onDrop={(e) => handleDropOnContainer(e, component.id)}
            onDragOver={handleDragOverContainer}
        >
            <div className="p-2 relative min-h-full"> {/* Added relative and min-h-full */}
                {(!children || children.length === 0) && (props.contentPlaceholder || 'Scrollable Content Area')}
                {children && children.map(child => (
                    <CanvasItemRenderer key={child.id} component={child} />
                ))}
            </div>
        </ScrollArea>
      );
    case 'select':
      return (
        <Select value={props.value} onValueChange={() => {}} {...commonProps}>
          <SelectTrigger className={cn("w-full", props.className)}>
            <SelectValue placeholder={props.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
              <SelectItem value={item.value || `select-${index}`} key={item.value || `select-${index}`}>
                {item.label || 'Option'}
              </SelectItem>
            )) : <SelectItem value="default">Default Option</SelectItem>}
          </SelectContent>
        </Select>
      );
    case 'separator':
      return <Separator orientation={props.orientation} className={cn(props.className)} {...commonProps} />;
    case 'skeleton':
      return <Skeleton className={cn("w-full h-full", props.className)} {...commonProps} />; // Skeleton fills the resizable box
    case 'table':
      return (
        <Table className={cn("w-full", props.className)} {...commonProps}>
          {props.caption && <TableCaption>{props.caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {(props.headers && Array.isArray(props.headers)) ? props.headers.map((header: string, index: number) => (
                <TableHead key={`header-${index}`}>{header}</TableHead>
              )) : <TableHead>Header</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(props.rows && Array.isArray(props.rows)) ? props.rows.map((row: string[], rowIndex: number) => (
              <TableRow key={`row-${rowIndex}`}>
                {Array.isArray(row) ? row.map((cell: string, cellIndex: number) => (
                  <TableCell key={`cell-${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                )) : <TableCell>Cell</TableCell>}
              </TableRow>
            )) : <TableRow><TableCell>Data</TableCell></TableRow>}
          </TableBody>
        </Table>
      );
    case 'tabs':
        return (
            <Tabs defaultValue={props.defaultValue} className={cn("w-full", props.className)} {...commonProps}>
                <TabsList>
                    {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
                        <TabsTrigger value={item.value || `tab-${index}`} key={item.value || `tab-${index}`}>
                            {item.title || 'Tab'}
                        </TabsTrigger>
                    )) : <TabsTrigger value="default-tab">Default Tab</TabsTrigger>}
                </TabsList>
                {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
                    <TabsContent value={item.value || `tab-${index}`} key={`content-${item.value || `tab-${index}`}`} className="p-2">
                        {item.content || 'Tab content.'}
                    </TabsContent>
                )) : <TabsContent value="default-tab" className="p-2">Default Content</TabsContent>}
            </Tabs>
        );
    case 'textarea':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceTextarea, ...textareaRenderProps } = commonProps;
      return <Textarea placeholder={props.placeholder} className={cn("w-full h-full", props.className)} {...textareaRenderProps} />;
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
  const minWidth = componentConfig?.defaultSize.width ? Math.max(GRID_SIZE, componentConfig.defaultSize.width / 4) : GRID_SIZE; 
  const minHeight = componentConfig?.defaultSize.height ? Math.max(GRID_SIZE, componentConfig.defaultSize.height / 4) : GRID_SIZE; 

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = e.target as HTMLElement;

    if (targetElement.closest('.react-resizable-handle')) {
      return; 
    }
    
    // Allow interaction with inner elements of custom components
    const isCustomComponent = component.type.startsWith('custom_');
    if (isCustomComponent) {
       const interactiveParentInCustom = targetElement.closest('button, input, textarea, select, [role="button"], [role="tab"], [role="radio"]');
       if (interactiveParentInCustom) {
           if (!isSelected) {
             selectComponent(component.id);
             if (!component.parentId) bringToFront(component.id);
           }
           // Do not preventDefault or stopPropagation if an interactive child within a custom component was clicked
           return;
       }
    }


    const interactiveParent = targetElement.closest('button, input, textarea, select, [role="button"], [role="tab"], [role="radio"]');
    const componentRootElement = targetElement.closest<HTMLElement>('[data-component-id]');

    if (interactiveParent && componentRootElement && interactiveParent !== componentRootElement && componentRootElement.dataset.componentId === component.id) {
        if (!isSelected) {
          selectComponent(component.id);
          if (!component.parentId) bringToFront(component.id);
        }
        // Do not preventDefault or stopPropagation if an interactive child was clicked
        return;
    }
    
    if (componentRootElement && componentRootElement.dataset.componentId !== component.id) {
      return; 
    }

    e.preventDefault(); 
    e.stopPropagation(); 

    selectComponent(component.id);
    if (!component.parentId) { 
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
      }, component.parentId);
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
    zIndex: component.parentId ? 'auto' : component.zIndex, 
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
                "transition-opacity duration-150 z-30" 
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
            className="relative w-full h-full outline-none bg-background"
            style={{cursor: isDragging ? 'grabbing' : 'grab'}} 
            onMouseDown={handleMouseDown} 
            onClick={(e) => {
                const targetElement = e.target as HTMLElement;

                if (targetElement.closest('.react-resizable-handle')) {
                    return;
                }

                const isCustomComponentInnerClick = component.type.startsWith('custom_') && targetElement.closest('button, input, textarea, select');
                if (isCustomComponentInnerClick) {
                     if (component.id !== selectedComponentId) {
                        selectComponent(component.id);
                        if (!component.parentId) bringToFront(component.id);
                    }
                    return; // Don't propagate if it's an interactive element inside a custom component
                }
                
                const clickedComponentElement = targetElement.closest<HTMLElement>('[data-component-id]');
                
                const interactiveChild = targetElement.closest('button, input, textarea, select, [role="button"], [role="tab"], [role="radio"]');
                if (interactiveChild && clickedComponentElement && interactiveChild !== clickedComponentElement && clickedComponentElement.dataset.componentId === component.id) {
                    if (component.id !== selectedComponentId) {
                        selectComponent(component.id);
                         if (!component.parentId) bringToFront(component.id);
                    }
                    return;
                }
                
                if (clickedComponentElement && clickedComponentElement.dataset.componentId !== component.id) {
                    return;
                }
                
                e.stopPropagation(); 
                selectComponent(component.id); 
                if (!component.parentId) {
                    bringToFront(component.id);
                }
            }}
            data-component-id={component.id}
            data-selected={isSelected}
        >
            <div className={cn("w-full h-full", isDragging ? "pointer-events-none select-none" : "")}>
              <CanvasItemRendererInner component={component} designContext={designContext} />
            </div>
            
            {isSelected && (
            <>
                <div 
                    className="absolute -top-3 -left-3 p-0.5 bg-primary text-primary-foreground rounded-full cursor-grab active:cursor-grabbing shadow-lg opacity-0 group-hover/canvas-item:opacity-100 group-data-[selected=true]/canvas-item:opacity-100 transition-opacity z-20"
                    title="Move"
                >
                    <IconMove size={14} />
                </div>
                <button
                    className="absolute -top-3 -right-3 p-0.5 bg-destructive text-destructive-foreground rounded-full cursor-pointer shadow-lg opacity-0 group-hover/canvas-item:opacity-100 group-data-[selected=true]/canvas-item:opacity-100 transition-opacity z-20"
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
