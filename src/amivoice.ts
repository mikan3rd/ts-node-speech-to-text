import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import util from "util";

const { AMIVOICE_APPKEY } = process.env;

export const getAmivoiceResult = async (filePath: string) => {
  if (!AMIVOICE_APPKEY) {
    throw new Error("AMIVOICE_APPKEY is not set");
  }
  const url = "https://acp-api.amivoice.com/v1/recognize";
  const file = fs.createReadStream(filePath);
  const data = new FormData();
  data.append("a", file);
  const params = { d: "-a-general", u: AMIVOICE_APPKEY };
  const headers = { "content-type": "multipart/form-data" };
  const response = await axios.request({ method: "POST", url, data, headers, params });
  console.log(response.status);
  console.log(util.inspect(response.data, { depth: null }));
  return response.data;
};
