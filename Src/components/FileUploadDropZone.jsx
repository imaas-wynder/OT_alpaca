import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { 
  FileUploadContainer, FormField, DragDropText, FilePreviewContainer, ImagePreview,
  PreviewContainer, PreviewList, FileMetaData, RemoveFileIcon
} from "./FileUploadDropZoneStyles";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

const KILO_BYTES_PER_BYTE = 1000;
const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 5000000;
const convertNestedObjectToArray = (nestedObj) => Object.keys(nestedObj).map((key) => nestedObj[key]);
const convertBytesToKB = (bytes) => Math.round(bytes / KILO_BYTES_PER_BYTE);

const FileUploadDropZone = (
  {
    label,
    updateFilesCb,
    maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
    ...otherProps
  },
  ref
) => {
  const fileInputField = useRef(null);
  const [files, setFiles] = useState({});

  const addNewFiles = (newFiles) => {
    for (let file of newFiles) {
      if (file.size <= maxFileSizeInBytes) {
        if (!otherProps.multiple) { return { file }; }
        files[file.name] = file;
      }
    }
    return { ...files };
  };

  const callUpdateFilesCb = (files) => {
    const filesAsArray = convertNestedObjectToArray(files);
    updateFilesCb(filesAsArray);
  };

  const handleNewFileUpload = (e) => {
    //console.log("handleNewFileUpload")
    const { files: newFiles } = e.target;
    if (newFiles.length) {
      let updatedFiles = addNewFiles(newFiles);
      setFiles(updatedFiles);
      callUpdateFilesCb(updatedFiles);
    }
  };

  const removeFile = (fileName) => {
    delete files[fileName];
    setFiles({ ...files });
    callUpdateFilesCb({ ...files });
  };

  useImperativeHandle(ref, () => ({
    resetFiles: () => {
      //console.log("resetting files to upload")
      setFiles([])
      callUpdateFilesCb([])
    }
  }))

  return (
    <>
      <FileUploadContainer>
        <DragDropText>Drag and drop your file HERE</DragDropText>
        <FormField
          type="file"
          ref={fileInputField}
          onChange={handleNewFileUpload}
          title=""
          value=""
          {...otherProps}
        />
      </FileUploadContainer>
      <FilePreviewContainer>
        <PreviewList>
          {Object.keys(files).map((fileName, index) => {
            let file = files[fileName];
            let isImageFile = (file.type.split("/")[0] === "image") && (file.type.split("/")[1] !== "tiff");
            
            return (
              <PreviewContainer key={fileName}>
                <div>
                  {isImageFile && (
                    <ImagePreview
                      src={URL.createObjectURL(file)}
                      alt={`file preview ${index}`}
                    />
                  )}
                  <FileMetaData isImageFile={isImageFile}>
                    <span style={{fontSize: '8pt'}}>{file.name}</span>
                    <aside>
                      <span style={{fontSize: '8pt'}}>{convertBytesToKB(file.size)} kb</span>
                      <RemoveFileIcon
                        onClick={() => removeFile(fileName)}
                      ><FontAwesomeIcon icon={faTrashAlt} /></RemoveFileIcon>
                    </aside>
                  </FileMetaData>
                </div>
              </PreviewContainer>
            );
          })}
        </PreviewList>
      </FilePreviewContainer>
    </>
  );
};

export default forwardRef(FileUploadDropZone);