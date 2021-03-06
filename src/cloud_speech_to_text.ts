import { SpeechClient } from "@google-cloud/speech";
import { Storage } from "@google-cloud/storage";
import fs from "fs";

const { GOOGLE_BUCKET_NAME } = process.env;

export const getCloudSpeechToTextResult = async (args: { filePath: string; outputDir: string }) => {
  const startTime = new Date();
  const { filePath, outputDir } = args;

  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: any;
  if (fileSizeInMegabytes < 10) {
    response = await getSpeechResult({ filePath });
  } else {
    console.log("File size is over 10MB!!");
    const gcsUri = await uploadFile(filePath);
    response = await getSpeechResult({ gcsUri });
  }

  fs.writeFileSync(`${outputDir}/cloud_speech_to_text.json`, JSON.stringify(response, null, 2));
  const text = response.results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((result: { alternatives: any[] }) => result.alternatives.map((alternative) => alternative.transcript))
    .join("\n");
  const endTime = new Date();
  const timeDifference = (endTime.getTime() - startTime.getTime()) / 1000;
  console.log(`\n[Cloud Speech to Text] ${timeDifference}s\n${text}`);
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
      languageCode: "ja-JP",
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
    },
  };
  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();
  return response;
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
