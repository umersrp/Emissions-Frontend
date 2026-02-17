import React, { Fragment, useRef, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

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
  accept = ".csv",
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
  }, [uploading, onReset]);

  const handleClose = useMemo(() => () => {
    if (uploading) {
      return; // Silently prevent close during upload
    }
    handleReset();
    if (onClose) {
      onClose();
    }
  }, [uploading, onClose, handleReset]);

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
        onClose={handleClose}
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
                <div className="mb-2 sm:mb-4">
                  <div className="bg-blue-50 p-3  sm:p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Icon 
                        icon="heroicons:information-circle" 
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-blue-800 mb-0.5 sm:mb-1">
                          How to upload:
                        </h4>
                        <div className="text-xs sm:text-sm">
                          {templateInstructions || defaultInstructions}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Download Button - Responsive */}
                {onDownloadTemplate && (
                  <div className="mb-2 sm:mb-4 text-center">
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
                          Choose CSV file or drag & drop
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {accept.toUpperCase()} files only (max {maxSizeMB}MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {!uploading && !file && (
                    <div className="mt-2 sm:mt-3">
                      <Button
                        text="Browse Files"
                        className="btn-outline-primary w-full sm:w-auto text-xs sm:text-sm px-4 py-1.5"
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

                {/* Validation Errors - Responsive */}
                {validationErrors.length > 0 && !uploading && (
                  <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h4 className="font-semibold text-xs sm:text-sm text-yellow-800 flex items-center">
                        <Icon icon="heroicons:exclamation-triangle" className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span>Validation Errors ({validationErrors.length})</span>
                      </h4>
                    </div>
                    <div className="max-h-32 sm:max-h-40 overflow-y-auto text-xs sm:text-sm">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <p key={index} className="text-yellow-700 py-1 border-b border-yellow-100 last:border-0 break-words">
                          {error}
                        </p>
                      ))}
                      {validationErrors.length > 10 && (
                        <p className="text-yellow-600 py-1.5 sm:py-2 text-center text-xs sm:text-sm font-medium">
                          ... and {validationErrors.length - 10} more errors
                        </p>
                      )}
                    </div>
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
                  
                  {onDownloadTemplate && !file && (
                    <Button
                      text="Download Template"
                      className="btn-dark w-full sm:w-auto text-xs sm:text-sm px-4 py-1.5 sm:py-2"
                      onClick={onDownloadTemplate}
                      disabled={uploading}
                      size="sm"
                    />
                  )}
                  
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