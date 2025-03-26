import { useState, useRef } from 'react';
import { Download, Upload, X } from 'lucide-react';
import axios from 'axios';

const ImageUploader = () => {
  const [personImage, setPersonImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const personImageInputRef = useRef(null);
  const garmentImageInputRef = useRef(null);
  const [garmentType, setGarmentType] = useState('Upper');
  const [selectedModel, setSelectedModel] = useState('viton_hd'); // Default to model1

  // Example Garments types array
  const garmentTypes = [
    { value: 'upper_body', label: 'Upper Body' },
    { value: 'lower_body', label: 'Lower Body' },
    { value: 'dresses', label: 'Full Body' }
  ];

  // AI Models available
  const aiModels = [
    { id: 'viton_hd', name: 'Model 1' },
    { id: 'dress_code', name: 'Model 2' }
  ];

  // Example images arrays
  const personExamples = [
    '/assets/images/img1.jpg',
    '/assets/images/img2.jpg',
    '/assets/images/img3.jpg',
    '/assets/images/img4.jpg',
    '/assets/images/img5.jpg'
  ];

  const garmentExamples = [
    '/assets/images/t1.jpg',
    '/assets/images/t2.jpg',
    '/assets/images/t3.jpg',
    '/assets/images/t4.jpg',
    '/assets/images/t5.jpg'
  ];

  // Upload Image function
  const handleFileUpload = (setter) => (event) => {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setter(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop function
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (setter) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download function
  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'virtual-try-on-result.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ImageUploadBox = ({
    image,
    title,
    onDrop,
    inputRef,
    onFileChange,
    examples,
    onExampleSelect,
    onRemoveImage
  }) => (
    <div className="space-y-2">
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-72 w-full hover:border-blue-500 transition-colors"
        onDragOver={handleDragOver}
        onDrop={onDrop}
      >
        {image ? (
          <>
            <img
              src={image}
              alt={`${title} preview`}
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              aria-label={`Remove ${title}`}
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <input
              type="file"
              ref={inputRef}
              onChange={onFileChange}
              className="hidden"
              accept="image/*"
            />
            <div
              onClick={() => inputRef.current.click()}
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500">
                Drop {title} Here
                <br />
                - or -
                <br />
                Click to Upload
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Example Images */}
      {examples && examples.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Example images:</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {examples.map((exampleSrc, index) => (
              <img
                key={index}
                src={exampleSrc}
                alt={`Example ${title} ${index + 1}`}
                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => onExampleSelect(exampleSrc)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleGenerate = async () => {
    if (!personImage || !garmentImage) {
      alert("Please upload both person and garment images before generating");
      return;
    }

    try {
      setLoading(true);
      setGeneratedImage(null);

      const url = `${import.meta.env.VITE_API_URL}/model/generate`;
      const formData = new FormData();

      const personBlob = await fetch(personImage).then(r => r.blob());
      const garmentBlob = await fetch(garmentImage).then(r => r.blob());

      formData.append("model_image", personBlob, "person.jpg");
      formData.append("garment_image", garmentBlob, "garment.jpg");
      formData.append("clothes_type", garmentType);
      formData.append("model_type", selectedModel);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      if (response.data.error === false) {
        setGeneratedImage(response.data.results.result?.url);
      } else {
        alert("Image generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className='text-center text-2xl font-bold my-4'>Nomadiques AI Model</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {/* Model Image Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Model Image</h2>
          <ImageUploadBox
            image={personImage}
            title="Person"
            onDrop={handleDrop(setPersonImage)}
            inputRef={personImageInputRef}
            onFileChange={handleFileUpload(setPersonImage)}
            examples={personExamples}
            onExampleSelect={setPersonImage}
            onRemoveImage={() => setPersonImage(null)}
          />
        </div>

        {/* Garment Image Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Garment Image</h2>
          <ImageUploadBox
            image={garmentImage}
            title="Garment"
            onDrop={handleDrop(setGarmentImage)}
            inputRef={garmentImageInputRef}
            onFileChange={handleFileUpload(setGarmentImage)}
            examples={garmentExamples}
            onExampleSelect={setGarmentImage}
            onRemoveImage={() => setGarmentImage(null)}
          />
        </div>

        {/* Generated Image Display */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Generated Image</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-72 w-full bg-gray-50">
            {loading ? (
              <p className="text-gray-500">Generating...<br /> Please wait</p>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated person with garment"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p className="text-gray-500 text-center">
                Generated image will appear here
                <br />
                after you upload both images
                <br />
                and click Generate
              </p>
            )}
          </div>
          
          {/* Model Selection, Garment Type and Buttons */}
          <div className="mt-4 space-y-4">
            {/* AI Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select AI Model
              </label>
              <div className="flex space-x-4">
                {aiModels.map((model) => (
                  <div key={model.id} className="flex items-center">
                    <input
                      type="radio"
                      id={model.id}
                      name="aiModel"
                      value={model.id}
                      checked={selectedModel === model.id}
                      onChange={() => setSelectedModel(model.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <label htmlFor={model.id} className="ml-2 block text-sm text-gray-700">
                      {model.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Garment Type Dropdown */}
            <div>
              <label htmlFor="garment-type" className="block text-sm font-medium text-gray-700 mb-1">
                Garment Type
              </label>
              <select
                id="garment-type"
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {garmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="w-full">
              <button
                className="bg-blue-500 w-full text-white my-1 px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                onClick={handleGenerate}
                disabled={!personImage || !garmentImage || loading}
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
              <button
                className="bg-green-500 w-full text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:bg-green-300 disabled:cursor-not-allowed"
                onClick={handleDownload}
                disabled={!generatedImage}
              >
                <Download className="w-5 h-5" />
                <p className='text-center'>Download Image</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;