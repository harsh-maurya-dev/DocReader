import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from "../assets/logo.png";
import axios from 'axios';

const UploadFile = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadTime, setUploadTime] = useState(null);
    const [driverTime, setDriverTime] = useState(null);
    const [progress, setProgress] = useState(0);
    const VITE_UPLOAD_URL = 'http://13.202.126.119:8001/'

    useEffect(() => {
        let interval;
        if (isLoading) {
            // Simulate progress over 5 minutes (300 seconds)
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 95) { // Only progress to 95% automatically
                        return prev + (100 / (300 / 0.5)); // Update every 500ms
                    }
                    return prev;
                });
            }, 500);
        } else {
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const uploadedFile = e.dataTransfer.files[0];
        validateAndSetFile(uploadedFile);
    };

    const handleChange = (e) => {
        const uploadedFile = e.target.files[0];
        validateAndSetFile(uploadedFile);
    };

    const validateAndSetFile = (uploadedFile) => {
        if (!uploadedFile) {
            toast.error('Please select a file');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (uploadedFile.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setFile(uploadedFile);
    };

    const removeFile = () => {
        setFile(null);
    };

    const uploadPDF = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const startTime = Date.now();
        const response = await axios.post(`${VITE_UPLOAD_URL}/upload/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setUploadTime(((Date.now() - startTime) / 1000).toFixed(1));
        return response;
    };

    const runDriver = async () => {
        const startTime = Date.now();
        const response = await axios.post(`${VITE_UPLOAD_URL}/run-driver/`);
        setDriverTime(((Date.now() - startTime) / 1000).toFixed(1));
        setProgress(100); // Complete the progress bar
        return response;
    };

    const handleClick = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        try {
            setIsLoading(true);
            setUploadTime(null);
            setDriverTime(null);
            setProgress(0);
            
            const uploadResponse = await uploadPDF(file);
            if (uploadResponse.status === 200) {
                const driverResponse = await runDriver();
                if (driverResponse.status === 200) {
                    toast.success('Document uploaded and processed successfully!', {
                        icon: "🎉"
                    });
                    console.log(driverResponse);
                    setFile(null);
                }
            }
        } catch (error) {
            toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-center h-screen w-screen bg-custom'>
            <div className="w-full rounded-xl max-w-2xl mx-auto p-10 bg-[#ebeffe] shadow relative before:absolute before:-top-10 before:-left-0 before:w-1/2 before:h-1/2 before:bg-no-repeat before:bg-center before:bg-cover before:content-[''] before:bg-[url('https://www.techgropse.com/common/images/common_icons/animate.svg')] overflow-hidden">
                <div className="text-center flex justify-center items-center w-full flex-col gap-4">
                    <img src={logo} className='' alt="logo" />
                    <h2 className="text-[22px] font-semibold mb-2 text-gray-500 pb-4">Upload PDF File</h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="w-full max-w-md">
                            {/* Progress bar container */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                {/* Animated progress bar */}
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            {/* Progress percentage */}
                            <div className="text-center mt-2 text-sm text-gray-600">
                                {progress.toFixed(0)}%
                            </div>
                        </div>
                        <p className="mt-4 text-lg text-gray-600">Processing your document...</p>
                        <p className="mt-2 text-sm text-gray-500">Estimated time: 4-5 minutes</p>
                    </div>
                ) : (
                    <>
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 bg-white ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-md text-gray-600 py-2">{file.name}</span>
                                    <button
                                        onClick={removeFile}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={30} className='cursor-pointer' />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-4 text-lg font-medium">Select a file or drag and drop here</p>
                                    <p className="mt-2 text-sm text-gray-500">PDF file size no more than 10MB</p>
                                    <button
                                        onClick={() => document.querySelector('input[type="file"]').click()}
                                        className="mt-4 px-4 py-2 text-sm text-white bg-[#1A81FF] border rounded-md cursor-pointer"
                                    >
                                        SELECT FILE
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleChange}
                                accept=".pdf"
                            />
                        </div>

                        <div className="flex items-end justify-end mt-6">
                            <button
                                className={`py-2 rounded bg-[#1A81FF] text-white px-10 ${!file ? 'cursor-not-allowed opacity-50' : ''}`}
                                disabled={!file || isLoading}
                                onClick={handleClick}
                            >
                                Upload
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UploadFile;