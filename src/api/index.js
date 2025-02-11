import axios from 'axios';

const API_BASE_URL = "http://13.202.126.119:8001";

/**
 * Upload PDF file to the server
 * @param {File} file - The PDF file to upload
 * @returns {Promise} Response from the server
 */
export const uploadPDF = async (file) => {
    try {
        if (!file) {
            throw new Error('File is required');
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
            headers: { 
                "Content-Type": "multipart/form-data"
            },
            // Add timeout to prevent infinite waiting
            timeout: 30000, // 30 seconds
        });

        return response.data;
    } catch (error) {
        // Log error for debugging
        console.error('Error uploading PDF:', error);
        
        // Throw a more user-friendly error
        throw new Error(
            error.response?.data?.message || 
            'Failed to upload PDF. Please try again.'
        );
    }
};

/**
 * Run the driver code on the server
 * @returns {Promise} Response from the server
 */
export const runDriver = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/run-driver/`, {
            // Add timeout to prevent infinite waiting
            timeout: 30000, // 30 seconds
        });

        return response.data;
    } catch (error) {
        console.error('Error running driver:', error);
        
        throw new Error(
            error.response?.data?.message || 
            'Failed to run driver. Please try again.'
        );
    }
};