import React, { useRef } from "react";
import { axiosPrivate } from "../../../api/axios";

function ImageUploader(appointment_id) {
  const fileInputRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();

  const handleFileUpload = async () => {
    const selectedFile = fileInputRef.current.files[0];

    if (!selectedFile) return;

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("folderName", `Appointment-${appointment_id}`);

    try {
      const path = "/patient/appointment/uploadImage";
      const resp = await axiosPrivate.post(path, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // console.log(resp);
      // console.log("File uploaded successfully");
    } catch (error) {
      // console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      <button
        className="block bg-blue-500 border border-white text-white px-4 py-2 rounded-md cursor-pointer"
        onClick={() => fileInputRef.current.click()}
      >
        Upload Image
      </button>
    </div>
  );
}

export default ImageUploader;
