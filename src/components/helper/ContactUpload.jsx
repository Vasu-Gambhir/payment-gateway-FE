import { useState, useRef } from "react";
import axios from "axios";
import { baseURL, getHeaders } from "../../helper";
import { toast } from "react-toastify";

const ContactUpload = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFiles = droppedFiles.filter(
      (file) => file.type === "text/csv" || file.name.endsWith(".csv")
    );

    if (csvFiles.length !== droppedFiles.length) {
      toast.warning("Only CSV files are allowed");
    }

    addFiles(csvFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    console.log(files[0]);
    const totalSize = [...files, ...newFiles].reduce(
      (acc, file) => acc + file.size,
      0
    );

    if (totalSize > 10 * 1024 * 1024) {
      toast.error("Total file size exceeds 10MB limit");
      return;
    }

    if (files.length + newFiles.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsUploading(true);

    try {
      const headers = getHeaders(localStorage.getItem("token"));

      // Process all files in parallel using promise.allsettled rather than looping
      // over all files and processing them one by once
      const uploadPromises = files.map(async (file) => {
        try {
          const csvContent = await readFileAsText(file);

          const response = await axios.post(
            `${baseURL}/users/uploadContacts`,
            {
              csvData: csvContent,
              filename: file.name,
            },
            headers
          );

          if (response.status === 200) {
            return {
              status: "fulfilled",
              filename: file.name,
              totalNewContacts: response.data.totalNewContacts,
            };
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          return {
            status: "rejected",
            filename: file.name,
            error: fileError,
          };
        }
      });

      const results = await Promise.allSettled(uploadPromises);

      let totalNewContacts = 0;
      let failedFiles = [];

      results.forEach((result) => {
        if (
          result.status === "fulfilled" &&
          result.value?.status === "fulfilled"
        ) {
          totalNewContacts += result.value.totalNewContacts;
        } else if (
          result.status === "fulfilled" &&
          result.value?.status === "rejected"
        ) {
          failedFiles.push(result.value.filename);
        }
      });

      // Report failed files in the UI
      if (failedFiles.length > 0) {
        toast.error(`Failed to process: ${failedFiles.join(", ")}`);
      }

      if (totalNewContacts > 0) {
        toast.success(`Successfully uploaded ${totalNewContacts} new contacts`);
      } else if (failedFiles.length === 0) {
        toast.info("No new contacts were added");
      }

      setFiles([]);
      if (onUploadSuccess) {
        onUploadSuccess({ totalNewContacts });
      }
    } catch (error) {
      console.error("Error uploading contacts:", error);
      toast.error("Failed to upload contacts");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Upload Contacts
      </h2>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-gray-600 mb-2">Drag and drop CSV files here, or</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Browse Files
        </button>

        <p className="text-sm text-gray-500 mt-2">
          CSV format: firstName, lastName, phoneNumber
        </p>
        <p className="text-xs text-gray-400 mt-1">Max 10 files, 10MB total</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Selected Files:</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer"
            }`}
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactUpload;
