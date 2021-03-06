import express, { Application, Request, Response } from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import { encodeTextRouter } from "./routes/api/encode-text";
import { decodeTextRouter } from "./routes/api/decode-text";
import * as url from "url";

const csp = require("express-csp-header");
const upload = require("express-fileupload");

const app: Application = express();
const PORT: any = process.env.PORT || 5000;

export const bufferCompressed = path.join(
  __dirname,
  "utils",
  "buffer-store",
  "compressed-out"
);

// Compresse file uploaded by the user during decompress request
export const bufferUpload = path.join(
  __dirname,
  "routes",
  "api",
  "uploads",
  "compressed-upload"
);

// Dictonary json file for the compressed output
export const bufferCompressedDict = path.join(
  __dirname,
  "utils",
  "dict",
  "compressed-out-dict.json"
);

// // CSP policy
// app.use(
//   csp({
//     policies: {
//       "default-src": [csp.NONE],
//       "img-src": [csp.SELF],
//     },
//   })
// );

app.use(upload());

app.use(bodyParser.json());

app.use(express.static(__dirname + "/client"));

// locahsot:500/
app.get("/", (req: Request, res: Response) => {
  console.log("recieved a get requ");
  console.log(req.protocol + "://" + req.get("host") + req.originalUrl);
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Download compressed file
app.get("/download-compressed", (req, res) => {
  res.download(bufferCompressed);
});

// Download dictonary json
app.get("/download-dict", (req, res) => {
  res.download(bufferCompressedDict);
});

// API Routes
app.use("/api/encode-text", encodeTextRouter);
app.use("/api/decode-text", decodeTextRouter);

app.listen(PORT, () => console.log(`Server Started on PORT ${PORT}`));
