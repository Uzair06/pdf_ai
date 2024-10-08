import dotenv from 'dotenv'
dotenv.config()
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const gemini = async (prompt, data) => {
  const modifiedPrompt = prompt + "Give response in less than 1600 characters and make sure u dont include emojis and whitespaces that may ruin the limit of 1600 characters"

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: data.mimeType,
            fileUri: data.fileUri,
          },
        },
        { text: modifiedPrompt },
      ]);
      return result.response.text();
    } catch (error) {
      console.log("Error from Gemini API while reading Document -->", error);
      return ".";
    }

    


}
export default gemini;