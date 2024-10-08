import dotenv from 'dotenv'
dotenv.config()
import { GoogleAIFileManager } from '@google/generative-ai/server';
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const uploadFile = async(from, contentType)=>{
    let uploadResponse;
    if(contentType === 'application/pdf'){
        uploadResponse = await fileManager.uploadFile(`${from}.pdf`,{
            mimeType: "application/pdf",
            displayName: "Gemini 1.5 PDF",
        });
    }
    else if (contentType === 'image/jpeg'){
        uploadResponse = await fileManager.uploadFile(`${from}.jpeg`,{
            mimeType: "image/jpeg",
            displayName: "Gemini 1.5 JPEG",
        });
    }
    else if (contentType === 'image/png'){
        uploadResponse = await fileManager.uploadFile(`${from}.png`,{
            mimeType: "image/png",
            displayName: "Gemini 1.5 PNG",
        });
    }


    console.log(`Uploaded file ${uploadResponse.file.displayName} as:${uploadResponse.file.uri}`);
    const getResponse = await fileManager.getFile(uploadResponse.file.name);
    console.log(`Retrieved file ${getResponse.displayName} as ${getResponse.uri}`);

    const response = {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
    }

    return response;

}

export default uploadFile;

