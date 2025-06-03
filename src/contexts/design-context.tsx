
"use client";
import type { CanvasComponent } from '@/types';
import { AVAILABLE_COMPONENTS, GRID_SIZE, getComponentConfig } from '@/components/react-weaver/available-components';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Define initial global states here
const initialGlobalStatesConfig: Record<string, any> = {
  myProgress: 10,
  appTitle: "React Weaver App",
  isLoading: false,
};


interface DesignContextType {
  components: CanvasComponent[];
  selectedComponentId: string | null;
  addComponent: (type: string, position: { x: number; y: number }, parentId?: string | null) => void;
  updateComponentProps: (id: string, newProps: Record<string, any>) => void;
  updateComponentPosition: (id: string, position: { x: number; y: number }, parentId?: string | null) => void;
  updateComponentSize: (id: string, size: { width: number; height: number }, parentId?: string | null) => void;
  selectComponent: (id: string | null) => void;
  deleteComponent: (id: string, parentId?: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  getDesignJSON: () => string;
  generateCode: () => Promise<string>;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
  initialGlobalStates: Record<string, any>; // Added for global states
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

  const addComponent = useCallback((type: string, position: { x: number; y: number }, parentId: string | null = null) => {
    const componentConfig = getComponentConfig(type);
    if (!componentConfig) return;

    const newId = `${type}-${Date.now()}`;

    const newComponent: CanvasComponent = {
      id: newId,
      type,
      props: { ...componentConfig.defaultProps },
      x: snapToGrid(position.x),
      y: snapToGrid(position.y),
      width: snapToGrid(componentConfig.defaultSize.width),
      height: snapToGrid(componentConfig.defaultSize.height),
      zIndex: 0,
      parentId: parentId,
      children: componentConfig.isContainer ? [] : undefined,
    };

    if (parentId) {
      setComponents(prev =>
        prev.map(p =>
          p.id === parentId
            ? { ...p, children: [...(p.children || []), newComponent] }
            : p
        )
      );
    } else {
      const maxZIndex = components.reduce((max, comp) => Math.max(max, comp.zIndex), 0);
      newComponent.zIndex = maxZIndex + 1;
      setComponents(prev => [...prev, newComponent]);
    }
    selectComponent(newId);
  }, [components, selectComponent]);


  const updateComponentRecursive = (
    items: CanvasComponent[],
    id: string,
    parentId: string | null | undefined,
    updateFn: (comp: CanvasComponent) => CanvasComponent
  ): CanvasComponent[] => {
    return items.map(comp => {
      if (comp.id === id && comp.parentId === parentId) {
        return updateFn(comp);
      }
      if (comp.children && comp.children.length > 0) {
        return { ...comp, children: updateComponentRecursive(comp.children, id, comp.id, updateFn) };
      }
      return comp;
    });
  };

  const findParentId = (items: CanvasComponent[], childId: string): string | null | undefined => {
    for (const item of items) {
        if (item.children?.some(child => child.id === childId)) {
            return item.id;
        }
        if (item.children) {
            const foundParentIdRecursive = findParentId(item.children, childId);
            if (foundParentIdRecursive !== undefined) {
                 return foundParentIdRecursive;
            }
        }
    }
    const targetComponent = items.find(c => c.id === childId);
    if (targetComponent && targetComponent.parentId === null) return null;

    return undefined;
  };

  const updateComponentProps = useCallback((id: string, newProps: Record<string, any>) => {
    const parentId = findParentId(components, id);
    const updateFn = (comp: CanvasComponent) => ({ ...comp, props: { ...comp.props, ...newProps } });
     setComponents(prev => updateComponentRecursive(prev, id, parentId, updateFn));
  }, [components]);

  const updateComponentPosition = useCallback((id: string, position: { x: number; y: number }, parentIdToFind?: string | null) => {
    const parentId = parentIdToFind === undefined ? findParentId(components, id) : parentIdToFind;
    const updateFn = (comp: CanvasComponent) => ({ ...comp, x: snapToGrid(position.x), y: snapToGrid(position.y) });
    setComponents(prev => updateComponentRecursive(prev, id, parentId, updateFn));
  }, [components]);

  const updateComponentSize = useCallback((id: string, size: { width: number; height: number }, parentIdToFind?: string | null) => {
    const parentId = parentIdToFind === undefined ? findParentId(components, id) : parentIdToFind;
    const updateFn = (comp: CanvasComponent) => ({ ...comp, width: snapToGrid(Math.max(size.width, GRID_SIZE)), height: snapToGrid(Math.max(size.height, GRID_SIZE)) });
    setComponents(prev => updateComponentRecursive(prev, id, parentId, updateFn));
  }, [components]);


  const deleteComponentRecursive = (
    items: CanvasComponent[],
    idToDelete: string
  ): CanvasComponent[] => {
    const filteredItems = items.filter(comp => comp.id !== idToDelete);

    return filteredItems.map(comp => {
      if (comp.children && comp.children.length > 0) {
        const newChildren = deleteComponentRecursive(comp.children, idToDelete);
        return { ...comp, children: newChildren };
      }
      return comp;
    });
  };

  const deleteComponent = useCallback((id: string, parentIdIgnored?: string | null) => {
      setComponents(prev => deleteComponentRecursive(prev, id));
      if (selectedComponentId === id) {
          setSelectedComponentId(null);
      }
  }, [selectedComponentId]);


  const bringToFront = useCallback((id: string) => {
    setComponents(prev => {
      const compToUpdate = prev.find(c => c.id === id && !c.parentId);
      if (!compToUpdate) return prev;
      const maxZIndex = prev.reduce((max, c) => c.parentId ? max : Math.max(max, c.zIndex), 0);
      return prev.map(c => (c.id === id ? { ...c, zIndex: maxZIndex + 1 } : c));
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setComponents(prev => {
      const compToUpdate = prev.find(c => c.id === id && !c.parentId);
      if (!compToUpdate) return prev;

      const topLevelComponents = prev.filter(c => !c.parentId);
      if (topLevelComponents.length <= 1) return prev.map(c => c.id === id ? { ...c, zIndex: 1 } : c);

      const minZIndexAmongOthers = topLevelComponents
        .filter(c => c.id !== id)
        .reduce((min, c) => Math.min(min, c.zIndex), Infinity);

      let targetZIndex = 1;
      if (minZIndexAmongOthers !== Infinity && minZIndexAmongOthers > 1) {
        targetZIndex = minZIndexAmongOthers -1;
      }

      return prev.map(c => {
        if (c.id === id) {
          return { ...c, zIndex: targetZIndex };
        }
        return c;
      });
    });
  }, []);

  const getDesignJSON = useCallback(() => {
    const toSerializable = (comps: CanvasComponent[]): any[] => {
      return comps.map(({ id, type, props, x, y, width, height, zIndex, parentId, children }) => ({
        id, type, props, layout: { x, y, width, height, zIndex }, parentId,
        children: children ? toSerializable(children) : undefined
      }));
    };
    return JSON.stringify({ components: toSerializable(components), canvas: { width: canvasSize.width, height: canvasSize.height }, initialGlobalStates: initialGlobalStatesConfig }, null, 2);
  }, [components, canvasSize]);

  const generateCode = async () => {
    const imports = new Set<string>();
    imports.add("import React, { useState, useEffect } from 'react';");

    const allComponentsFlat: CanvasComponent[] = [];
    function flattenComponents(comps: CanvasComponent[], parent?: CanvasComponent) {
      comps.forEach(comp => {
        allComponentsFlat.push({...comp, parentId: parent?.id ?? null});
        if (comp.children) {
          flattenComponents(comp.children, comp);
        }
      });
    }
    flattenComponents(components);

    const localActions = new Set<string>();
    const importedActions = new Map<string, Set<string>>(); // moduleName -> Set<functionName>
    
    // Initialize states from initialGlobalStatesConfig first
    const states = new Map<string, { initialValue: any, setterName: string }>();
    Object.entries(initialGlobalStatesConfig).forEach(([key, value]) => {
      states.set(key, {
        initialValue: value,
        setterName: `set${key.charAt(0).toUpperCase() + key.slice(1)}`
      });
    });


    allComponentsFlat.forEach(comp => {
      const componentConfig = getComponentConfig(comp.type);
      if (!componentConfig) return;

      const componentName = comp.type.charAt(0).toUpperCase() + comp.type.slice(1);
      const importMap: Record<string, string> = {
          'Text': 'p',
          'Image': 'img',
          'Placeholder': 'div',
          'Card': 'Card, CardHeader, CardTitle, CardDescription, CardContent',
          'Accordion': 'Accordion, AccordionItem, AccordionTrigger, AccordionContent',
          'Alert': 'Alert, AlertTitle, AlertDescription',
          'RadioGroup': 'RadioGroup, RadioGroupItem',
          'Table': 'Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption',
          'Tabs': 'Tabs, TabsList, TabsTrigger, TabsContent',
      };
      const importName = importMap[componentName] || componentName;
      if (!['p', 'img', 'div'].includes(importName) && componentConfig) {
        if (importName.includes(',')) {
            const parts = importName.split(',').map(p => p.trim());
            imports.add(`import { ${parts.join(', ')} } from '@/components/ui/${comp.type}';`);
        } else {
            imports.add(`import { ${importName} } from '@/components/ui/${comp.type}';`);
        }
      }

      if (comp.type === 'button' && comp.props.onClickAction && comp.props.onClickAction.trim() !== '') {
        const actionStr = comp.props.onClickAction.trim();
        if (actionStr.includes('/')) {
          const [moduleName, funcName] = actionStr.split('/');
          if (moduleName && funcName) {
            if (!importedActions.has(moduleName)) {
              importedActions.set(moduleName, new Set());
            }
            importedActions.get(moduleName)!.add(funcName);
          }
        } else {
          localActions.add(actionStr);
        }
      }
      // Add other valueSource-driven states if not already in initialGlobalStatesConfig
      if (comp.props.valueSource && comp.props.valueSource.trim() !== '') {
        const stateName = comp.props.valueSource.trim();
        if (!states.has(stateName)) { // Only add if not already globally defined
          let initialVal: any = null;
          const currentCompConfig = getComponentConfig(comp.type); // Renamed to avoid conflict
          
          if (comp.type === 'progress') initialVal = comp.props.value !== undefined ? comp.props.value : (currentCompConfig?.propTypes.value?.defaultValue ?? 0);
          else if (comp.type === 'input' || comp.type === 'textarea') initialVal = comp.props.value !== undefined ? comp.props.value : (currentCompConfig?.propTypes.value?.defaultValue ?? '');
          else if (comp.type === 'checkbox' || comp.type === 'switch') initialVal = comp.props.checked !== undefined ? comp.props.checked : (currentCompConfig?.propTypes.checked?.defaultValue ?? false);
          else if (comp.type === 'label') initialVal = comp.props.children !== undefined ? String(comp.props.children) : (currentCompConfig?.propTypes.children?.defaultValue ?? '');
          
          states.set(stateName, {
            initialValue: initialVal,
            setterName: `set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`
          });
        }
      }
    });

    importedActions.forEach((funcSet, moduleName) => {
      imports.add(`import { ${[...funcSet].join(', ')} } from '@/app-logic/${moduleName}';`);
    });

    let stateDeclarations = '';
    states.forEach((val, key) => {
      stateDeclarations += `  const [${key}, ${val.setterName}] = useState(${JSON.stringify(val.initialValue)});\n`;
    });

    let actionDeclarations = '';
    localActions.forEach(actionName => {
      let settersComment = "// Available state setters: ";
      const availableSetters: string[] = [];
      states.forEach((val) => {
        availableSetters.push(val.setterName);
      });
      settersComment += availableSetters.join(', ') || "none";
      actionDeclarations += `  const ${actionName} = () => {\n    console.log('Local action "${actionName}" triggered. Implement your logic here.');\n    // ${settersComment}\n    // Example: ${availableSetters.length > 0 ? `${availableSetters[0]}(prev => (prev + 10) % 110);` : ''}\n  };\n`;
    });

    const generateComponentCodeInternal = (comp: CanvasComponent): string => {
      const componentConfig = getComponentConfig(comp.type);
      if (!componentConfig) return `// Unknown component type: ${comp.type}`;

      const tempProps = { ...comp.props };
      const propsToProcess: Record<string, string> = {};

      if (comp.type === 'button' && tempProps.onClickAction && tempProps.onClickAction.trim() !== '') {
        const actionStr = tempProps.onClickAction.trim();
        if (actionStr.includes('/')) {
          const [, funcName] = actionStr.split('/');
          propsToProcess.onClick = `{() => ${funcName}({ ${[...states.values()].map(s => s.setterName).join(', ')} })}`;
        } else {
          propsToProcess.onClick = `{${actionStr}}`;
        }
        delete tempProps.onClickAction;
      }

      if (tempProps.valueSource && tempProps.valueSource.trim() !== '') {
        const stateName = tempProps.valueSource.trim();
        if (comp.type === 'input' || comp.type === 'textarea') {
            propsToProcess.value = `{${stateName}}`;
            const setterName = states.get(stateName)?.setterName;
            if (setterName) propsToProcess.onChange = `{(e) => ${setterName}(e.target.value)}`;
        } else if (comp.type === 'checkbox' || comp.type === 'switch') {
            propsToProcess.checked = `{${stateName}}`;
            const setterName = states.get(stateName)?.setterName;
            if (setterName) propsToProcess.onCheckedChange = `{(checked) => ${setterName}(Boolean(checked))}`;
        } else if (comp.type === 'progress') {
            propsToProcess.value = `{${stateName}}`;
        } else if (comp.type === 'label') {
            // Children for label handled below
        }
        delete tempProps.valueSource;
        // Delete the original prop that valueSource replaces
        if (comp.type !== 'label') delete tempProps.value; // for input, textarea, progress
        if (comp.type === 'checkbox' || comp.type === 'switch') delete tempProps.checked;
      }


      Object.entries(tempProps).forEach(([key, value]) => {
        if (propsToProcess[key]) return; 

        if (key === 'children' && typeof value === 'string' && !comp.children?.length && !componentConfig.isContainer) {
          // Handled by childrenString logic
        } else if (typeof value === 'string') {
          propsToProcess[key] = `"${value.replace(/"/g, '\\"')}"`;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          propsToProcess[key] = `{${value}}`;
        } else if (key !== 'children') { // Avoid double-stringifying children objects if they are complex
          propsToProcess[key] = `{${JSON.stringify(value)}}`;
        }
      });

      const propsString = Object.entries(propsToProcess)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');

      let childrenString = '';
       if (comp.type === 'label' && comp.props.valueSource && states.has(comp.props.valueSource)) {
        childrenString = `{${comp.props.valueSource}}`;
      } else if (comp.children && comp.children.length > 0) {
        childrenString = `\n${comp.children.map(child => generateComponentCodeInternal(child)).join('\n')}\n          `;
      } else if (comp.props.children && typeof comp.props.children === 'string' && !componentConfig.isContainer) {
        childrenString = comp.props.children;
      } else if (componentConfig.isContainer && comp.props.content && typeof comp.props.content === 'string') {
        childrenString = comp.props.content;
      }


      let componentName = comp.type.charAt(0).toUpperCase() + comp.type.slice(1);
      if (comp.type === 'text') componentName = 'p';
      else if (comp.type === 'image') componentName = 'img';
      else if (comp.type === 'placeholder') componentName = 'div';

      const styleProps = comp.parentId
        ? `style={{ position: 'absolute', left: ${comp.x}, top: ${comp.y}, width: ${comp.width}, height: ${comp.height} }}`
        : `style={{ position: 'absolute', left: ${comp.x}, top: ${comp.y}, width: ${comp.width}, height: ${comp.height}, zIndex: ${comp.zIndex} }}`;

      if (comp.type === 'card') {
        return `<Card ${propsString} ${styleProps}>
                    <CardHeader>
                        <CardTitle>${comp.props.title || 'Card Title'}</CardTitle>
                        ${comp.props.description ? `<CardDescription>${comp.props.description}</CardDescription>` : ''}
                    </CardHeader>
                    <CardContent>${childrenString}</CardContent>
                </Card>`;
      }
      
      // Special handling for checkbox label
      if (comp.type === 'checkbox' && comp.props.label) {
        return `<div className="flex items-center space-x-2" ${styleProps}>
                  <${componentName} id="${comp.id}-chk" ${propsString} />
                  <label htmlFor="${comp.id}-chk" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    ${comp.props.label}
                  </label>
                </div>`;
      }
      // Special handling for switch label
      if (comp.type === 'switch' && comp.props.label) {
         return `<div className="flex items-center space-x-2" ${styleProps}>
                   <${componentName} id="${comp.id}-swt" ${propsString} />
                   <label htmlFor="${comp.id}-swt">${comp.props.label}</label>
                 </div>`;
      }


      if (childrenString) {
        return `<${componentName} ${propsString} ${styleProps}>${childrenString}</${componentName}>`;
      }
      return `<${componentName} ${propsString} ${styleProps} />`;
    };

    const mainCode = components.filter(c => !c.parentId)
      .sort((a,b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
      .map(comp => `        ${generateComponentCodeInternal(comp)}`)
      .join('\n');

    return Promise.resolve(
      `${[...imports].join('\n')}\n\n` +
      `export default function MyDesignedComponent() {\n` +
      `${stateDeclarations}` +
      `${actionDeclarations}` +
      `  return (\n` +
      `    <div style={{ position: 'relative', width: '${canvasSize.width}px', height: '${canvasSize.height}px', border: '1px solid #ccc', overflow: 'hidden', background: 'hsl(var(--background))' }}>\n` +
      `${mainCode}\n` +
      `    </div>\n` +
      `  );\n` +
      `}`
    );
  };

  return (
    <DesignContext.Provider
      value={{
        components,
        selectedComponentId,
        addComponent,
        updateComponentProps,
        updateComponentPosition,
        updateComponentSize,
        selectComponent,
        deleteComponent,
        bringToFront,
        sendToBack,
        getDesignJSON,
        generateCode,
        canvasSize,
        setCanvasSize,
        initialGlobalStates: initialGlobalStatesConfig, // Provide the config
      }}
    >
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = (): DesignContextType => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};

