
"use client";
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconCopy, IconDownload } from './icons';
import { useToast } from '@/hooks/use-toast';
import { downloadTextFile } from '@/lib/download';

export interface CodePreviewDialogRef {
  open: (code: string) => void;
}

interface CodePreviewDialogProps {}

const CodePreviewDialog = forwardRef<CodePreviewDialogRef, CodePreviewDialogProps>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    open: (code) => {
      setGeneratedCode(code);
      setIsOpen(true);
    },
  }));

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast({ title: "Copied!", description: "Code copied to clipboard." });
    } catch (err) {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy code to clipboard." });
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownloadCode = () => {
    downloadTextFile('react-weaver-generated.tsx', generatedCode, 'text/typescript-jsx');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl w-full h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="font-headline text-primary">Generated React Code</DialogTitle>
          <DialogDescription>
            Review and copy the generated code for your design.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-0 overflow-hidden">
          <pre className="text-xs bg-muted/30 p-6 whitespace-pre-wrap break-all h-full">
            <code>{generatedCode}</code>
          </pre>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t gap-2">
          <Button variant="outline" onClick={handleCopyCode}>
            <IconCopy className="mr-2 h-4 w-4" /> Copy Code
          </Button>
          <Button onClick={handleDownloadCode}>
            <IconDownload className="mr-2 h-4 w-4" /> Download .tsx
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CodePreviewDialog.displayName = 'CodePreviewDialog';
export default CodePreviewDialog;
