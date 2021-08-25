import fs from "fs";
import path from "path";
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  GetTranscriptionJobCommandOutput,
} from "@aws-sdk/client-transcribe";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";

const { AWS_REGION, AWS_BUCKET_NAME } = process.env;

export const getAmazonTranscribeResult = async (args: { filePath: string; outputDir: string }) => {
  const { filePath, outputDir } = args;
  if (!AWS_REGION) {
    throw new Error("AWS_REGION is not set");
  }
  const { bucketName, fileName } = await uploadFile(filePath);
  const jobName = await createTranscribeJob({ bucketName, fileName });
  if (jobName) {
    const result = await getTranscribeJob(jobName);
    fs.writeFileSync(`${outputDir}/amazon_transcribe.json`, JSON.stringify(result, null, 2));
  }
};

const uploadFile = async (filePath: string) => {
  if (!AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not set");
  }
  const s3Client = new S3Client({ region: AWS_REGION });
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: AWS_BUCKET_NAME,
    Key: path.basename(filePath),
    Body: fileStream,
  };
  await s3Client.send(new PutObjectCommand(uploadParams));

  return { bucketName: uploadParams.Bucket, fileName: uploadParams.Key };
};

const createTranscribeJob = async (args: { bucketName: string; fileName: string }) => {
  const { bucketName, fileName } = args;
  const transcribeClient = new TranscribeClient({ region: AWS_REGION });

  const mediaFileUri = `s3://${bucketName}/${fileName}`;
  console.log(`mediaFileUri: ${mediaFileUri}`);

  const params = {
    TranscriptionJobName: `${bucketName}__${fileName}__${Date.now()}`,
    LanguageCode: "ja-JP",
    Media: { MediaFileUri: mediaFileUri },
  };

  const data = await transcribeClient.send(new StartTranscriptionJobCommand(params));
  const jobName = data.TranscriptionJob?.TranscriptionJobName;
  console.log(`jobName: ${jobName}`);
  return jobName;
};

const getTranscribeJob = async (jobName: string) => {
  const transcribeClient = new TranscribeClient({ region: AWS_REGION });
  const params = {
    TranscriptionJobName: jobName,
  };

  let data: GetTranscriptionJobCommandOutput;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    data = await transcribeClient.send(new GetTranscriptionJobCommand(params));
    const status = data.TranscriptionJob?.TranscriptionJobStatus;
    console.log(status);
    if (status === "COMPLETED" || status === "FAILED") {
      break;
    }
    await sleep(1000 * 5);
  }

  const response = await axios.request({
    method: "GET",
    url: data.TranscriptionJob?.Transcript?.TranscriptFileUri,
    responseType: "json",
  });
  return response.data;
};

const sleep = (msec: number) => new Promise((resolve) => setTimeout(resolve, msec));
