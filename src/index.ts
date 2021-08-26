import "dotenv/config";
import fs from "fs";
import { program, Argument } from "commander";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

import { getCloudSpeechToTextResult } from "./cloud_speech_to_text";
import { getAmivoiceResult } from "./amivoice";
import { getAmazonTranscribeResult } from "./amazon_transcribe";
import { getCognitiveServicesSpeechResult } from "./cognitiveservices_speech";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const [apiType, filePath] = program
  .addArgument(new Argument("<apiType>", "API type").choices(["all", "gcp", "aws", "azure", "amivoice"]))
  .addArgument(new Argument("<filePath>", "audio file path"))
  .parse(process.argv).args;

(async () => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const { name, ext } = path.parse(filePath);
  let targetFilePath = filePath;
  if (ext !== ".mp3") {
    targetFilePath = `test_data/${name}.mp3`;
    ffmpeg(filePath).toFormat("mp3").save(targetFilePath);
  }

  const outputDir = `output/${path.basename(targetFilePath)}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  switch (apiType) {
    case "all":
      await Promise.all([
        getCloudSpeechToTextResult({ filePath: targetFilePath, outputDir }),
        getAmazonTranscribeResult({ filePath: targetFilePath, outputDir }),
        getCognitiveServicesSpeechResult({ filePath: targetFilePath, outputDir }),
        getAmivoiceResult({ filePath: targetFilePath, outputDir }),
      ]);
      break;

    case "gcp":
      await getCloudSpeechToTextResult({ filePath: targetFilePath, outputDir });
      break;

    case "aws":
      await getAmazonTranscribeResult({ filePath: targetFilePath, outputDir });
      break;

    case "azure":
      await getCognitiveServicesSpeechResult({ filePath: targetFilePath, outputDir });
      break;

    case "amivoice":
      await getAmivoiceResult({ filePath: targetFilePath, outputDir });
      break;

    default:
      break;
  }
})();
