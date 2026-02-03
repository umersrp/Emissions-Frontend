import React, { useRef } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/Icon';

const CSVUploadModal = ({
  activeModal,
  onClose,
  title = "Bulk Upload",
  csvState,
  onFileSelect,
  onUpload,
  onReset,
  onDownloadTemplate,
  templateInstructions,
  acceptFileType = '.csv',
  maxSizeMB = 10,
}) => {
  const { file, uploading, progress, validationErrors, results } = csvState;
  const fileInputRef = useRef(null);

  const handleFileInputChange = (e) => {
    // Safely handle the file input change
    const selectedFile = e?.target?.files?.[0];
    if (selectedFile && onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear previous selection
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onReset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      activeModal={activeModal}
      onClose={handleClose}
      title={title}
      themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
      centered
      sizeClass="max-w-3xl"
    >
      <div className="p-6 space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">How to upload:</h4>
              {templateInstructions || (
                <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
                  <li>Download the template below</li>
                  <li>Fill in your data</li>
                  <li>Save as CSV file</li>
                  <li>Upload using the form below</li>
                  <li>Review validation results and submit</li>
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Template Download */}
        {onDownloadTemplate && (
          <div className="flex justify-center">
            <Button
              text="Download Template & Instructions"
              className="btn-primary"
              onClick={onDownloadTemplate}
              icon="heroicons:document-arrow-down"
            />
          </div>
        )}

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            id="csvUploadInput"
            accept={acceptFileType}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />

          <label htmlFor="csvUploadInput" className="cursor-pointer block">
            <Icon 
              icon={uploading ? "heroicons:arrow-path" : "heroicons:cloud-arrow-up"} 
              className={`w-12 h-12 mx-auto mb-3 ${uploading ? 'text-primary-500 animate-spin' : 'text-slate-400'}`}
            />
            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center text-green-600">
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <p className="text-sm text-slate-500">
                  Click to change file or drag & drop new CSV
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-slate-700">
                  Choose CSV file or drag & drop
                </p>
                <p className="text-sm text-slate-500">
                  {acceptFileType.toUpperCase()} files only (max {maxSizeMB}MB)
                </p>
              </div>
            )}
          </label>

          <div className="mt-4">
            <Button
              text="Browse Files"
              className="btn-outline-primary"
              onClick={handleBrowseClick}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-yellow-800 flex items-center">
                <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 mr-2" />
                Validation Errors ({validationErrors.length})
              </h4>
              <Button
                text="Download Errors"
                className="btn-outline-yellow btn-xs"
                onClick={() => {
                  const errorText = validationErrors.join('\n');
                  const blob = new Blob([errorText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'validation_errors.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            </div>
            <div className="max-h-40 overflow-y-auto text-sm">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-yellow-700 py-1 border-b border-yellow-100 last:border-0">
                  {error}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Results */}
        {/* {results && (
          <div className={`p-4 rounded-lg ${results.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <h4 className="font-semibold mb-3">Upload Results</h4>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{results.success}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{results.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{results.success + results.failed}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </div>
            {results.errors.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium text-red-700 mb-2">Error Details:</h5>
                <div className="max-h-32 overflow-y-auto text-sm">
                  {results.errors.map((err, idx) => (
                    <div key={idx} className="text-red-600 py-1 border-b border-red-100 last:border-0">
                      <span className="font-medium">Row {err.row}:</span> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            text="Cancel"
            className="btn-light"
            onClick={handleClose}
            disabled={uploading}
          />
          <Button
            text={uploading ? 'Uploading...' : 'Upload CSV'}
            className="btn-primary"
            onClick={onUpload}
            disabled={!file || validationErrors.length > 0 || uploading}
            loading={uploading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CSVUploadModal;