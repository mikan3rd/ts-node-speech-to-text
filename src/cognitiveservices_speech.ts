import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason,
  CancellationReason,
  SpeechRecognitionEventArgs,
} from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs";
import util from "util";

const { AZURE_SUBSCRIPTION_KEY, AZURE_LOCATION } = process.env;

export const getCognitiveServicesSpeechResult = (args: { filePath: string; outputDir: string }) => {
  const { filePath, outputDir } = args;
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

  const events: SpeechRecognitionEventArgs[] = [];
  recognizer.recognized = (s, e) => {
    if (e.result.reason == ResultReason.RecognizedSpeech) {
      events.push(e);
    }
  };

  recognizer.canceled = (s, e) => {
    if (e.reason == CancellationReason.Error) {
      console.log(util.inspect(e, { depth: null }));
    }
    recognizer.stopContinuousRecognitionAsync();
  };

  recognizer.sessionStopped = (s, e) => {
    recognizer.close();
    const results = events.map((event) => JSON.parse(event.result.json));
    fs.writeFileSync(`${outputDir}/cognitiveservices_speech.json`, JSON.stringify(results, null, 2));

    const text = results.map((result) => result.DisplayText).join("\n");
    console.log(`\n[Cognitive Service Speech]\n${text}`);
  };

  recognizer.startContinuousRecognitionAsync();
};
