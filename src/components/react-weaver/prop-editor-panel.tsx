
"use client";
import React, { useEffect, useState } from 'react';
import { useDesign } from '@/contexts/design-context';
import { getComponentConfig, AvailableComponent, PropDefinition } from './available-components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconLayers, IconTrash, IconPlusCircle, IconSettings } from './icons'; // Assuming IconLayers for z-index
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';

const PropEditorPanel: React.FC = () => {
  const { selectedComponentId, components, updateComponentProps, deleteComponent, bringToFront, sendToBack, suggestProps, isLoadingAi } = useDesign();
  const { toast } = useToast();
  const [suggestedProps, setSuggestedProps] = useState<Record<string, any> | null>(null);

  const selectedComponent = components.find(comp => comp.id === selectedComponentId);
  const componentConfig = selectedComponent ? getComponentConfig(selectedComponent.type) : null;

  const handleInputChange = (propName: string, value: any) => {
    if (!selectedComponentId) return;
    updateComponentProps(selectedComponentId, { [propName]: value });
  };

  const handleSuggestion = async () => {
    if (!selectedComponent || !componentConfig) return;
    setSuggestedProps(null); // Clear previous suggestions
    const newSuggestions = await suggestProps(selectedComponent.type, selectedComponent.props);
    if (Object.keys(newSuggestions).length > 0) {
      setSuggestedProps(newSuggestions);
      toast({ title: "Prop Suggestions", description: "AI has suggested some props." });
    } else {
      toast({ title: "Prop Suggestions", description: "No new props suggested by AI." });
    }
  };

  const applySuggestedProp = (propName: string, propValue: any) => {
    if (!selectedComponentId) return;
    updateComponentProps(selectedComponentId, { [propName]: propValue });
    // Remove applied suggestion
    if (suggestedProps) {
      const { [propName]: _, ...remainingSuggestions } = suggestedProps;
      setSuggestedProps(Object.keys(remainingSuggestions).length > 0 ? remainingSuggestions : null);
    }
  };

  useEffect(() => {
    // Clear suggestions when component changes
    setSuggestedProps(null);
  }, [selectedComponentId]);


  const renderPropField = (propName: string, propDef: PropDefinition, currentValue: any) => {
    const key = `${selectedComponentId}-${propName}`;
    switch (propDef.type) {
      case 'string':
      case 'color': // Simple text input for color for now
      case 'number': // HTML input type="number" handles this
        return (
          <Input
            id={key}
            type={propDef.type === 'number' ? 'number' : propDef.type === 'color' ? 'color' : 'text'}
            value={currentValue ?? propDef.defaultValue ?? ''}
            onChange={(e) => handleInputChange(propName, propDef.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            className="mt-1"
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center mt-1">
            <Checkbox
              id={key}
              checked={currentValue ?? propDef.defaultValue ?? false}
              onCheckedChange={(checked) => handleInputChange(propName, checked)}
            />
          </div>
        );
      case 'select':
        return (
          <Select
            value={currentValue ?? propDef.defaultValue ?? ''}
            onValueChange={(value) => handleInputChange(propName, value)}
          >
            <SelectTrigger id={key} className="mt-1">
              <SelectValue placeholder={`Select ${propDef.label || propName}`} />
            </SelectTrigger>
            <SelectContent>
              {propDef.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'object':
      case 'array':
        return (
          <Textarea
            id={key}
            value={typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue ?? propDef.defaultValue ?? {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleInputChange(propName, parsed);
              } catch (err) {
                // Allow typing invalid JSON temporarily, or show error
                handleInputChange(propName, e.target.value); // Store as string if invalid
              }
            }}
            rows={3}
            className="mt-1 font-code text-xs"
          />
        );
      default:
        return <p className="text-sm text-muted-foreground mt-1">Unsupported prop type: {propDef.type}</p>;
    }
  };

  if (!selectedComponent || !componentConfig) {
    return (
      <Card className="h-full w-80 flex flex-col rounded-none border-l border-panel-border shadow-md">
        <CardHeader className="p-4 border-b border-panel-border">
          <CardTitle className="text-lg font-headline text-primary">Properties</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Select a component to edit its properties.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full w-80 flex flex-col rounded-none border-l border-panel-border shadow-md">
      <CardHeader className="p-4 border-b border-panel-border">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-headline text-primary truncate" title={componentConfig.name}>{componentConfig.name} Properties</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => deleteComponent(selectedComponent.id)} title="Delete Component">
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <CardDescription className="text-xs">ID: {selectedComponent.id}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-4 space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Arrangement</h4>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => bringToFront(selectedComponent.id)}>Bring to Front</Button>
                <Button variant="outline" size="sm" onClick={() => sendToBack(selectedComponent.id)}>Send to Back</Button>
            </div>
            <Label htmlFor={`${selectedComponent.id}-zindex`} className="text-xs mt-2 block">Z-Index: {selectedComponent.zIndex}</Label>
          </div>
          <Separator />
          {Object.entries(componentConfig.propTypes).map(([propName, propDef]) => (
            <div key={propName}>
              <Label htmlFor={`${selectedComponentId}-${propName}`} className="text-sm font-medium">
                {propDef.label || propName.charAt(0).toUpperCase() + propName.slice(1)}
              </Label>
              {renderPropField(propName, propDef, selectedComponent.props[propName])}
            </div>
          ))}
          
          <Separator />
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <IconSettings className="mr-2 h-4 w-4" />
              AI Prop Suggestions
            </h4>
            <Button onClick={handleSuggestion} disabled={isLoadingAi} size="sm" variant="outline" className="w-full">
              {isLoadingAi ? 'Thinking...' : 'Suggest Props with AI'}
            </Button>
            {suggestedProps && Object.keys(suggestedProps).length > 0 && (
              <div className="mt-3 space-y-2 border border-dashed p-3 rounded-md bg-accent/10">
                <p className="text-xs text-muted-foreground">Click to apply suggested prop:</p>
                {Object.entries(suggestedProps).map(([propName, propValue]) => (
                  <Button
                    key={propName}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left text-xs"
                    onClick={() => applySuggestedProp(propName, propValue)}
                  >
                    <IconPlusCircle className="mr-2 h-3 w-3 text-green-500"/> {propName}: {typeof propValue === 'object' ? JSON.stringify(propValue) : String(propValue)}
                  </Button>
                ))}
              </div>
            )}
             {suggestedProps && Object.keys(suggestedProps).length === 0 && !isLoadingAi && (
                <p className="text-xs text-muted-foreground mt-2 text-center">No new props suggested.</p>
             )}
          </div>

        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default PropEditorPanel;
