
"use client";
import type { CanvasComponent } from '@/types';
import { AVAILABLE_COMPONENTS, GRID_SIZE, getComponentConfig } from '@/components/react-weaver/available-components';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { generateCode as generateCodeFlow } from '@/ai/flows/generate-code-from-ui';
import { suggestComponentProps as suggestPropsFlow } from '@/ai/flows/suggest-component-props';

interface DesignContextType {
  components: CanvasComponent[];
  selectedComponentId: string | null;
  addComponent: (type: string, position: { x: number; y: number }) => void;
  updateComponentProps: (id: string, newProps: Record<string, any>) => void;
  updateComponentPosition: (id: string, position: { x: number; y: number }) => void;
  updateComponentSize: (id: string, size: { width: number; height: number }) => void;
  selectComponent: (id: string | null) => void;
  deleteComponent: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  getDesignJSON: () => string;
  generateCode: () => Promise<string>;
  suggestProps: (componentType: string, currentProps: Record<string, any>) => Promise<Record<string, any>>;
  isLoadingAi: boolean;
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 }); // Default, can be dynamic

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const addComponent = useCallback((type: string, position: { x: number; y: number }) => {
    const componentConfig = getComponentConfig(type);
    if (!componentConfig) return;

    const newId = `${type}-${Date.now()}`;
    const maxZIndex = components.reduce((max, comp) => Math.max(max, comp.zIndex), 0);
    
    const newComponent: CanvasComponent = {
      id: newId,
      type,
      props: { ...componentConfig.defaultProps },
      x: snapToGrid(position.x),
      y: snapToGrid(position.y),
      width: snapToGrid(componentConfig.defaultSize.width),
      height: snapToGrid(componentConfig.defaultSize.height),
      zIndex: maxZIndex + 1,
    };
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponentId(newId);
  }, [components]);

  const updateComponentProps = useCallback((id: string, newProps: Record<string, any>) => {
    setComponents(prev =>
      prev.map(comp => (comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp))
    );
  }, []);

  const updateComponentPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, x: snapToGrid(position.x), y: snapToGrid(position.y) } : comp
      )
    );
  }, []);

  const updateComponentSize = useCallback((id: string, size: { width: number; height: number }) => {
    setComponents(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, width: snapToGrid(Math.max(size.width, GRID_SIZE)), height: snapToGrid(Math.max(size.height, GRID_SIZE)) } : comp
      )
    );
  }, []);


  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId]);

  const bringToFront = useCallback((id: string) => {
    setComponents(prev => {
      const maxZIndex = prev.reduce((max, comp) => Math.max(max, comp.zIndex), 0);
      return prev.map(comp => comp.id === id ? { ...comp, zIndex: maxZIndex + 1 } : comp);
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
     setComponents(prev => {
      const minZIndex = prev.reduce((min, comp) => comp.id === id ? min : Math.min(min, comp.zIndex), Infinity);
      let targetZIndex = 1;
      if (minZIndex !== Infinity && minZIndex > 1) {
        targetZIndex = minZIndex -1;
      } else if (prev.length > 1) {
         // If it's already the lowest or only one other item, try to find a free slot or make it 1
         const sortedZIndexes = [...new Set(prev.map(c => c.zIndex))].sort((a,b) => a-b);
         if (sortedZIndexes[0] > 1) targetZIndex = sortedZIndexes[0] -1;
         else targetZIndex = 1; // Could cause conflict if 1 is taken by non-target, handled by re-sorting later if needed
      }
      
      return prev.map(comp => {
        if (comp.id === id) {
          return { ...comp, zIndex: targetZIndex };
        }
        // Potentially shift other components if we want to maintain unique z-indices strictly and avoid gaps
        // For now, simple assignment. Re-ordering might be needed for strict layer mgmt.
        return comp;
      }).sort((a,b) => a.zIndex - b.zIndex); // Re-sort to reflect visual order
    });
  }, []);


  const getDesignJSON = useCallback(() => {
    const simplifiedComponents = components.map(({ id, type, props, x, y, width, height, zIndex }) => ({
      id, type, props, layout: { x, y, width, height, zIndex }
    }));
    return JSON.stringify({ components: simplifiedComponents, canvas: { width: canvasSize.width, height: canvasSize.height } }, null, 2);
  }, [components, canvasSize]);

  const generateCode = async () => {
    setIsLoadingAi(true);
    try {
      const uiDesignJson = getDesignJSON();
      const result = await generateCodeFlow({ uiDesignJson });
      return result.reactCode;
    } catch (error) {
      console.error("Error generating code:", error);
      return `// Error generating code: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  const suggestProps = async (componentType: string, currentProps: Record<string, any>) => {
    setIsLoadingAi(true);
    try {
      const result = await suggestPropsFlow({ componentName: componentType, existingProps: currentProps });
      return result;
    } catch (error) {
      console.error("Error suggesting props:", error);
      return {};
    } finally {
      setIsLoadingAi(false);
    }
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
        isLoadingAi,
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
