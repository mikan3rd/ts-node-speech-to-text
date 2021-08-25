import "dotenv/config";
import { program, Argument } from "commander";

import { getCloudSpeechToTextResult } from "./cloud_speech_to_text";
import { getAmivoiceResult } from "./amivoice";

const [apiType, filePath] = program
  .addArgument(new Argument("<apiType>", "API type").choices(["gcp", "amivoice"]))
  .addArgument(new Argument("<filePath>", "audio file path"))
  .parse(process.argv).args;

(async () => {
  switch (apiType) {
    case "gcp":
      await getCloudSpeechToTextResult(filePath);
      break;

    case "amivoice":
      await getAmivoiceResult(filePath);
      break;

    default:
      break;
  }
})();
