import "dotenv/config";
import { program, Argument } from "commander";

import { getCloudSpeechToTextResult } from "./cloud_speech_to_text";
import { getAmivoiceResult } from "./amivoice";
import { getAmazonTranscribeResult } from "./amazon_transcribe";

const [apiType, filePath] = program
  .addArgument(new Argument("<apiType>", "API type").choices(["gcp", "aws", "amivoice"]))
  .addArgument(new Argument("<filePath>", "audio file path"))
  .parse(process.argv).args;

(async () => {
  switch (apiType) {
    case "gcp":
      await getCloudSpeechToTextResult(filePath);
      break;

    case "aws":
      await getAmazonTranscribeResult(filePath);
      break;

    case "amivoice":
      await getAmivoiceResult(filePath);
      break;

    default:
      break;
  }
})();
