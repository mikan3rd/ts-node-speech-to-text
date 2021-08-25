import "dotenv/config";
import fs from "fs";
import { program, Argument } from "commander";
import path from "path";

import { getCloudSpeechToTextResult } from "./cloud_speech_to_text";
import { getAmivoiceResult } from "./amivoice";
import { getAmazonTranscribeResult } from "./amazon_transcribe";
import { getCognitiveServicesSpeechResult } from "./cognitiveservices_speech";

const [apiType, filePath] = program
  .addArgument(new Argument("<apiType>", "API type").choices(["gcp", "aws", "azure", "amivoice"]))
  .addArgument(new Argument("<filePath>", "audio file path"))
  .parse(process.argv).args;

(async () => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const outputDir = `output/${path.basename(filePath)}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  switch (apiType) {
    case "gcp":
      await getCloudSpeechToTextResult({ filePath, outputDir });
      break;

    case "aws":
      await getAmazonTranscribeResult({ filePath, outputDir });
      break;

    case "azure":
      await getCognitiveServicesSpeechResult({ filePath, outputDir });
      break;

    case "amivoice":
      await getAmivoiceResult({ filePath, outputDir });
      break;

    default:
      break;
  }
})();
