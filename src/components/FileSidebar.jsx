import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, FileText, X, Settings as SettingsIcon } from 'lucide-react';

const FileSidebar = ({ onViewFile, onSelectionChange, viewedFile, onOpenSettings }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileNames, setSelectedFileNames] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const allowedTypes = ['.edi', '.out', '.int', '.in'];
    const filteredFiles = newFiles.filter(file =>
      allowedTypes.some(type => file.name.toLowerCase().endsWith(type)) &&
      !uploadedFiles.some(existingFile => existingFile.name === file.name)
    );
    setUploadedFiles(prevFiles => [...prevFiles, ...filteredFiles]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = (fileToRemove, e) => {
    e.stopPropagation();
    setUploadedFiles(uploadedFiles.filter(file => file.name !== fileToRemove.name));
    const newSelection = selectedFileNames.filter(name => name !== fileToRemove.name);
    setSelectedFileNames(newSelection);
    onSelectionChange(uploadedFiles.filter(f => newSelection.includes(f.name)));
    if (viewedFile && viewedFile.name === fileToRemove.name) {
      onViewFile(null);
    }
  };

  const handleCheckboxChange = (file, checked) => {
    let newSelection;
    if (checked) {
      if (selectedFileNames.length < 5) {
        newSelection = [...selectedFileNames, file.name];
      } else {
        alert("You can select a maximum of 5 files for AI context.");
        return;
      }
    } else {
      newSelection = selectedFileNames.filter(name => name !== file.name);
    }
    setSelectedFileNames(newSelection);
    onSelectionChange(uploadedFiles.filter(f => newSelection.includes(f.name)));
  };

  return (
    <div className="h-full flex flex-col bg-card p-4">
      <div className="flex justify-between items-center pb-4 border-b">
        <h2 className="text-lg font-semibold">Files</h2>
        <Button variant="outline" size="sm" onClick={handleUploadClick}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".edi,.out,.int,.in"
        />
      </div>
      <div className="flex-grow overflow-y-auto pt-4 pr-2">
        {uploadedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <UploadCloud className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-semibold">No Files Uploaded</h3>
            <p className="text-sm">Click the 'Upload' button to get started.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <li
                key={index}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                  viewedFile && viewedFile.name === file.name
                    ? 'bg-primary/20'
                    : 'hover:bg-accent'
                }`}>
                <div className="flex items-center truncate gap-2 flex-grow">
                  <Checkbox
                    id={`file-${index}`}
                    checked={selectedFileNames.includes(file.name)}
                    onCheckedChange={(checked) => handleCheckboxChange(file, checked)}
                  />
                  <div
                    className="flex items-center truncate cursor-pointer flex-grow"
                    onClick={() => onViewFile(file)} >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate" title={file.name}>{file.name}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={(e) => handleRemoveFile(file, e)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t mt-2 flex-shrink-0">
        {selectedFileNames.length} of 5 files selected for AI context.
      </div>
    </div>
  );
};

export default FileSidebar;
