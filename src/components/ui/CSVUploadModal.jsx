
import React, { Fragment, useRef, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import * as XLSX from "xlsx";

const CSVUploadModal = ({
  activeModal,
  onClose,
  title = "Bulk Upload CSV",
  csvState = {},
  onFileSelect,
  onUpload,
  onReset,
  onDownloadTemplate,
  templateInstructions,
  accept = ".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
  maxSizeMB = 10,
  isLoading = false
}) => {
  const { 
    file, 
    uploading = false, 
    progress = 0, 
    validationErrors = [], 
    results 
  } = csvState;

  const fileInputRef = useRef(null);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [errorSearchTerm, setErrorSearchTerm] = useState('');
  const [errorFilterType, setErrorFilterType] = useState('all');

  // Group errors by type
  const groupedErrors = useMemo(() => {
    const groups = {};
    validationErrors.forEach(error => {
      let type = 'Other';
      if (error.includes('fuel name')) type = 'Fuel Name Issues';
      else if (error.includes('stakeholder')) type = 'Stakeholder Issues';
      else if (error.includes('building code')) type = 'Building Code Issues';
      else if (error.includes('vehicle classification')) type = 'Vehicle Classification Issues';
      else if (error.includes('vehicle type')) type = 'Vehicle Type Issues';
      else if (error.includes('distance')) type = 'Distance Issues';
      else if (error.includes('date')) type = 'Date Issues';
      else if (error.includes('quality')) type = 'Quality Control Issues';
      else if (error.includes('weight')) type = 'Weight Loaded Issues';
      else if (error.includes('unit')) type = 'Unit Issues';
      
      if (!groups[type]) groups[type] = [];
      groups[type].push(error);
    });
    return groups;
  }, [validationErrors]);

  // Filter errors based on search term and type filter
  const filteredErrors = useMemo(() => {
    let filtered = validationErrors;
    
    // Filter by type
    if (errorFilterType !== 'all') {
      filtered = filtered.filter(error => {
        if (errorFilterType === 'Fuel Name Issues') return error.includes('fuel name');
        if (errorFilterType === 'Stakeholder Issues') return error.includes('stakeholder');
        if (errorFilterType === 'Building Code Issues') return error.includes('building code');
        if (errorFilterType === 'Vehicle Classification Issues') return error.includes('vehicle classification');
        if (errorFilterType === 'Vehicle Type Issues') return error.includes('vehicle type');
        if (errorFilterType === 'Distance Issues') return error.includes('distance');
        if (errorFilterType === 'Date Issues') return error.includes('date');
        if (errorFilterType === 'Quality Control Issues') return error.includes('quality');
        if (errorFilterType === 'Weight Loaded Issues') return error.includes('weight');
        if (errorFilterType === 'Unit Issues') return error.includes('unit');
        return false;
      });
    }
    
    // Filter by search term
    if (errorSearchTerm) {
      filtered = filtered.filter(error => 
        error.toLowerCase().includes(errorSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [validationErrors, errorSearchTerm, errorFilterType]);

  // Memoize handlers to prevent recreation on every render
  const handleFileInputChange = useMemo(() => (e) => {
    const selectedFile = e?.target?.files?.[0];
    if (selectedFile && onFileSelect) {
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const handleBrowseClick = useMemo(() => () => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, [uploading]);

  const handleReset = useMemo(() => () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (!uploading && onReset) {
      onReset();
    }
    setShowAllErrors(false);
    setErrorSearchTerm('');
    setErrorFilterType('all');
  }, [uploading, onReset]);

// Update the handleClose function for the backdrop/overlay
const handleBackdropClose = useMemo(() => () => {
  // Prevent closing via backdrop if file is selected OR uploading
  if (uploading || file) {
    return; // Silently prevent close via backdrop
  }
  handleReset();
  if (onClose) {
    onClose();
  }
}, [uploading, file, onClose, handleReset]);

// Keep the existing handleClose for the cancel button and close button
const handleClose = useMemo(() => () => {
  handleReset();
  if (onClose) {
    onClose();
  }
}, [onClose, handleReset]);
  // Export errors to file
  const exportErrors = () => {
    const errorText = validationErrors.join('\n');
    const blob = new Blob([errorText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation_errors_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Default template instructions if not provided
  const defaultInstructions = useMemo(() => (
    <ol className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1 list-decimal pl-3 sm:pl-4">
      <li>Download the template below</li>
      <li>Fill in your data (keep column headers as is)</li>
      <li>Save as CSV file</li>
      <li>Upload using the form below</li>
      <li>Review validation results and submit</li>
    </ol>
  ), []);

  return (
    <Transition appear={activeModal} show={activeModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[99999]"
        onClose={handleBackdropClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[95%] sm:max-w-md md:max-w-lg transform overflow-hidden rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                {/* Header - Responsive */}
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-base sm:text-lg md:text-xl font-semibold leading-6 text-gray-900 truncate pr-2"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                    disabled={uploading}
                  >
                    <Icon icon="heroicons:x-mark" className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Instructions - Responsive */}
                <div className="text-slate-700 leading-relaxed mb-6 bg-gray-100 rounded-lg border-l-4 border-primary-400 p-2 pl-4 m-4 justify-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="flex items-start">
                      <Icon icon="heroicons:information-circle" className="w-5 h-5 sm:w-6 sm:h-6 text-black-500 flex-shrink-0 mr-2" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-black-800 mb-0.5 sm:mb-1">
                          How to upload:
                        </h4>
                        <div className="text-xs sm:text-sm ">
                          {templateInstructions || defaultInstructions}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Download Button - Responsive */}
                {onDownloadTemplate && (
                  <div className="mb-3 sm:mb-4 -mt-2 text-center">
                    <Button
                      text="Download Template & Instructions"
                      className="btn-dark w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                      onClick={onDownloadTemplate}
                      icon="heroicons:document-arrow-down"
                      disabled={uploading}
                      size="sm"
                    />
                  </div>
                )}

                {/* File Upload Area - Responsive */}
                <div className={`mb-2 sm:mb-4 border-2 border-dashed rounded-lg p-3 sm:p-4 md:p-5 text-center transition-colors ${
                  uploading
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-500'
                }`}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="csvUploadInput"
                    accept={accept}
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploading}
                  />

                  <div className={uploading ? 'pointer-events-none opacity-70' : ''}>
                    <Icon
                      icon={
                        uploading 
                          ? "heroicons:arrow-path" 
                          : file 
                            ? "heroicons:check-circle" 
                            : "heroicons:cloud-arrow-up"
                      }
                      className={`w-8 h-8 sm:w-10 sm:h-12 md:w-12 md:h-12 mx-auto ${
                        uploading
                          ? 'text-primary-500 animate-spin'
                          : file
                            ? 'text-green-500'
                            : 'text-gray-400'
                      }`}
                    />
                    
                    {file ? (
                      <div className="space-y-1 sm:space-y-2">
                        <div className="flex items-center justify-center text-green-600 px-2">
                          <Icon icon="heroicons:check-circle" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium truncate max-w-[180px] sm:max-w-xs">
                            {file.name}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {uploading ? 'Upload in progress...' : 'Click to change file'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-sm sm:text-base md:text-lg font-medium text-gray-700 px-2">
                          Choose file or drag & drop
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          xlsx, xls, and csv files only (max {maxSizeMB}MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {!uploading && !file && (
                    <div className="mt-2 sm:mt-3">
                      <Button
                        text="Browse Files"
                        className="btn font-normal btn-sm bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white border-0 hover:opacity-90"
                        onClick={handleBrowseClick}
                        size="sm"
                      />
                    </div>
                  )}

                  {file && !uploading && (
                    <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 px-2">
                      <Button
                        text="Change File"
                        className="btn-outline-primary w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5"
                        onClick={handleBrowseClick}
                        size="sm"
                      />
                      <Button
                        text="Remove"
                        className="btn-outline-danger w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5"
                        onClick={handleReset}
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                {/* Enhanced Validation Errors Section */}
                {validationErrors.length > 0 && !uploading && (
                  <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h4 className="font-semibold text-xs sm:text-sm text-yellow-800 flex items-center">
                        <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span>Validation Errors ({validationErrors.length})</span>
                      </h4>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Export button */}
                        <button
                          onClick={exportErrors}
                          className="text-xs text-yellow-600 hover:text-yellow-800 flex items-center gap-1 px-2 py-1 rounded border border-yellow-300 hover:bg-yellow-100 transition-colors"
                        >
                          <Icon icon="heroicons:arrow-down-tray" className="w-3 h-3" />
                          Export
                        </button>
                        
                        {/* Expand/Collapse button */}
                        {validationErrors.length > 10 && (
                          <button
                            onClick={() => setShowAllErrors(!showAllErrors)}
                            className="text-xs text-yellow-700 hover:text-yellow-900 font-medium flex items-center gap-1 px-2 py-1 rounded border border-yellow-300 hover:bg-yellow-100 transition-colors"
                          >
                            <Icon icon={showAllErrors ? "heroicons:chevron-up" : "heroicons:chevron-down"} className="w-3 h-3" />
                            {showAllErrors ? "Collapse" : `Show All (${validationErrors.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Error Type Filters */}
                    {Object.keys(groupedErrors).length > 1 && (
                      <div className="mb-3 p-2 bg-yellow-100 rounded-lg">
                        <div className="text-xs font-semibold text-yellow-800 mb-2">Filter by type:</div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setErrorFilterType('all')}
                            className={`text-xs px-2 py-1 rounded-full transition-colors ${
                              errorFilterType === 'all'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-white text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                            }`}
                          >
                            All ({validationErrors.length})
                          </button>
                          {Object.entries(groupedErrors).map(([type, errors]) => (
                            <button
                              key={type}
                              onClick={() => setErrorFilterType(type)}
                              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                errorFilterType === type
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-white text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                              }`}
                            >
                              {type} ({errors.length})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Search input */}
                    <div className="mb-3">
                      <div className="relative">
                        <Icon 
                          icon="heroicons:magnifying-glass" 
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-yellow-500"
                        />
                        <input
                          type="text"
                          placeholder="Search errors..."
                          value={errorSearchTerm}
                          onChange={(e) => setErrorSearchTerm(e.target.value)}
                          className="w-full pl-6 pr-8 py-1.5 text-xs border border-yellow-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                        {errorSearchTerm && (
                          <button
                            onClick={() => setErrorSearchTerm('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-700"
                          >
                            <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Error list */}
                    <div className={`overflow-y-auto text-xs sm:text-sm transition-all duration-300 ${
                      showAllErrors ? 'max-h-96' : 'max-h-32 sm:max-h-40'
                    }`}>
                      {filteredErrors.length === 0 ? (
                        <p className="text-yellow-600 py-2 text-center">No matching errors found</p>
                      ) : (
                        filteredErrors.map((error, index) => (
                          <p key={index} className="text-yellow-700 py-1 border-b border-yellow-100 last:border-0 break-words hover:bg-yellow-100 transition-colors px-1">
                            <span className="font-mono text-xs text-yellow-600 mr-2 inline-block">#{index + 1}</span>
                            {error}
                          </p>
                        ))
                      )}
                    </div>
                    
                    {/* Show more button for collapsed view */}
                    {!showAllErrors && validationErrors.length > 10 && filteredErrors.length > 10 && errorFilterType === 'all' && !errorSearchTerm && (
                      <div className="mt-3 text-center pt-2 border-t border-yellow-200">
                        <button
                          onClick={() => setShowAllErrors(true)}
                          className="text-xs text-yellow-600 hover:text-yellow-800 font-medium flex items-center justify-center gap-1 w-full"
                        >
                          <Icon icon="heroicons:chevron-down" className="w-3 h-3" />
                          Show {validationErrors.length - 10} more errors
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Progress - Responsive */}
                {uploading && (
                  <div className="mb-3 sm:mb-6 space-y-2 bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between text-xs sm:text-sm font-medium">
                      <span>Uploading records...</span>
                      <span className="text-primary-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div
                        className="bg-primary-500 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-1 sm:mt-2">
                      Please wait, do not close this window
                    </p>
                  </div>
                )}

                {/* Action Buttons - Responsive */}
                <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 space-y-2 space-y-reverse sm:space-y-0 ">
                  <Button
                    text="Cancel"
                    className="btn-light w-full sm:w-auto text-xs sm:text-sm px-4 py-1.5 sm:py-2"
                    onClick={handleClose}
                    disabled={uploading}
                    size="sm"
                  />
                  
                  {/* {onDownloadTemplate && !file && (
                    <Button
                      text="Download Template"
                      className="btn-dark w-full sm:w-auto text-xs sm:text-sm px-4 py-1.5 sm:py-2"
                      onClick={onDownloadTemplate}
                      disabled={uploading}
                      size="sm"
                    />
                  )} */}
                  
                  {file && !uploading && validationErrors.length === 0 && (
                    <Button
                      text="Upload CSV"
                      className="btn-primary w-full sm:w-auto text-xs sm:text-sm px-4 py-1.5 sm:py-2"
                      onClick={onUpload}
                      disabled={uploading}
                      loading={isLoading || uploading}
                      size="sm"
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CSVUploadModal;

