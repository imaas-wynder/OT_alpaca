import React, { useState , useRef } from 'react'
import FileUploadDropZone from './FileUploadDropZone'
import Button from '@mui/material/Button';

export default function FileUploadComponent(props) {

    const [newUploadInfo, setNewUploadInfo] = useState({ files: [] });
    const updateUploadedFiles = (files) => { 
        setNewUploadInfo({ ...newUploadInfo, files: files }); 
        props.ifChanged();
    }
    const fileUploadDropZoneEl = useRef(null)

    const handleSubmit = (event) => {
        event.preventDefault();
        //console.log('handleSubmit');
        newUploadInfo.files.forEach((file, fileIndex) => { props.callback(file) })
    }
    
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <FileUploadDropZone
                    ref={fileUploadDropZoneEl}
                    accept=".jpg,.tif,.tiff,.jpeg,.pdf"
                    label="Scanned images or documents"
                    multiple={false} 
                    updateFilesCb={updateUploadedFiles}
                />
                <Button 
                    type="submit"
                    style={{background: 'rgb(18, 44, 105)', color: 'white'}}
                    >{props.submitLabel}
                </Button>
            </form>
        </div>
    )

}