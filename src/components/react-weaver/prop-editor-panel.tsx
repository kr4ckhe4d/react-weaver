
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
import { IconLayers, IconTrash } from './icons';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import * as exampleActionsModule from '@/app-logic/exampleActions';

const PropEditorPanel: React.FC = () => {
  const { selectedComponentId, components, updateComponentProps, deleteComponent, bringToFront, sendToBack } = useDesign();
  const selectedComponent = components.find(comp => comp.id === selectedComponentId);
  const componentConfig = selectedComponent ? getComponentConfig(selectedComponent.type) : null;

  const handleInputChange = (propName: string, value: any) => {
    if (!selectedComponentId) return;
    updateComponentProps(selectedComponentId, { [propName]: value });
  };

  const renderPropField = (propName: string, propDef: PropDefinition, currentValue: any) => {
    const key = `${selectedComponentId}-${propName}`;
    switch (propDef.type) {
      case 'string':
      case 'color':
      case 'number':
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
        let finalOptions: string[] = propDef.options || [];
        if (selectedComponent?.type === 'button' && propName === 'onClickAction') {
          const exampleModuleOptions = Object.keys(exampleActionsModule)
            .filter(moduleKey => typeof exampleActionsModule[moduleKey as keyof typeof exampleActionsModule] === 'function')
            .map(funcName => `exampleActions/${funcName}`);
          finalOptions = ['', ...exampleModuleOptions]; // Add "None" option and then example actions
        }
        return (
          <Select
            value={currentValue ?? propDef.defaultValue ?? ''}
            onValueChange={(value) => handleInputChange(propName, value)}
          >
            <SelectTrigger id={key} className="mt-1">
              <SelectValue placeholder={`Select ${propDef.label || propName}`} />
            </SelectTrigger>
            <SelectContent>
              {finalOptions.map(option => (
                <SelectItem key={option} value={option}>
                  {option === '' ? 'None / Manual' : option}
                </SelectItem>
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
                handleInputChange(propName, e.target.value);
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
          <Button variant="ghost" size="icon" onClick={() => deleteComponent(selectedComponent.id, selectedComponent.parentId)} title="Delete Component">
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
                <Button variant="outline" size="sm" onClick={() => bringToFront(selectedComponent.id)} disabled={!!selectedComponent.parentId}>Bring to Front</Button>
                <Button variant="outline" size="sm" onClick={() => sendToBack(selectedComponent.id)} disabled={!!selectedComponent.parentId}>Send to Back</Button>
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

        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default PropEditorPanel;
