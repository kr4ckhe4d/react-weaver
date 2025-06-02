
"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CanvasComponent } from '@/types';
import { useDesign } from '@/contexts/design-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card as ShadCard, CardHeader as ShadCardHeader, CardTitle as ShadCardTitle, CardDescription as ShadCardDescription, CardContent as ShadCardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getComponentConfig } from './available-components';

// Dynamically import actions for preview - this is a conceptual placeholder
// In a real Next.js app, direct imports work if files are in `app` or reachable.
// For a truly dynamic "plugin" system, a more robust solution would be needed.
import * as exampleActions from '@/app-logic/exampleActions';
// Import more modules from app-logic as needed or build a dynamic importer
// const appLogicModules: Record<string, any> = { exampleActions };

type AppLogicModules = Record<string, Record<string, (...args: any[]) => any>>;

const appLogicModules: AppLogicModules = {
  exampleActions,
  // Add other modules here if you create more files in src/app-logic
  // e.g., myOtherLogic: import * as myOtherLogic from '@/app-logic/myOtherLogic';
};


interface PreviewState {
  [key: string]: [any, React.Dispatch<React.SetStateAction<any>>];
}

const RenderPreviewComponentRecursive: React.FC<{ 
  component: CanvasComponent, 
  depth?: number,
  previewStates: PreviewState,
  allSetters: Record<string, React.Dispatch<React.SetStateAction<any>>>
}> = ({ component, depth = 0, previewStates, allSetters }) => {
  const { type, props, children, id } = component;
  let commonProps = { ...props }; 

  const childStyle: React.CSSProperties = component.parentId ? {
    position: 'absolute',
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
  } : {};

  // Get state for components that use valueSource
  let liveValue: any;
  let liveSetter: React.Dispatch<React.SetStateAction<any>> | undefined;

  if (props.valueSource && previewStates[props.valueSource]) {
    [liveValue, liveSetter] = previewStates[props.valueSource];
  } else {
    // Fallback for components not using valueSource or if state not initialized
    // This part handles local component state not driven by global `valueSource`
    switch (type) {
        case 'input': liveValue = props.value || ''; break;
        case 'textarea': liveValue = props.value || ''; break;
        case 'checkbox': liveValue = !!props.checked; break;
        case 'switch': liveValue = !!props.checked; break;
        // Add other component-specific default states if needed
    }
  }
  
  // State for interactive components NOT tied to valueSource (managed locally by each instance)
  const [accordionValue, setAccordionValue] = useState<string | string[] | undefined>(props.type === 'multiple' ? [] : props.defaultValue);
  const [radioValue, setRadioValue] = useState<string | undefined>(props.defaultValue);
  const [selectValue, setSelectValue] = useState<string | undefined>(props.value);
  const [tabsValue, setTabsValue] = useState<string | undefined>(props.defaultValue);
  
  // Local state for components that don't use valueSource or for their own internal changes
  const [localInputValue, setLocalInputValue] = useState<string>(props.value || '');
  const [localTextareaValue, setLocalTextareaValue] = useState<string>(props.value || '');
  const [localCheckboxChecked, setLocalCheckboxChecked] = useState<boolean>(!!props.checked);
  const [localSwitchChecked, setLocalSwitchChecked] = useState<boolean>(!!props.checked);


  const handleAction = async () => {
    if (!props.onClickAction) return;
    const actionString = props.onClickAction as string;

    if (actionString.includes('/')) {
      const [moduleName, funcName] = actionString.split('/');
      if (appLogicModules[moduleName] && typeof appLogicModules[moduleName][funcName] === 'function') {
        try {
          console.log(`Preview: Calling ${moduleName}/${funcName} with setters:`, allSetters);
          // Pass allSetters object to the function
          // For functions like setSpecificProgressValue that expect more args,
          // the user needs to create more specific functions in app-logic
          // or we need a way to configure these args in the editor.
          // For now, it primarily supports functions expecting only setters.
          await appLogicModules[moduleName][funcName](allSetters);
        } catch (error) {
          console.error(`Error executing action ${moduleName}/${funcName}:`, error);
          alert(`Error in action ${moduleName}/${funcName}: ${error}`);
        }
      } else {
        console.warn(`Preview: Action '${actionString}' not found or not a function.`);
        alert(`Action '${actionString}' not found.`);
      }
    } else {
       console.log(`Preview: Local action '${actionString}' would be triggered (not supported in this preview mode).`);
    }
  };


  switch (type) {
    case 'button':
      const { onClickAction, ...previewButtonProps } = commonProps;
      return <Button {...previewButtonProps} style={childStyle} onClick={handleAction}>{props.children || 'Button'}</Button>;
    case 'input':
      return <Input {...commonProps} value={props.valueSource ? liveValue : localInputValue} 
                onChange={(e) => props.valueSource && liveSetter ? liveSetter(e.target.value) : setLocalInputValue(e.target.value)} 
                className={cn("w-full h-full", props.className)} style={childStyle} />;
    case 'text':
      return <p {...commonProps} className={cn("p-1", props.className)} style={childStyle}>{props.children || 'Text Block'}</p>;
    case 'card':
      return (
        <ShadCard {...commonProps} className={cn("w-full h-full overflow-hidden flex flex-col", props.className)} style={childStyle}>
          <ShadCardHeader>
            <ShadCardTitle>{props.title || 'Card Title'}</ShadCardTitle>
            {props.description && <ShadCardDescription>{props.description}</ShadCardDescription>}
          </ShadCardHeader>
          <ShadCardContent className="flex-grow relative p-2">
            {(!children || children.length === 0) && (props.content || 'Card Content')}
            {children && children.map(child => (
                <RenderPreviewComponentRecursive key={`preview-child-${child.id}-${depth}`} component={child} depth={depth + 1} previewStates={previewStates} allSetters={allSetters}/>
            ))}
          </ShadCardContent>
        </ShadCard>
      );
    case 'image':
      return <img src={props.src} alt={props.alt} {...commonProps} className={cn("w-full h-full object-contain", props.className)} style={childStyle} data-ai-hint={props['data-ai-hint']} />;
    case 'checkbox':
        return (
            <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Checkbox id={`${id}-preview-checkbox`} 
                    checked={props.valueSource ? liveValue : localCheckboxChecked} 
                    onCheckedChange={(checked) => props.valueSource && liveSetter ? liveSetter(Boolean(checked)) : setLocalCheckboxChecked(Boolean(checked))} 
                    {...commonProps} />
                <label htmlFor={`${id}-preview-checkbox`} className="text-sm font-medium leading-none">
                    {props.label || "Checkbox"}
                </label>
            </div>
        );
    case 'switch':
        return (
             <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Switch id={`${id}-preview-switch`} 
                    checked={props.valueSource ? liveValue : localSwitchChecked} 
                    onCheckedChange={(checked) => props.valueSource && liveSetter ? liveSetter(checked) : setLocalSwitchChecked(checked)} 
                    {...commonProps} />
                <label htmlFor={`${id}-preview-switch`}>{props.label || "Toggle"}</label>
            </div>
        );
    case 'placeholder':
        return <div className={cn("w-full h-full bg-muted/50 border border-dashed border-foreground/30 flex items-center justify-center text-muted-foreground", props.className)} style={childStyle}>{props.text || "Placeholder"}</div>;
    
    case 'accordion':
      return (
        <Accordion type={props.type as "single" | "multiple"} collapsible={props.collapsible} value={accordionValue} onValueChange={setAccordionValue} className={cn("w-full", props.className)} style={childStyle} {...commonProps}>
          {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
            <AccordionItem value={item.value || `item-${index}`} key={`${id}-acc-item-${item.value || index}`}>
              <AccordionTrigger>{item.title || 'Accordion Title'}</AccordionTrigger>
              <AccordionContent>{item.content || 'Accordion content.'}</AccordionContent>
            </AccordionItem>
          )) : <AccordionItem value="default-item"><AccordionTrigger>Default Title</AccordionTrigger><AccordionContent>Default Content</AccordionContent></AccordionItem>}
        </Accordion>
      );
    case 'alert':
      return (
        <Alert variant={props.variant as "default" | "destructive"} className={cn("w-full", props.className)} style={childStyle} {...commonProps}>
          {props.title && <AlertTitle>{props.title}</AlertTitle>}
          {props.description && <AlertDescription>{props.description}</AlertDescription>}
        </Alert>
      );
    case 'avatar':
      return (
        <Avatar className={cn(props.className)} style={childStyle} {...commonProps}>
          <AvatarImage src={props.src} alt={props.alt || "Avatar"} />
          <AvatarFallback>{props.fallback || 'AV'}</AvatarFallback>
        </Avatar>
      );
    case 'badge':
      return <Badge variant={props.variant as "default" | "secondary" | "destructive" | "outline"} className={cn(props.className)} style={childStyle} {...commonProps}>{props.children || 'Badge'}</Badge>;
    case 'label':
      return <Label className={cn("p-1", props.className)} style={childStyle} {...commonProps}>{props.children || 'Label'}</Label>;
    case 'progress':
      const { valueSource, ...progressPreviewProps } = commonProps;
      const currentProgressValue = props.valueSource ? liveValue : props.value;
      return <Progress value={currentProgressValue} className={cn("w-full", props.className)} style={childStyle} {...progressPreviewProps} />;
    case 'radioGroup':
      return (
        <RadioGroup value={radioValue} onValueChange={setRadioValue} className={cn("p-2 space-y-2", props.className)} style={childStyle} {...commonProps}>
          {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
            <div className="flex items-center space-x-2" key={`${id}-radio-${item.value || index}`}>
              <RadioGroupItem value={item.value || `radio-${index}`} id={`${id}-preview-radio-${item.value || index}`} />
              <Label htmlFor={`${id}-preview-radio-${item.value || index}`}>{item.label || 'Option'}</Label>
            </div>
          )) : <div className="flex items-center space-x-2"><RadioGroupItem value="default" id={`${id}-preview-default`} /><Label htmlFor={`${id}-preview-default`}>Default Option</Label></div>}
        </RadioGroup>
      );
    case 'scrollArea':
      return (
        <ScrollArea className={cn("w-full h-full border rounded-md", props.className)} style={childStyle} {...commonProps}>
            <div className="p-2 relative min-h-full">
                {(!children || children.length === 0) && (props.contentPlaceholder || 'Scrollable Content Area')}
                {children && children.map(child => (
                     <RenderPreviewComponentRecursive key={`preview-child-${child.id}-${depth}`} component={child} depth={depth + 1} previewStates={previewStates} allSetters={allSetters}/>
                ))}
            </div>
        </ScrollArea>
      );
    case 'select':
      return (
        <Select value={selectValue} onValueChange={setSelectValue} {...commonProps}>
          <SelectTrigger className={cn("w-full", props.className)} style={childStyle}>
            <SelectValue placeholder={props.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
              <SelectItem value={item.value || `select-${index}`} key={`${id}-select-item-${item.value || index}`}>
                {item.label || 'Option'}
              </SelectItem>
            )) : <SelectItem value="default">Default Option</SelectItem>}
          </SelectContent>
        </Select>
      );
    case 'separator':
      return <Separator orientation={props.orientation as "horizontal" | "vertical"} className={cn(props.className)} style={childStyle} {...commonProps} />;
    case 'skeleton':
      return <Skeleton className={cn("w-full h-full", props.className)} style={childStyle} {...commonProps} />;
    case 'table':
      return (
        <Table className={cn("w-full", props.className)} style={childStyle} {...commonProps}>
          {props.caption && <TableCaption>{props.caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {(props.headers && Array.isArray(props.headers)) ? props.headers.map((header: string, index: number) => (
                <TableHead key={`${id}-header-${index}`}>{header}</TableHead>
              )) : <TableHead>Header</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(props.rows && Array.isArray(props.rows)) ? props.rows.map((row: string[], rowIndex: number) => (
              <TableRow key={`${id}-row-${rowIndex}`}>
                {Array.isArray(row) ? row.map((cell: string, cellIndex: number) => (
                  <TableCell key={`${id}-cell-${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                )) : <TableCell>Cell</TableCell>}
              </TableRow>
            )) : <TableRow><TableCell>Data</TableCell></TableRow>}
          </TableBody>
        </Table>
      );
    case 'tabs':
        return (
            <Tabs value={tabsValue} onValueChange={setTabsValue} defaultValue={props.defaultValue} className={cn("w-full", props.className)} style={childStyle} {...commonProps}>
                <TabsList>
                    {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
                        <TabsTrigger value={item.value || `tab-${index}`} key={`${id}-tab-trigger-${item.value || index}`}>
                            {item.title || 'Tab'}
                        </TabsTrigger>
                    )) : <TabsTrigger value="default-tab">Default Tab</TabsTrigger>}
                </TabsList>
                {(props.items && Array.isArray(props.items)) ? props.items.map((item: any, index: number) => (
                    <TabsContent value={item.value || `tab-${index}`} key={`${id}-tab-content-${item.value || index}`} className="p-2">
                        {item.content || 'Tab content.'}
                    </TabsContent>
                )) : <TabsContent value="default-tab" className="p-2">Default Content</TabsContent>}
            </Tabs>
        );
    case 'textarea':
      return <Textarea placeholder={props.placeholder} 
                 value={props.valueSource ? liveValue : localTextareaValue} 
                 onChange={(e) => props.valueSource && liveSetter ? liveSetter(e.target.value) : setLocalTextareaValue(e.target.value)} 
                 className={cn("w-full h-full", props.className)} style={childStyle} {...commonProps} />;
    default:
      return <div className="w-full h-full bg-destructive/20 border border-destructive text-destructive-foreground flex items-center justify-center p-2" style={childStyle}>Unknown component: {type}</div>;
  }
};

const DesignPreviewRenderer: React.FC = () => {
  const { components: designComponents, canvasSize } = useDesign();

  // Central state for all valueSource-driven states
  const [previewStates, setPreviewStates] = useState<PreviewState>({});
  const [allSetters, setAllSetters] = useState<Record<string, React.Dispatch<React.SetStateAction<any>>>>({});

  useEffect(() => {
    const newStates: PreviewState = {};
    const newSetters: Record<string, React.Dispatch<React.SetStateAction<any>>> = {};
    
    const allValueSources = new Set<string>();

    function collectValueSources(comps: CanvasComponent[]) {
      comps.forEach(comp => {
        if (comp.props.valueSource) {
          allValueSources.add(comp.props.valueSource);
        }
        if (comp.children) {
          collectValueSources(comp.children);
        }
      });
    }
    collectValueSources(designComponents);

    // Initialize states only if they don't exist
    // This is tricky because useState hook calls must be consistent.
    // For a dynamic number of states, a reducer or a single state object is better.
    // Let's manage them in a single object for now, and re-evaluate if needed.
    
    // This effect runs once to initialize states based on initial designComponents
    // A more robust solution might involve a context or reducer for these dynamic states
    // For simplicity here, we're initializing based on the *current* set of valueSources found.
    // If valueSources are added/removed dynamically, this initialization might need to be more clever.

  }, [designComponents]); // Rerun if designComponents change to potentially add new valueSources

  // This is where we'll actually create the states using useState.
  // The challenge is that useState calls must be in the same order and count.
  // We'll create a memoized list of unique value sources and then create states for them.

  const uniqueValueSources = useMemo(() => {
    const sources = new Set<string>();
    function collect(comps: CanvasComponent[]) {
      comps.forEach(comp => {
        if (comp.props.valueSource) sources.add(comp.props.valueSource);
        if (comp.children) collect(comp.children);
      });
    }
    collect(designComponents);
    return Array.from(sources);
  }, [designComponents]);

  // Temporary any to manage dynamic state creation, ideally use a reducer.
  const statesManager: Record<string, [any, React.Dispatch<React.SetStateAction<any>>]> = {};
  const settersForActions: Record<string, React.Dispatch<React.SetStateAction<any>>> = {};

  uniqueValueSources.forEach(sourceName => {
    // Find a component that uses this source to get an initial value
    let initialValue: any = null;
    const compUsingSource = designComponents.find(c => c.props.valueSource === sourceName) || 
                            designComponents.flatMap(c => c.children || []).find(child => child.props.valueSource === sourceName);
    
    if (compUsingSource) {
      const compConfig = getComponentConfig(compUsingSource.type);
      if (compUsingSource.props.value !== undefined) {
        initialValue = compUsingSource.props.value;
      } else if (compConfig?.propTypes.value?.defaultValue !== undefined) {
        initialValue = compConfig.propTypes.value.defaultValue;
      } else if (compUsingSource.type === 'checkbox' || compUsingSource.type === 'switch') {
        initialValue = compConfig?.propTypes.checked?.defaultValue ?? false;
      }
    }
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState(initialValue);
    statesManager[sourceName] = [value, setValue];
    const setterName = `set${sourceName.charAt(0).toUpperCase() + sourceName.slice(1)}`;
    settersForActions[setterName] = setValue;
  });


  const previewContainerStyle: React.CSSProperties = {
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    position: 'relative',
    backgroundColor: 'hsl(var(--background))', 
    boxShadow: '0 0 10px rgba(0,0,0,0.1)', 
    margin: 'auto', 
  };

  return (
    <ScrollArea className="w-full h-full bg-muted/20"> 
        <div style={previewContainerStyle}>
            {designComponents.filter(c => !c.parentId) 
            .sort((a,b) => a.zIndex - b.zIndex)
            .map((comp) => (
            <div
                key={`preview-top-${comp.id}`}
                style={{
                position: 'absolute',
                left: comp.x,
                top: comp.y,
                width: comp.width,
                height: comp.height,
                zIndex: comp.zIndex,
                }}
            >
                <RenderPreviewComponentRecursive component={comp} previewStates={statesManager} allSetters={settersForActions} />
            </div>
            ))}
        </div>
    </ScrollArea>
  );
};

export default DesignPreviewRenderer;
