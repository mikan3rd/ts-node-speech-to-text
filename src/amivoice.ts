import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

const { AMIVOICE_APPKEY } = process.env;

export const getAmivoiceResult = async (args: { filePath: string; outputDir: string }) => {
  const startTime = new Date();
  const { filePath, outputDir } = args;

  if (!AMIVOICE_APPKEY) {
    throw new Error("AMIVOICE_APPKEY is not set");
  }

  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  if (fileSizeInMegabytes < 16) {
    const response = await requestAmivoice(filePath);
    results.push(response.data);
  } else {
    console.log("File size is over 16MB!!");
    const duration = await new Promise<number | undefined>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        }
        resolve(metadata.format.duration);
      });
    });

    if (duration) {
      const divideNum = Math.ceil(fileSizeInMegabytes / 16);
      const segmentNum = Math.ceil(duration / divideNum);

      const { name } = path.parse(filePath);
      const divideDir = `test_data/${name}`;
      if (fs.existsSync(divideDir)) {
        fs.rmdirSync(divideDir, { recursive: true });
      }
      fs.mkdirSync(divideDir);

      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .output(`${divideDir}/%d.wav`)
          .outputOptions("-f", "segment", "-segment_time", segmentNum.toString())
          // .outputOptions("-ab", "160k", "-ac", "1", "-ar", "48000")
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      const fileNames = fs.readdirSync(divideDir);
      const responses = await Promise.all(fileNames.map((fileName) => requestAmivoice(`${divideDir}/${fileName}`)));
      for (const response of responses) {
        results.push(response.data);
      }
    }
  }

  fs.writeFileSync(`${outputDir}/amivoice.json`, JSON.stringify(results, null, 2));
  const text = results.map((result) => result.text).join("\n");
  const endTime = new Date();
  const timeDifference = (endTime.getTime() - startTime.getTime()) / 1000;
  console.log(`\n[Amivoice] ${timeDifference}s\n${text}`);
};

const requestAmivoice = async (filePath: string) => {
  const url = "https://acp-api.amivoice.com/v1/recognize";
  const file = fs.createReadStream(filePath);
  const data = new FormData();
  data.append("a", file);
  const params = {
    u: AMIVOICE_APPKEY,
    d: "grammarFileNames=-a-general keepFillerToken=1",
  };
  const headers = { "content-type": "multipart/form-data" };
  return await axios.request({
    method: "POST",
    url,
    data,
    headers,
    params,
    maxBodyLength: Infinity,
  });
};
