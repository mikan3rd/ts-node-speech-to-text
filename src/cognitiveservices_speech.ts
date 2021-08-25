import { SpeechConfig, AudioConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs";
import util from "util";

const { AZURE_SUBSCRIPTION_KEY, AZURE_LOCATION } = process.env;

export const getCognitiveServicesSpeechResult = (filePath: string) => {
  if (!AZURE_SUBSCRIPTION_KEY) {
    throw new Error("AZURE_SUBSCRIPTION_KEY is not set");
  }
  if (!AZURE_LOCATION) {
    throw new Error("AZURE_LOCATION is not set");
  }

  const speechConfig = SpeechConfig.fromSubscription(AZURE_SUBSCRIPTION_KEY, AZURE_LOCATION);
  speechConfig.speechRecognitionLanguage = "ja-JP";
  speechConfig.enableDictation();

  const audioConfig = AudioConfig.fromWavFileInput(fs.readFileSync(filePath));
  const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

  recognizer.recognizeOnceAsync((result) => {
    console.log(util.inspect(result, { depth: null }));
    recognizer.close();
  });
};
