import { Check, FileVideo, Upload, X } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import axiosInstance from "@/lib/axiosinstance";
import { useTheme } from "@/lib/ThemeContext";

const VideoUploader = ({ channelId, channelName }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handlefilechange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size exceeds 100MB limit.");
        return;
      }
      setVideoFile(file);
      const filename = file.name;
      if (!videoTitle) {
        setVideoTitle(filename);
      }
    }
  };
  const resetForm = () => {
    setVideoFile(null);
    setVideoTitle("");
    setDescription("");
    setIsUploading(false);
    setUploadProgress(0);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const cancelUpload = () => {
    if (isUploading) {
      toast.error("Your video upload has been cancelled");
    }
  };
  const handleUpload = async () => {
    if (!videoFile || !videoTitle.trim()) {
      toast.error("Please provide file and title");
      return;
    }
    const formdata = new FormData();
    formdata.append("file", videoFile);
    formdata.append("videotitle", videoTitle);
    formdata.append("videochanel", channelName);
    formdata.append("uploader", channelId);
    if (description) formdata.append("description", description);
    console.log(formdata);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const res = await axiosInstance.post("/video/upload", formdata, {
        headers: {
          "Content-Type": "multipart/form-data", // ✅ MUST for FormData
        },
        onUploadProgress: (progresEvent: any) => {
          const progress = Math.round(
            (progresEvent.loaded * 100) / progresEvent.total
          );
          setUploadProgress(progress);
        },
      });
      toast.success("Upload successfully");
      resetForm();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("There was an error uploading your video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const dragAreaClass = `flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors duration-300 \
    ${isDragOver ? (theme === 'dark' ? 'bg-zinc-800 border-blue-400' : 'bg-blue-50 border-blue-400') : (theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-gray-50 border-gray-300')}`;

  return (
    <div className={`max-w-xl mx-auto mt-8 p-6 rounded-lg shadow transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      <div
        className={dragAreaClass}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={e => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handlefilechange({ target: { files: e.dataTransfer.files } } as any);
          }
        }}
      >
        <FileVideo className="w-10 h-10 mb-2 text-blue-500" />
        <span className="font-medium mb-1">Drag & drop your video here</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">or click to select a file</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handlefilechange}
        />
      </div>
      {videoFile && (
        <div className="mt-4 space-y-2">
          <Label className="block text-sm font-medium mb-1">Video Title</Label>
          <Input
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white"
            placeholder="Enter video title"
          />
          <Label className="block text-sm font-medium mb-1 mt-2">Description</Label>
          <textarea
            id="videoDescription"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your video (optional)"
            className="w-full min-h-[80px] rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--card-foreground)] p-2 focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
            maxLength={1000}
          />
        </div>
      )}
      {isUploading && (
        <div className="mt-4">
          <Progress value={uploadProgress} className="h-2 bg-gray-200 dark:bg-zinc-800" />
          <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">Uploading... {uploadProgress}%</div>
        </div>
      )}
      <div className="flex gap-2 mt-6">
        <Button onClick={handleUpload} disabled={isUploading || !videoFile || !videoTitle.trim()}>
          <Upload className="mr-2" /> Upload
        </Button>
        {isUploading && (
          <Button variant="outline" onClick={cancelUpload}>
            <X className="mr-2" /> Cancel
          </Button>
        )}
        {uploadComplete && (
          <Button variant="outline" onClick={resetForm}>
            <Check className="mr-2" /> Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
