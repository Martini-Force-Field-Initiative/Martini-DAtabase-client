import { debugLog } from '../../../../logger';
import React, { useState } from "react";
import { Stack, Typography } from "@mui/material";
import TextField from "@material-ui/core/TextField";
import Divider from "@mui/material/Divider";
import { jsonParser, isValidPolymerObject } from "./UploadParsers";
import FileUploadButon from "./ModalUploaderButton";
import BodyProps from "./BodyProps";

export default function JsonBodyForm(props: BodyProps) {
  const [jsonContent, setJsonContent] = useState("");
  const [jsonTitle, setJsonTitle] = useState("");
  const [jsonErrorMessage, setJsonErrorMessage] = useState("");

  const bodyUpload = (title?: string, content?: string) => {
    debugLog(`[JsonBodyForm] uploading:\n${title}\n${content}`);

    if (title && content) props.onBodyUpload(title, content);
    else props.onBodyUpload(jsonTitle, jsonContent);
  };

  const handleJsonChange = (e: any) => {
    let maybeJsonStr = "";
    try {
      maybeJsonStr = e.target.value;

      const data = JSON.parse(maybeJsonStr);
      if (!isValidPolymerObject(data))
        throw "Invalid or Missing polymer properties";
      setJsonContent(maybeJsonStr);
      setJsonErrorMessage("");
      props.onContentChange(maybeJsonStr);
    } catch (err) {
      setJsonContent("");
      setJsonErrorMessage(maybeJsonStr !== "" ? "Malformed JSON" : "");
    }
  };

  const handleJsonFileUpload = async (e: any) => {
    try {
      const content = await jsonParser(e);
      setJsonContent(content);
      bodyUpload(jsonTitle, content);
    } catch (e) {
      console.error("json upload error");
      props.onUploadError(e as string);
    }
    debugLog("json format finished");
  };

  return (
    <Stack direction={"column"} spacing={4}>
      <TextField
        id="json-title"
        label="Polymer name"
        defaultValue=""
        variant="outlined"
        style={{ maxWidth: "18rem" }}
        onChange={(e) => {
          setJsonTitle(e.target.value);
          props.onTitleChange(e.target.value);
        }}
      />
      <Divider>THEN</Divider>

      <FileUploadButon
        accept=".json"
        label="Upload POLYPLY JSON file"
        onUpload={handleJsonFileUpload}
        disabled={jsonTitle === ""}
      />

      <Divider style={{ paddingLeft: "33%", maxWidth: "66%" }}>OR</Divider>
      <TextField
        disabled={jsonTitle === ""}
        id="json-string"
        label="Polymer as JSON"
        multiline
        minRows={4}
        style={{ overflowY: "auto", minWidth: "25rem" }}
        variant="outlined"
        onChange={handleJsonChange}
        error={jsonErrorMessage !== ""}
        helperText={jsonErrorMessage !== "" ? jsonErrorMessage : ""}
      />
    </Stack>
  );
}
