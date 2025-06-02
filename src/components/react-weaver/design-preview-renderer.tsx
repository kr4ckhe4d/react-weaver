
"use client";
import React, { useState } from 'react'; // Added useState for interactive components
import type { CanvasComponent } from '@/types';
import { useDesign } from '@/contexts/design-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card as ShadCard, CardHeader as ShadCardHeader, CardTitle as ShadCardTitle, CardDescription as ShadCardDescription, CardContent as ShadCardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import new ShadCN components for preview
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// ScrollArea is already imported
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Import specific actions from exampleActions.ts
import { showMessage, anotherAction, updateExampleProgress } from '@/app-logic/exampleActions';


const RenderPreviewComponentRecursive: React.FC<{ component: CanvasComponent, depth?: number }> = ({ component, depth = 0 }) => {
  const { type, props, children, id } = component;
  const commonProps = { ...props }; 

  const childStyle: React.CSSProperties = component.parentId ? {
    position: 'absolute',
    left: component.x,
    top: component.y,
    width: component.width,
    height: component.height,
  } : {};

  // State for interactive components in preview
  const [accordionValue, setAccordionValue] = useState<string | string[] | undefined>(props.type === 'multiple' ? [] : props.defaultValue);
  const [radioValue, setRadioValue] = useState<string | undefined>(props.defaultValue);
  const [selectValue, setSelectValue] = useState<string | undefined>(props.value);
  const [tabsValue, setTabsValue] = useState<string | undefined>(props.defaultValue);
  const [inputValue, setInputValue] = useState<string>(props.value || '');
  const [textareaValue, setTextareaValue] = useState<string>(props.value || '');
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(!!props.checked);
  const [switchChecked, setSwitchChecked] = useState<boolean>(!!props.checked);
  const [progressValue, setProgressValue] = useState<number>(props.value !== undefined ? props.value : 0); // For progress with valueSource

  // Simulate state for progress bar if valueSource is used
  React.useEffect(() => {
    if (props.valueSource && props.value !== undefined) {
      setProgressValue(props.value);
    }
  }, [props.value, props.valueSource]);


  switch (type) {
    case 'button':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onClickAction, ...previewButtonProps } = commonProps;
      let buttonClickHandler = () => {};
      if (props.onClickAction) {
        const actionString = props.onClickAction as string;
        if (actionString === 'exampleActions/showMessage') {
          buttonClickHandler = showMessage;
        } else if (actionString === 'exampleActions/anotherAction') {
          buttonClickHandler = anotherAction;
        } else if (actionString === 'exampleActions/updateExampleProgress') {
          // For actions requiring state setters, direct execution in preview is complex.
          // We'll log a more specific message.
          // The updateExampleProgress from exampleActions expects a setter function.
          // In a real scenario, we'd need to link this to a specific progress bar's state setter.
          // For preview simplicity, we'll just log.
          buttonClickHandler = () => {
            console.log("Preview: 'exampleActions/updateExampleProgress' would be called. This action normally updates a progress bar by receiving its state setter. In the generated code, you would pass the appropriate setProgressValue function.");
            // To simulate a random change for any progress bar visible in preview (if needed for visual feedback):
            // This is a very basic simulation and won't target a specific progress bar linked to this button.
            // For more accurate preview, a more complex state management for preview would be needed.
            // For now, we will call the imported function with a dummy setter that just logs.
            updateExampleProgress((newVal) => console.log(`Preview: updateExampleProgress tried to set progress to ${newVal} (dummy setter).`));
          };
        } else if (actionString.includes('/')) {
          buttonClickHandler = () => console.log(`Preview: Action '${actionString}' from your codebase would be triggered.`);
        } else {
           buttonClickHandler = () => console.log(`Preview: Local action '${actionString}' would be triggered (and defined in the generated component).`);
        }
      }
      return <Button {...previewButtonProps} style={childStyle} onClick={buttonClickHandler}>{props.children || 'Button'}</Button>;
    case 'input':
      return <Input {...commonProps} value={inputValue} onChange={(e) => setInputValue(e.target.value)} className={cn("w-full h-full", props.className)} style={childStyle} />;
    case 'text':
      return <p {...commonProps} className={cn("p-1", props.className)} style={childStyle}>{props.children || 'Text Block'}</p>;
    case 'card':
      return (
        <ShadCard {...commonProps} className={cn("w-full h-full overflow-hidden flex flex-col", props.className)} style={childStyle}>
          <ShadCardHeader>
            <ShadCardTitle>{props.title || 'Card Title'}</ShadCardTitle>
            {props.description && <ShadCardDescription>{props.description}</ShadCardDescription>}
          </ShadCardHeader>
          <ShadCardContent className="flex-grow relative p-2"> {/* Added p-2 for child spacing */}
            {(!children || children.length === 0) && (props.content || 'Card Content')}
            {children && children.map(child => (
                <RenderPreviewComponentRecursive key={`preview-child-${child.id}-${depth}`} component={child} depth={depth + 1}/>
            ))}
          </ShadCardContent>
        </ShadCard>
      );
    case 'image':
      return <img src={props.src} alt={props.alt} {...commonProps} className={cn("w-full h-full object-contain", props.className)} style={childStyle} data-ai-hint={props['data-ai-hint']} />;
    case 'checkbox':
        return (
            <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Checkbox id={`${id}-preview-checkbox`} checked={checkboxChecked} onCheckedChange={(checked) => setCheckboxChecked(Boolean(checked))} {...commonProps} />
                <label htmlFor={`${id}-preview-checkbox`} className="text-sm font-medium leading-none">
                    {props.label || "Checkbox"}
                </label>
            </div>
        );
    case 'switch':
        return (
             <div className="flex items-center space-x-2 p-1" style={childStyle}>
                <Switch id={`${id}-preview-switch`} checked={switchChecked} onCheckedChange={setSwitchChecked} {...commonProps} />
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valueSource, ...progressPreviewProps } = commonProps;
      const currentProgressValue = props.valueSource ? progressValue : props.value;
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
                     <RenderPreviewComponentRecursive key={`preview-child-${child.id}-${depth}`} component={child} depth={depth + 1}/>
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
      return <Textarea placeholder={props.placeholder} value={textareaValue} onChange={(e) => setTextareaValue(e.target.value)} className={cn("w-full h-full", props.className)} style={childStyle} {...commonProps} />;
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
    margin: 'auto', 
  };

  return (
    <ScrollArea className="w-full h-full bg-muted/20"> 
        <div style={previewContainerStyle}>
            {components.filter(c => !c.parentId) 
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
                <RenderPreviewComponentRecursive component={comp} />
            </div>
            ))}
        </div>
    </ScrollArea>
  );
};

export default DesignPreviewRenderer;


    