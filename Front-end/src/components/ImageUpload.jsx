import React, { useRef } from "react";
import { UserIcon, CameraIcon } from "../Icons"; // Make sure to create/have CameraIcon

const ImageUpload = ({ preview, onFileChange, existingAvatar }) => {
  const fileInputRef = useRef(null);
  const currentPreview = preview || existingAvatar;

  return (
    <div className="flex flex-col items-center" aria-label="Avatar uploader">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
          {currentPreview ? (
            <img
              src={currentPreview}
              alt="Avatar Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              <UserIcon size={30} />
            </span>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="absolute bottom-1 right-1 bg-[#FE4982] text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:bg-[#e63a6d] transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
          aria-label="Upload new photo"
        >
          <CameraIcon className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Click the camera to upload a photo
      </p>
    </div>
  );
};

export default ImageUpload;
