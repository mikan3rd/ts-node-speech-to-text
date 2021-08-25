import { SpeechClient } from "@google-cloud/speech";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import util from "util";

const { GOOGLE_BUCKET_NAME } = process.env;

export const getCloudSpeechToTextResult = async (filePath: string) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
  if (fileSizeInMegabytes < 10) {
    await getSpeechResult({ filePath });
  } else {
    console.log("File size is over 10MB!!");
    const gcsUri = await uploadFile(filePath);
    await getSpeechResult({ gcsUri });
  }
};

const getSpeechResult = async (args: { filePath?: string; gcsUri?: string }) => {
  const { filePath, gcsUri } = args;

  const client = new SpeechClient();
  const request = {
    audio: {
      content: filePath && fs.readFileSync(filePath).toString("base64"),
      uri: gcsUri,
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

const uploadFile = async (filePath: string) => {
  if (!GOOGLE_BUCKET_NAME) {
    throw new Error("GOOGLE_BUCKET_NAME is not defined");
  }
  const storage = new Storage();
  const [file] = await storage.bucket(GOOGLE_BUCKET_NAME).upload(filePath);
  const gcsUri = `gs://${GOOGLE_BUCKET_NAME}/${file.name}`;
  console.log(`gcsUri: ${gcsUri}`);
  return gcsUri;
};
