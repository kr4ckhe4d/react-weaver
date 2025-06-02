
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { IconDownload } from './icons'; // IconCode removed
import { useDesign } from '@/contexts/design-context';
// CodePreviewDialogRef import removed
import { downloadTextFile } from '@/lib/download';

interface HeaderProps {
  // onGenerateCodeClick prop removed
}

const Header: React.FC<HeaderProps> = (/*{ onGenerateCodeClick }*/) => {
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
        {/* Generate React Code button removed */}
      </div>
    </header>
  );
};

export default Header;
