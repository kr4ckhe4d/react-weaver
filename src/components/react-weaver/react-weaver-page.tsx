
"use client";
import React, { useRef } from 'react';
import { DesignProvider, useDesign } from '@/contexts/design-context';
import Header from './header';
import ComponentLibraryPanel from './component-library-panel';
import CanvasArea from './canvas-area';
import PropEditorPanel from './prop-editor-panel';
import CodePreviewDialog, { type CodePreviewDialogRef } from './code-preview-dialog';
import { useToast } from '@/hooks/use-toast';

const ReactWeaverApp: React.FC = () => {
  const { generateCode, isLoadingAi } = useDesign();
  const { toast } = useToast();
  const codeDialogRef = useRef<CodePreviewDialogRef>(null);

  const handleGenerateCode = async () => {
    toast({ title: "Generating Code...", description: "AI is crafting your React components." });
    const code = await generateCode();
    if (codeDialogRef.current) {
      codeDialogRef.current.open(code);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header onGenerateCodeClick={handleGenerateCode} />
      <main className="flex flex-1 overflow-hidden">
        <ComponentLibraryPanel />
        <CanvasArea />
        <PropEditorPanel />
      </main>
      <CodePreviewDialog ref={codeDialogRef} />
      {isLoadingAi && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg text-sm z-50">
          AI is working...
        </div>
      )}
    </div>
  );
};


const ReactWeaverPage: React.FC = () => {
  return (
    <DesignProvider>
      <ReactWeaverApp />
    </DesignProvider>
  );
};

export default ReactWeaverPage;
