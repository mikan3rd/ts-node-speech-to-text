import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import util from "util";

const getAmivoiceResult = async (imageFilePath: string) => {
  const url = "https://acp-api.amivoice.com/v1/recognize";
  const file = fs.createReadStream(imageFilePath);
  const data = new FormData();
  data.append("a", file);
  const params = { d: "-a-general", u: "" };
  const headers = { "content-type": "multipart/form-data" };
  const response = await axios.request({ method: "POST", url, data, headers, params });
  console.log(response.status);
  console.log(util.inspect(response.data));
  return response.data;
};

await getAmivoiceResult("test_data/test.wav");
