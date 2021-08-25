import "dotenv/config";
import speech from "@google-cloud/speech";
import fs from "fs";
import util from "util";

export const getCloudSpeechToText = async (filename: string) => {
  const client = new speech.SpeechClient();

  const request = {
    audio: {
      content: fs.readFileSync(filename).toString("base64"),
    },
    config: {
      encoding: "LINEAR16" as const,
      languageCode: "ja-JP",
      enableAutomaticPunctuation: true,
    },
  };

  const [operation] = await client.longRunningRecognize(request);

  const response = await operation.promise();

  console.log(util.inspect(response, { depth: null }));
};

await getCloudSpeechToText("test_data/test.wav");
