
"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExampleCounterProps {
  initialCount?: number;
  step?: number;
  title?: string;
  // Example of a prop that might be controlled by valueSource
  externalValue?: number;
  // Example of how an action might be triggered
  onCountChange?: (newCount: number) => void;
}

const ExampleCounter: React.FC<ExampleCounterProps> = ({
  initialCount = 0,
  step = 1,
  title = "Custom Counter",
  externalValue, // This prop won't be directly settable from UI unless 'valueSource' is used
  onCountChange, // This prop won't be directly settable from UI
}) => {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  // If externalValue is provided (e.g., via valueSource in React Weaver),
  // it could override the internal count. This is just an example.
  useEffect(() => {
    if (externalValue !== undefined) {
      setCount(externalValue);
    }
  }, [externalValue]);

  const handleIncrement = () => {
    const newCount = count + step;
    setCount(newCount);
    onCountChange?.(newCount); // For generated code
  };

  const handleDecrement = () => {
    const newCount = count - step;
    setCount(newCount);
    onCountChange?.(newCount); // For generated code
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-grow">
        <p className="text-2xl font-bold mb-4">{count}</p>
        <div className="flex gap-2">
          <Button onClick={handleDecrement} variant="outline" size="sm">-</Button>
          <Button onClick={handleIncrement} variant="outline" size="sm">+</Button>
        </div>
        {externalValue !== undefined && (
          <p className="text-xs mt-2 text-muted-foreground">External: {externalValue}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExampleCounter;

export const componentConfig = {
  id: 'custom_ExampleCounter',
  name: 'Counter (Custom)',
  defaultProps: {
    initialCount: 0,
    step: 1,
    title: "My Counter",
  },
  defaultSize: { width: 200, height: 180 },
  propTypes: {
    initialCount: { type: 'number', defaultValue: 0, label: 'Initial Count' },
    step: { type: 'number', defaultValue: 1, label: 'Step Increment' },
    title: { type: 'string', defaultValue: 'My Counter', label: 'Counter Title' },
    // 'valueSource' can be added here if we want this component's 'externalValue'
    // to be linkable to React Weaver's state system.
    // For example:
    // valueSource: { type: 'string', label: 'External Value Source', defaultValue: '' },
  },
  // isContainer: false, // Optional: if your custom component can host other components
};
