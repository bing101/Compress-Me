let txt = ""; // content of the file uploaded
// const URL = "http://localhost:5000";
const ULR = "http://compress-me.herokuapp.com";

const reqObject = {
  method: "POST", // *GET, POST, PUT, DELETE, etc.
  mode: "cors", // no-cors, *cors, same-origin
  cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
  credentials: "same-origin", // include, *same-origin, omit
  headers: {
    "Content-Type": "application/json",
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  redirect: "follow", // manual, *follow, error
  referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  body: "", // body data type must match "Content-Type" header Json.stringify(data)
};

// script for reading uploaded file
document.getElementById("input-file").addEventListener("change", getFile);
document
  .getElementById("input-bin-file")
  .addEventListener("change", (event) => {
    handleBufferFileUpload(event);
  });

document
  .getElementById("input-json-dec")
  .addEventListener("change", (event) => {
    handleJsonUpload(event);
  });

///////////////////////////////////////////////////////////////////////
//////////////////////// Handle Files ///////////////////////////////////
///////////////////////////////////////////////////////////////////////

// get uploaded file on change
function getFile(event) {
  const input = event.target;
  const validator = document.getElementById("cmp-validator");
  if (!isValidCmp(input, validator)) {
    console.log("it is not valid");
    input.value = "";
    return;
  }
  if ("files" in input && input.files.length > 0) {
    placeFileContent(input.files[0]);
  }
}

function getFileExt(inputDom) {
  const fullPath = inputDom.value;
  const ext = fullPath.split(".").pop();
  return ext;
}

// perform operations on file read
function placeFileContent(file) {
  readFileContent(file)
    .then((content) => {
      txt = content;
    })
    .catch((error) => console.log(error));
}

// function returns a promise when file is read
function readFileContent(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

async function handleBufferFileUpload(event) {
  const files = event.target.files;
  const formData = new FormData();

  formData.append("myFile", files[0]);

  await fetch("/api/decode-text/upload-buffer", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((err) => console.log(err));
}

async function handleJsonUpload(event) {
  const files = event.target.files;
  const validator = document.getElementById("dec-validator");
  if (!isValidDec(event.target, validator)) {
    return false;
  }
  const formData = new FormData();

  formData.append("myFile", files[0]);

  await fetch("/api/decode-text/upload-json", {
    method: "POST",
    body: formData,
  });
}

// remove files from input field if any
function clearInputFiles(fieldType) {
  if (fieldType === "dec") {
    const f1 = document.getElementById("input-bin-file");
    const f2 = document.getElementById("input-json-dec");
    f1.value = "";
    f2.value = "";
  } else if (fieldType === "enc") {
    const f = document.getElementById("input-file");
    f.value = "";
  }
}

// validation for input files during compression
function isValidCmp(fileSelector, validatorSelector) {
  const allowedFiles = ["txt"];
  const ext = getFileExt(fileSelector);

  // validatre file extention
  if (!allowedFiles.includes(ext)) {
    validatorSelector.innerHTML =
      "Sorry !! We only support '.txt' files at the moment. 😅  ";
    return false;
  }

  validatorSelector.innerHTML = "";
  return true;
}

function isValidDec(fileSelector, validatorSelector) {
  const allowedFiles = ["json"];
  const ext = getFileExt(fileSelector);

  // validatre file extention
  if (!allowedFiles.includes(ext)) {
    validatorSelector.innerHTML =
      "Hmm !! It looks like your input file is of the wrong format. 🤔";
    return false;
  }

  validatorSelector.innerHTML = "";
  return true;
}
///////////////////////////////////////////////////////////////////////
//////////////////////// Handle Requests //////////////////////////////
///////////////////////////////////////////////////////////////////////

// The function takes the uploaded doc and makes
// a request to the compression endpoint
async function makeRequest() {
  console.log("Making compress req");
  clearInputFiles("enc");
  const validator = document.getElementById("cmp-validator");
  const cmpDetails = document.getElementById("cmp-details");
  if (txt.length === 0) {
    validator.innerHTML = "File Empty Error";
    return;
  }

  validator.innerHTML = "";
  const url = "/api/encode-text";

  reqObject.body = JSON.stringify({ compressionString: txt });

  let resp;

  await fetch(url, reqObject)
    .then((response) => response.json())
    .then((result) => (resp = result));

  // console.log(response);
  if (resp.status === 200) {
    validator.innerHTML = `<span class="cmp-result"> Success !! </span> <br/>
      Click 
      <span style="color: green">
      <a href='${URL}/download-compressed'>here</a>
      </span> to download Compressed File. <br/>
      Click 
      <span style="color: green">
        <a href='${URL}/download-dict'>here</a>
      </span> to download Dictonary. 
      `;
    validator.style.color = "teal";
    // orignalTextSize = resp.orignalTextSize;
    const orignalTextSize = resp.orignalSize;
    const compressedTextSize = resp.textSize;

    const eff = resp.eff;

    const compressedTextArr = resp.text; // This is an array
    const dict = resp.dict;

    // Setting some messages on the browser
    const cmpStatus = document.getElementById("cmp-details");
    const statusMsg = `Size of Orignal Text = ${orignalTextSize} bytes<br\>
     Size of Encoded Text = ${compressedTextSize} bytes <br/> 
     Text Compressed by ${eff.toFixed(3)}%`;

    cmpStatus.innerHTML = statusMsg;
  }
}

async function makeDecompressRequest() {
  const validators = document.getElementById("dec-validator");
  if (
    document.getElementById("input-bin-file").value === "" ||
    document.getElementById("input-json-dec").vallue === ""
  ) {
    // you have a file
    validators.innerHTML = "Make sure the upload file field is not empty";
  } else {
    validators.innerHTML = "";
    await fetch("/api/decode-text", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((result) => (resp = result));

    if (resp.status === 200) {
      const decodedText = resp.text;
      const blob = new Blob([decodedText], { type: "text/plain" });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = name;

      document.body.appendChild(link);

      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );

      const decStatus = document.getElementById("dec-details");
      decStatus.innerHTML = "Drink Some Water and Enjoy your file 🤭 ";
      document.body.removeChild(link);
    } else {
      validators.innerHTML =
        "Something Went wrong. We're trying to figure out what. <br/> Drink Some water meanwhile";
    }
    clearInputFiles("dec");
  }
}
