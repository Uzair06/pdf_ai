import axios from "axios"
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import twilio from "twilio"
import document_download from "./document_download.js"
import gemini from "./gemini.js"


const authToken = process.env.TWILIO_AUTH_TOKEN
const accountsid = process.env.TWILIO_ACCOUNT_SID
const client = twilio(accountsid, authToken);
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

 let session={};

app.post('/hello',async(req,res)=>{
    let from='';
    
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

await sendWhatsappmessage(from, response);


})

const handlemessage = async (message, from) =>{
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
                session[from].step = 'process_file'
                return `Please upload PDF, JPEG or PNG`
            }
            else{
                if(message === '' && session[from].contentLength <= 1000000000 && (session[from].contentType === 'image/jpeg' || session[from].contentType === 'image/png' || session[from].contentType === 'application/pdf')){
                    await document_download(session[from].mediaUrl, from, session[from].contentType)
                    const response = await gemini(from, "Please tell me what this is", session[from].contentType)
                    return response
            }
    }
    case 'process_file':
        if(message === '' && session[from].contentLength <= 1000000000 && (session[from].contentType === 'image/jpeg' || session[from].contentType === 'image/png' || session[from].contentType === 'application/pdf')){
            await document_download(session[from].mediaUrl, from, session[from].contentType)
            const response = await gemini(from, "Please tell me what this is", session[from].contentType)
            return response
    }

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
    console.log(`Mesaage sent successfully. SID: ${message.sid}`);

}
catch(error){
    console.error(`Error sending message`,error)
    throw error;
}


}
