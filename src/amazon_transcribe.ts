import util from "util";
import fs from "fs";
import path from "path";
import { TranscribeClient, StartTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const { AWS_REGION, AWS_BUCKET_NAME } = process.env;

export const getAmazonTranscribeResult = async (filePath: string) => {
  if (!AWS_REGION) {
    throw new Error("AWS_REGION is not set");
  }
  const { bucketName, fileName } = await uploadFile(filePath);
  await getSpeechResult({ bucketName, fileName });
};

const getSpeechResult = async (args: { bucketName: string; fileName: string }) => {
  const { bucketName, fileName } = args;
  const transcribeClient = new TranscribeClient({ region: AWS_REGION });

  const mediaFileUri = `s3://${bucketName}/${fileName}`;
  console.log(`mediaFileUri: ${mediaFileUri}`);

  const params = {
    TranscriptionJobName: `${bucketName}__${fileName}`,
    LanguageCode: "ja-JP",
    Media: { MediaFileUri: mediaFileUri },
  };

  const data = await transcribeClient.send(new StartTranscriptionJobCommand(params));
  console.log(util.inspect(data, { depth: null }));
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
