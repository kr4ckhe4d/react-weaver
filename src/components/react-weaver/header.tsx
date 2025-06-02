
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { IconCode, IconDownload } from './icons';
import { useDesign } from '@/contexts/design-context';
import type { CodePreviewDialogRef } from './code-preview-dialog'; // Corrected import path
import { downloadTextFile } from '@/lib/download';

interface HeaderProps {
  onGenerateCodeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGenerateCodeClick }) => {
  const { getDesignJSON, components } = useDesign();

  const handleExportJson = () => {
    if (components.length === 0) {
        alert("Canvas is empty. Add some components before exporting.");
        return;
    }
    const json = getDesignJSON();
    downloadTextFile('react-weaver-design.json', json, 'application/json');
  };
  
  return (
    <header className="bg-card border-b border-panel-border p-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <h1 className="text-xl font-headline font-semibold text-primary">React Weaver</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExportJson} disabled={components.length === 0}>
          <IconDownload className="mr-2 h-4 w-4" />
          Export Design (JSON)
        </Button>
        <Button size="sm" onClick={onGenerateCodeClick} disabled={components.length === 0}>
          <IconCode className="mr-2 h-4 w-4" />
          Generate React Code
        </Button>
      </div>
    </header>
  );
};

export default Header;
