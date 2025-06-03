
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
import type { AvailableSetters } from '@/app-logic/types';

// Directly import the known app-logic modules
import * as exampleActionsModule from '@/app-logic/exampleActions';

const appLogicModules: Record<string, Record<string, (...args: any[]) => any>> = {
  exampleActions: exampleActionsModule,
};

const findCompBySource = (comps: CanvasComponent[], sourceName: string): CanvasComponent | undefined => {
    for (const comp of comps) {
        if (comp.props.valueSource === sourceName) return comp;
        if (comp.children) {
            const foundInChildren = findCompBySource(comp.children, sourceName);
            if (foundInChildren) return foundInChildren;
        }
    }
    return undefined;
};


const RenderPreviewComponentRecursive: React.FC<{
  component: CanvasComponent,
  depth?: number,
  valueSourceStates: Record<string, any>,
  allSetters: AvailableSetters
}> = ({ component, depth = 0, valueSourceStates, allSetters }) => {
  const { type, props, children, id } = component;
  let commonProps = { ...props };

  const childStyle: React.CSSProperties = component.parentId ? {
    position: 'absolute',
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
  } : {};

  let liveValue: any;
  if (props.valueSource && valueSourceStates.hasOwnProperty(props.valueSource)) {
    liveValue = valueSourceStates[props.valueSource];
  } else {
    // If not controlled by valueSource, use component's own prop for initial display
    switch (type) {
        case 'input': liveValue = props.value || ''; break;
        case 'textarea': liveValue = props.value || ''; break;
        case 'checkbox': liveValue = !!props.checked; break;
        case 'switch': liveValue = !!props.checked; break;
        case 'label': liveValue = props.children || ''; break;
        case 'progress': liveValue = props.value !== undefined ? props.value : 0; break; 
    }
  }

  const [accordionValue, setAccordionValue] = useState<string | string[] | undefined>(props.type === 'multiple' ? [] : props.defaultValue);
  const [radioValue, setRadioValue] = useState<string | undefined>(props.defaultValue);
  const [selectValue, setSelectValue] = useState<string | undefined>(props.value);
  const [tabsValue, setTabsValue] = useState<string | undefined>(props.defaultValue);

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
          const actionFn = appLogicModules[moduleName][funcName];
          if (actionFn === exampleActionsModule.setSpecificProgressValue) {
            await actionFn(allSetters, 70); 
          } else {
            await actionFn(allSetters); 
          }
        } catch (error) {
          console.error(`Error executing action ${moduleName}/${funcName}:`, error);
          alert(`Error in action ${moduleName}/${funcName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        console.warn(`Preview: Action module '${moduleName}' or function '${funcName}' not found.`);
        alert(`Action '${actionString}' not found. Make sure it's exported from src/app-logic/${moduleName}.ts and that the file is loaded.`);
      }
    } else {
       console.log(`Preview: Local action '${actionString}' would be triggered (not supported for direct execution).`);
       alert(`Local actions like '${actionString}' are for generated code. Use 'fileName/functionName' for preview execution.`);
    }
  };

  const getSetterForValueSource = (valueSourceName?: string): ((value: any) => void) | undefined => {
    if (!valueSourceName) return undefined;
    const setterName = `set${valueSourceName.charAt(0).toUpperCase() + valueSourceName.slice(1)}`;
    return allSetters[setterName];
  };

  switch (type) {
    case 'button':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onClickAction: _onClickActionIgnoredButton, ...previewButtonProps } = commonProps;
      return <Button {...previewButtonProps} style={childStyle} onClick={handleAction}>{props.children || 'Button'}</Button>;
    case 'input':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceIgnoredInput, value: _staticInputValue, ...inputPreviewProps } = commonProps;
      const inputSetter = getSetterForValueSource(props.valueSource);
      return <Input {...inputPreviewProps}
                value={props.valueSource ? liveValue : localInputValue}
                onChange={(e) => inputSetter ? inputSetter(e.target.value) : setLocalInputValue(e.target.value)}
                className={cn("w-full h-full", props.className)} style={childStyle} />;
    case 'text':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { textAlign, fontWeight, fontSize, customTextColor, customBackgroundColor, className: userClassNameText, ...textPreviewProps } = commonProps;
      const textStyle: React.CSSProperties = { ...childStyle };
      if (customTextColor) textStyle.color = customTextColor;
      if (customBackgroundColor) textStyle.backgroundColor = customBackgroundColor;

      const textClasses: string[] = ["p-1"];
      if (textAlign) textClasses.push(`text-${textAlign}`);
      if (fontWeight && fontWeight !== 'normal') textClasses.push(`font-${fontWeight}`);
      if (fontSize) textClasses.push(fontSize);

      return <p {...textPreviewProps} style={textStyle} className={cn(...textClasses, userClassNameText)}>{props.children || 'Text Block'}</p>;
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
                <RenderPreviewComponentRecursive key={`preview-child-${child.id}-${depth}`} component={child} depth={depth + 1} valueSourceStates={valueSourceStates} allSetters={allSetters}/>
            ))}
          </ShadCardContent>
        </ShadCard>
      );
    case 'image':
      return <img src={props.src} alt={props.alt} {...commonProps} className={cn("w-full h-full object-contain", props.className)} style={childStyle} data-ai-hint={props['data-ai-hint']} />;
    case 'checkbox':
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { valueSource: _valueSourceIgnoredCheckbox, checked: _staticCheckboxChecked, ...checkboxPreviewProps } = commonProps;
        const checkboxSetter = getSetterForValueSource(props.valueSource);
        return (
            <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Checkbox id={`${id}-preview-checkbox`}
                    checked={props.valueSource ? liveValue : localCheckboxChecked}
                    onCheckedChange={(checked) => checkboxSetter ? checkboxSetter(Boolean(checked)) : setLocalCheckboxChecked(Boolean(checked))}
                    {...checkboxPreviewProps} />
                <label htmlFor={`${id}-preview-checkbox`} className="text-sm font-medium leading-none">
                    {props.label || "Checkbox"}
                </label>
            </div>
        );
    case 'switch':
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { valueSource: _valueSourceIgnoredSwitch, checked: _staticSwitchChecked, ...switchPreviewProps } = commonProps;
        const switchSetter = getSetterForValueSource(props.valueSource);
        return (
             <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Switch id={`${id}-preview-switch`}
                    checked={props.valueSource ? liveValue : localSwitchChecked}
                    onCheckedChange={(checked) => switchSetter ? switchSetter(checked) : setLocalSwitchChecked(checked)}
                    {...switchPreviewProps} />
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceIgnoredLabel, ...labelPreviewProps } = commonProps;
      const labelText = (props.valueSource && valueSourceStates.hasOwnProperty(props.valueSource))
                        ? String(liveValue) 
                        : (props.children || 'Label');
      return <Label className={cn("p-1", props.className)} style={childStyle} {...labelPreviewProps}>{labelText}</Label>;
    case 'progress':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceIgnoredProgress, value: _staticValueIgnored, ...progressPreviewProps } = commonProps;
      const currentProgressValue = (props.valueSource && valueSourceStates.hasOwnProperty(props.valueSource))
                                   ? liveValue 
                                   : props.value; 
      return <Progress value={Number(currentProgressValue) || 0} className={cn("w-full", props.className)} style={childStyle} {...progressPreviewProps} />;
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
                     <RenderPreviewComponentRecursive key={`preview-child-${child.id}-${depth}`} component={child} depth={depth + 1} valueSourceStates={valueSourceStates} allSetters={allSetters}/>
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource: _valueSourceIgnoredTextarea, value: _staticTextareaValue, ...textareaPreviewProps } = commonProps;
      const textareaSetter = getSetterForValueSource(props.valueSource);
      return <Textarea placeholder={props.placeholder}
                 value={props.valueSource ? liveValue : localTextareaValue}
                 onChange={(e) => textareaSetter ? textareaSetter(e.target.value) : setLocalTextareaValue(e.target.value)}
                 className={cn("w-full h-full", props.className)} style={childStyle} {...textareaPreviewProps} />;
    default:
      return <div className="w-full h-full bg-destructive/20 border border-destructive text-destructive-foreground flex items-center justify-center p-2" style={childStyle}>Unknown component: {type}</div>;
  }
};

