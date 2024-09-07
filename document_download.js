import axios from "axios"
import dotenv from "dotenv"
dotenv.config()
import { DownloaderHelper } from 'node-downloader-helper'
import path from 'path';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const authToken = process.env.TWILIO_AUTH_TOKEN
const accountsid = process.env.TWILIO_ACCOUNT_SID

const document_download = async (mediaUrl, from, contentType) => {
    const response = await axios.get(mediaUrl, {
        auth : {
            username : accountsid,
            password : authToken
        },
        responseType : 'arraybuffer'
    }).then(async(data) => {
        let download;
        if(contentType === 'application/pdf')
            download = new DownloaderHelper(data.request.res.responseUrl,__dirname, {fileName: `${from}.pdf`});
        else if (contentType === 'image/jpeg')
            download = new DownloaderHelper(data.request.res.responseUrl,__dirname, {fileName: `${from}.jpeg`});
        else if (contentType === 'image/png')
            download = new DownloaderHelper(data.request.res.responseUrl,__dirname, {fileName: `${from}.png`});

        await download.start();
        await download.on('end',() => console.log("Download Completed successfully"))
    })
    // const extractedText = await gemini(from, prompt , contentType)
    // return extractedText;
    return `Document Uploaded Successfully`
}

export default document_download;
