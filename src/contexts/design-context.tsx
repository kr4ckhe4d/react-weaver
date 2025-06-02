
"use client";
import type { CanvasComponent } from '@/types';
import { AVAILABLE_COMPONENTS, GRID_SIZE, getComponentConfig } from '@/components/react-weaver/available-components';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface DesignContextType {
  components: CanvasComponent[];
  selectedComponentId: string | null;
  addComponent: (type: string, position: { x: number; y: number }, parentId?: string | null) => void;
  updateComponentProps: (id: string, newProps: Record<string, any>) => void;
  updateComponentPosition: (id: string, position: { x: number; y: number }, parentId?: string | null) => void;
  updateComponentSize: (id: string, size: { width: number; height: number }, parentId?: string | null) => void;
  selectComponent: (id: string | null) => void;
  deleteComponent: (id: string, parentId?: string | null) => void;
  bringToFront: (id: string) => void; // Note: Z-index for children is more complex, handled within parent context
  sendToBack: (id: string) => void;   // Note: Z-index for children is more complex
  getDesignJSON: () => string;
  generateCode: () => Promise<string>;
  suggestProps: (componentType: string, currentProps: Record<string, any>) => Promise<Record<string, any>>;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
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
      zIndex: 0, // Z-index for children is relative to parent; for top-level, calculated below
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
            return item.id; // Current item is the direct parent
        }
        if (item.children) {
            const foundParentIdRecursive = findParentId(item.children, childId);
            if (foundParentIdRecursive !== undefined) { // If a parent was found deeper
                 // If foundParentIdRecursive is null, it means a grandchild's parentId was null, which is an error state for nested children.
                 // But for our logic, if a recursive call returns an ID, that's the parent.
                 // If it returns undefined, the search continues.
                 return foundParentIdRecursive; // This could be an ID string or null if the direct parent of childId has parentId: null
            }
        }
    }
    // If we reach here, childId is either top-level (its parentId should be null) or not found in this branch
    // To determine if it's top level, we check its actual parentId prop after finding the component.
    // For now, returning undefined means "continue searching" or "it's top level".
    // A more robust approach might be needed if we strictly differentiate between "not found" and "is top level".
    // For the purpose of updateComponentRecursive, if `findParentId` returns `undefined` for a known `childId`,
    // it implies the component is top-level (parentId: null).
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
    // Filter out the component if it's at the current level
    const filteredItems = items.filter(comp => comp.id !== idToDelete);
    
    // Recursively process children
    return filteredItems.map(comp => {
      if (comp.children && comp.children.length > 0) {
        const newChildren = deleteComponentRecursive(comp.children, idToDelete);
        return { ...comp, children: newChildren };
      }
      return comp;
    });
  };
  
  const deleteComponent = useCallback((id: string, parentIdIgnored?: string | null) => {
      // parentId is not strictly needed here anymore since deleteComponentRecursive will find it by ID
      setComponents(prev => deleteComponentRecursive(prev, id));
      if (selectedComponentId === id) {
          setSelectedComponentId(null);
      }
  }, [selectedComponentId]);


  const bringToFront = useCallback((id: string) => {
    // This primarily affects top-level components. Children's z-index is within their parent.
    setComponents(prev => {
      const comp = prev.find(c => c.id === id && !c.parentId); // Only for top-level
      if (!comp) return prev;
      const maxZIndex = prev.reduce((max, c) => Math.max(max, c.zIndex), 0);
      return prev.map(c => (c.id === id ? { ...c, zIndex: maxZIndex + 1 } : c));
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    // This primarily affects top-level components.
    setComponents(prev => {
      const comp = prev.find(c => c.id === id && !c.parentId); // Only for top-level
      if (!comp) return prev;

      const otherMinZIndex = prev
        .filter(c => c.id !== id && !c.parentId)
        .reduce((min, c) => Math.min(min, c.zIndex), Infinity);
      
      let targetZIndex = 1;
      if (otherMinZIndex !== Infinity && otherMinZIndex > 1) {
        targetZIndex = otherMinZIndex -1;
      } else if (prev.filter(c => !c.parentId).length > 1) {
         const sortedZIndexes = [...new Set(prev.filter(c => !c.parentId).map(c => c.zIndex))].sort((a,b) => a-b);
         if (sortedZIndexes.length > 0 && sortedZIndexes[0] > 1) targetZIndex = sortedZIndexes[0] -1;
         else targetZIndex = 1; // Default to 1 if it's the only one or all others are at 1
      }
      
      return prev.map(c => {
        if (c.id === id) {
          return { ...c, zIndex: targetZIndex };
        }
        return c;
      }).sort((a,b) => a.zIndex - b.zIndex); // Re-sort might be needed if z-indices are not contiguous
    });
  }, []);

  const getDesignJSON = useCallback(() => {
    const toSerializable = (comps: CanvasComponent[]): any[] => {
      return comps.map(({ id, type, props, x, y, width, height, zIndex, parentId, children }) => ({
        id, type, props, layout: { x, y, width, height, zIndex }, parentId,
        children: children ? toSerializable(children) : undefined
      }));
    };
    return JSON.stringify({ components: toSerializable(components), canvas: { width: canvasSize.width, height: canvasSize.height } }, null, 2);
  }, [components, canvasSize]);

  const generateCode = async () => {
    // Simplified: needs recursive generation for children.
    const generateComponentCode = (comp: CanvasComponent): string => {
      const componentConfig = getComponentConfig(comp.type);
      if (!componentConfig) return `// Unknown component type: ${comp.type}`;

      const propsString = Object.entries(comp.props)
        .map(([key, value]) => {
          if (typeof value === 'string') return `${key}="${value}"`;
          if (typeof value === 'boolean' || typeof value === 'number') return `${key}={${value}}`;
          if (key === 'children' && typeof value === 'string' && !comp.children?.length) return `children="${value}"`
          return `${key}={${JSON.stringify(value)}}`; // For objects/arrays, might need refinement
        })
        .join(' ');
      
      const childrenString = comp.children && comp.children.length > 0
        ? comp.children.map(child => generateComponentCode(child)).join('\n')
        : (comp.props.children && typeof comp.props.children === 'string' && !componentConfig.isContainer) ? comp.props.children : '';

      let componentName = comp.type.charAt(0).toUpperCase() + comp.type.slice(1);
      if (comp.type === 'text') componentName = 'p'; // Or handle more robustly
      if (comp.type === 'image') componentName = 'img';
      
      // For ShadCN components, map to their actual names if different
      const shadcnMap: Record<string, string> = {
        'Button': 'Button', 'Input': 'Input', 'Card': 'Card', /* ... more ... */
        'Checkbox': 'Checkbox', 'Switch': 'Switch', 'Placeholder': 'div'
      };
      componentName = shadcnMap[componentName] || componentName;


      const styleProps = `style={{ position: 'absolute', left: ${comp.x}, top: ${comp.y}, width: ${comp.width}, height: ${comp.height}, zIndex: ${comp.parentId ? 'auto' : comp.zIndex} }}`;

      if (comp.children && comp.children.length > 0) {
         return `<${componentName} ${propsString} ${comp.parentId ? '' : styleProps}>\n${childrenString}\n</${componentName}>`;
      }
      if (childrenString) { // Text content
        return `<${componentName} ${propsString} ${comp.parentId ? '' : styleProps}>${childrenString}</${componentName}>`;
      }
      return `<${componentName} ${propsString} ${comp.parentId ? '' : styleProps} />`;
    };
    
    const imports = new Set<string>();
    components.forEach(comp => {
      // Simplified import logic
      if (['button', 'input', 'card', 'checkbox', 'switch'].includes(comp.type)){
         imports.add(`import { ${comp.type.charAt(0).toUpperCase() + comp.type.slice(1)} } from '@/components/ui/${comp.type}';`)
      }
    });


    const mainCode = components.filter(c => !c.parentId) // Only top-level components for initial rendering
      .sort((a,b) => a.zIndex - b.zIndex)
      .map(comp => generateComponentCode(comp))
      .join('\n        ');

    return Promise.resolve(
      `import React from 'react';\n${[...imports].join('\n')}\n\n` +
      `export default function MyDesign() {\n` +
      `  return (\n` +
      `    <div style={{ position: 'relative', width: '${canvasSize.width}px', height: '${canvasSize.height}px', border: '1px solid #ccc', overflow: 'hidden' }}>\n` +
      `      ${mainCode}\n` +
      `    </div>\n` +
      `  );\n` +
      `}`
    );
  };
  
  const suggestProps = async (componentType: string, currentProps: Record<string, any>) => {
    return Promise.resolve({});
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
        suggestProps,
        canvasSize,
        setCanvasSize,
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


    