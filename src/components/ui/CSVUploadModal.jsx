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
    <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                    disabled={uploading}
                  >
                    <Icon icon="heroicons:x-mark" className="w-6 h-6" />
                  </button>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Icon 
                        icon="heroicons:information-circle" 
                        className="w-5 h-5 text-blue-500 mt-0.5 mr-2" 
                      />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">How to upload:</h4>
                        {templateInstructions || defaultInstructions}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Download Button */}
                {onDownloadTemplate && (
                  <div className="mb-6 text-center">
                    <Button
                      text="Download Template & Instructions"
                      className="btn-outline-primary"
                      onClick={onDownloadTemplate}
                      icon="heroicons:document-arrow-down"
                      disabled={uploading}
                      size="sm"
                    />
                  </div>
                )}

                {/* File Upload Area */}
                <div className={`mb-6 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                      className={`w-12 h-12 mx-auto mb-3 ${
                        uploading
                          ? 'text-primary-500 animate-spin'
                          : file
                            ? 'text-green-500'
                            : 'text-gray-400'
                      }`}
                    />
                    
                    {file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center text-green-600">
                          <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
                          <span className="font-medium truncate max-w-xs">{file.name}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {uploading ? 'Upload in progress...' : 'Click to change file'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-700">
                          Choose CSV file or drag & drop
                        </p>
                        <p className="text-sm text-gray-500">
                          {accept.toUpperCase()} files only (max {maxSizeMB}MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {!uploading && !file && (
                    <div className="mt-4">
                      <Button
                        text="Browse Files"
                        className="btn-outline-primary"
                        onClick={handleBrowseClick}
                        size="sm"
                      />
                    </div>
                  )}

                  {file && !uploading && (
                    <div className="mt-4 flex justify-center space-x-2">
                      <Button
                        text="Change File"
                        className="btn-outline-primary"
                        onClick={handleBrowseClick}
                        size="sm"
                      />
                      <Button
                        text="Remove"
                        className="btn-outline-danger"
                        onClick={handleReset}
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && !uploading && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-yellow-800 flex items-center">
                        <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 mr-2" />
                        Validation Errors ({validationErrors.length})
                      </h4>
                    </div>
                    <div className="max-h-40 overflow-y-auto text-sm">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <p key={index} className="text-yellow-700 py-1 border-b border-yellow-100 last:border-0">
                          {error}
                        </p>
                      ))}
                      {validationErrors.length > 10 && (
                        <p className="text-yellow-600 py-2 text-center font-medium">
                          ... and {validationErrors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mb-6 space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Uploading records...</span>
                      <span className="text-primary-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2">
                      Please wait, do not close this window
                    </p>
                  </div>
                )}

             
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    text="Cancel"
                    className="btn-light"
                    onClick={handleClose}
                    disabled={uploading}
                    size="sm"
                  />
                  
                  {onDownloadTemplate && !file && (
                    <Button
                      text="Download Template"
                      className="btn-outline-primary"
                      onClick={onDownloadTemplate}
                      disabled={uploading}
                      size="sm"
                    />
                  )}
                  
                  {file && !uploading && validationErrors.length === 0 && (
                    <Button
                      text="Upload CSV"
                      className="btn-primary"
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