const DesignPreviewRenderer: React.FC = () => {
  const { components: designComponents, canvasSize, initialGlobalStates } = useDesign();
  const [valueSourceStates, setValueSourceStates] = useState<Record<string, any>>({});

  const uniqueValueSources = useMemo(() => {
    const sources = new Set<string>(Object.keys(initialGlobalStates));
    function collectValueSourcesRecursive(comps: CanvasComponent[]) {
      comps.forEach(comp => {
        if (comp.props.valueSource && typeof comp.props.valueSource === 'string' && comp.props.valueSource.trim() !== '') {
          sources.add(comp.props.valueSource.trim());
        }
        if (comp.children) {
          collectValueSourcesRecursive(comp.children);
        }
      });
    }
    collectValueSourcesRecursive(designComponents);
    return Array.from(sources).sort();
  }, [designComponents, initialGlobalStates]); 

  useEffect(() => {
    const newInitialStates: Record<string, any> = {};
    let updateNeeded = false;

    uniqueValueSources.forEach(sourceName => {
        if (!valueSourceStates.hasOwnProperty(sourceName)) { 
            updateNeeded = true;
            let valueToSet: any = null;

            if (initialGlobalStates.hasOwnProperty(sourceName)) {
                valueToSet = initialGlobalStates[sourceName];
            } else {
                const compDef = findCompBySource(designComponents, sourceName); 
                if (compDef) {
                    const compConfig = getComponentConfig(compDef.type);
                    const props = compDef.props;
                    if (compDef.type === 'progress') { valueToSet = props.value !== undefined ? props.value : (compConfig?.propTypes.value?.defaultValue ?? 0); }
                    else if (compDef.type === 'input' || compDef.type === 'textarea') { valueToSet = props.value !== undefined ? props.value : (compConfig?.propTypes.value?.defaultValue ?? '');}
                    else if (compDef.type === 'checkbox' || compDef.type === 'switch') { valueToSet = props.checked !== undefined ? props.checked : (compConfig?.propTypes.checked?.defaultValue ?? false);}
                    else if (compDef.type === 'label') { valueToSet = props.children !== undefined ? String(props.children) : (compConfig?.propTypes.children?.defaultValue ?? '');}
                    else if (props.value !== undefined) valueToSet = props.value;
                    else if (props.checked !== undefined) valueToSet = props.checked;
                    else if (compConfig?.propTypes.value?.defaultValue !== undefined) valueToSet = compConfig.propTypes.value.defaultValue;
                    else if (compConfig?.propTypes.checked?.defaultValue !== undefined) valueToSet = compConfig.propTypes.checked.defaultValue;
                    else if (compConfig?.propTypes.children?.defaultValue !== undefined) valueToSet = String(compConfig.propTypes.children.defaultValue);
                    else valueToSet = null; 
                } else {
                    valueToSet = null; 
                }
            }
            newInitialStates[sourceName] = valueToSet;
        }
    });

    if (updateNeeded) {
        setValueSourceStates(prevStates => ({ ...prevStates, ...newInitialStates }));
    }
  }, [uniqueValueSources, initialGlobalStates, designComponents, valueSourceStates]);


  const allSettersForActions = useMemo<AvailableSetters>(() => {
    const setters: AvailableSetters = {};
    uniqueValueSources.forEach(sourceName => {
      const setterName = `set${sourceName.charAt(0).toUpperCase() + sourceName.slice(1)}`;
      setters[setterName] = (valueOrUpdater) => {
        setValueSourceStates(prevStates => {
          const currentVal = prevStates[sourceName];
          const newVal = typeof valueOrUpdater === 'function' ? valueOrUpdater(currentVal) : valueOrUpdater;
          return {
            ...prevStates,
            [sourceName]: newVal,
          };
        });
      };
    });
    return setters;
  }, [uniqueValueSources]);


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
            .sort((a,b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)) 
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
                <RenderPreviewComponentRecursive component={comp} valueSourceStates={valueSourceStates} allSetters={allSettersForActions} />
            </div>
            ))}
        </div>
    </ScrollArea>
  );
};

export default DesignPreviewRenderer;

