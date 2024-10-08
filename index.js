import axios from "axios"
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import twilio from "twilio"
import document_download from "./document_download.js"
import gemini from "./gemini.js"
import delete_file from "./delete_file.js"


const authToken = process.env.TWILIO_AUTH_TOKEN
const accountsid = process.env.TWILIO_ACCOUNT_SID
const client = twilio(accountsid, authToken);
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const session={};

app.post('/hello',async(req,res)=>{
    let from='';

    if(req.body.From){
    from=req.body.From.replace('whatsapp:','');
    console.log(from);
    if(req.body.MediaUrl0){
        if(!session[from])
        {
            session[from] = {mediaUrl:`${req.body.MediaUrl0}`}
        }
        else{
            session[from].mediaUrl = req.body.MediaUrl0;
        }

        const response_header = await axios.head(session[from].mediaUrl,{
            auth:{
                username:accountsid,
                password:authToken
            }
        });
        session[from].contentLength = parseInt(response_header.headers['content-length'],10);
        session[from].contentType = response_header.headers['content-type'];
    }

    const message = req.body.Body;
    const response = await handlemessage(message,from)
    
    if(response !== '.')
    await sendWhatsappmessage(from, response);

    }
    else{
        res.send("This message is for cron job from pdf ai")
    }
})

const handlemessage = async (message, from) =>{
    if(message === 'start'){
        delete_file(session[from].contentType, from)
        session[from].step = 'upload_request'
    }

    if(!session[from]){
        session[from] = { step:'upload_request' }
    }
    else{
        if(!session[from].step)
        {
            session[from].step = 'upload_request' 
       }
    }
    switch(session[from].step)
    {
        case 'upload_request':
            if(message)
            {
                session[from].step = 'enter_prompt'
                return `Hi! Welcome to DocumentAI📝\n\nUse this Bot to take help from AI regarding your Documents in seconds.\n\n*Please upload a PDF, JPEG or PNG File and wait to enter the prompt*\n\n⚠️Note:\nUploading a document will start a single session.\nTo work with a different document you need to start a new session by typing 'start'\n\n*This Chatbot is still in beta phase so be patient while we process everything.*`
            }
            else if(message === '' && session[from].contentLength <= 1000000000 && (session[from].contentType === 'image/jpeg' || session[from].contentType === 'image/png' || session[from].contentType === 'application/pdf')){
                    await document_download(session[from].mediaUrl, from, session[from].contentType)
                     session[from].step = 'process_file'
                     return `Document uploaded successfully✅\n\nPlease enter what u want to do with this document. Give as much as details as u can in your prompt\n\n*Then wait for few seconds while we fetch your response from AI.*`
                    }
    
                    else if (session[from].contentType >=1000000000 || (session[from].contentType !== 'image/jpeg' || session[from].contentType !== 'image/png' || session[from].contentType !== 'application/pdf')){
        return `Invalid Input. Allowed files : PDF, JPEG or PNG of less than 1GB`;
    }

    case 'enter_prompt':
        if(message === '' && session[from].contentLength <= 1000000000 && (session[from].contentType === 'image/jpeg' || session[from].contentType === 'image/png' || session[from].contentType === 'application/pdf')){
            await document_download(session[from].mediaUrl, from, session[from].contentType)
            session[from].step = 'process_file'
            return `Document uploaded successfully✅\n\nPlease enter what u want to do with this document. Give as much as details as u can in your prompt\n\n*Then wait for few seconds while we fetch your response from AI.*`
    }
    else if (message !== '' || session[from].contentType >=1000000000 || (session[from].contentType !== 'image/jpeg' || session[from].contentType !== 'image/png' || session[from].contentType !== 'application/pdf')){
        return `Invalid Input. Allowed files : PDF, JPEG or PNG of less than 1GB`;
    }
    


    case 'process_file':
        if(message !== ''){
            const response = await gemini(from, message, session[from].contentType)
            if(response === ".")
            {
                delete_file(session[from].contentType, from)
                session[from].step = 'enter_prompt'
                return "Your Document was not processed by AI due to illicit content. Please upload a different document to start again."
            }

            return response;

        }
        else{
            return `Invalid Input. Please enter the prompt to proceed.`
        }

    default: return `.`

}}

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})

const sendWhatsappmessage = async (to, body)=> {
try{
    let messageOptions = {
        body:body,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to:`whatsapp:${to}`
    };

    const message = await client.messages.create(messageOptions);
    console.log(`Message sent successfully. SID: ${message.sid}`);

}
catch(error){
    console.error(`Error sending message`,error)
    throw error;
}


}
