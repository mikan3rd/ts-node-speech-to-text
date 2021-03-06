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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffprobePath = require("@ffprobe-installer/ffprobe").path;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobePath);

const [apiType, filePath] = program
  .addArgument(new Argument("<apiType>", "API type").choices(["all", "gcp", "aws", "azure", "amivoice"]))
  .addArgument(new Argument("<filePath>", "audio file path"))
  .parse(process.argv).args;

(async () => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  let targetFilePath = filePath;
  const { name, ext } = path.parse(filePath);
  if (ext !== ".wav") {
    const tmpFilePath = `test_data/${name}.wav`;
    await new Promise((resolve, reject) =>
      ffmpeg(targetFilePath).on("end", resolve).on("error", reject).save(tmpFilePath),
    );
    targetFilePath = tmpFilePath;
  }

  // if (ext !== ".mp3") {
  //   const tmpFilePath = `test_data/${name}.mp3`;
  //   await new Promise((resolve, reject) =>
  //     ffmpeg(targetFilePath).toFormat("mp3").on("end", resolve).on("error", reject).save(tmpFilePath),
  //   );
  //   targetFilePath = tmpFilePath;
  // }

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
