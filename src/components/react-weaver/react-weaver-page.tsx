
"use client";
import React, { useRef } from 'react';
import { DesignProvider, useDesign } from '@/contexts/design-context';
import Header from './header';
import ComponentLibraryPanel from './component-library-panel';
import CanvasArea from './canvas-area';
import PropEditorPanel from './prop-editor-panel';
// CodePreviewDialog and CodePreviewDialogRef are no longer used directly here
// import CodePreviewDialog, { type CodePreviewDialogRef } from './code-preview-dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DesignPreviewRenderer from './design-preview-renderer';

const ReactWeaverApp: React.FC = () => {
  const { components } = useDesign();
  const { toast } = useToast();
  // const codeDialogRef = useRef<CodePreviewDialogRef>(null); // No longer used

  // handleGenerateCode function was removed

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <Tabs defaultValue="editor" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-center border-b">
          <TabsList className="bg-transparent p-0 rounded-none">
            <TabsTrigger value="editor" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary px-4">Editor</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary px-4" disabled={components.length === 0}>Preview</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="editor"
          className="mt-0 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:overflow-hidden"
        >
          <main className="flex flex-1 overflow-hidden">
            <ComponentLibraryPanel />
            <CanvasArea />
            <PropEditorPanel />
          </main>
        </TabsContent>
        <TabsContent
          value="preview"
          className="mt-0 bg-muted/20 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:overflow-hidden"
        >
          {components.length > 0 ? (
            <DesignPreviewRenderer />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Add components to the canvas in the Editor tab to see a preview.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      {/* <CodePreviewDialog ref={codeDialogRef} /> */}
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
