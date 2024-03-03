import Box from "@mui/material/Box";
import FileDropzone from "component/FileDropzone";
import Grid from "@mui/material/Grid";
import { useCallback, useEffect, useState } from "react";
import { Divider, List, ListItem, ListItemText } from "@mui/material";
import Button from "@mui/material/Button";
import { getMyTrainImgs, uploadImg } from "service/Apis/TrainApi";
import { FileModel } from "model/GlobalModel";

const Classfiy = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileModel[]>([]);

  const onDrop = useCallback(
    (files) => {
      console.log("files : ", files);

      const formData = new FormData();
      files.forEach((file, i) => {
        formData.append("files", file);
      });
      // setFiles(files)

      setFiles(
        files.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );

      //headers: { 'Content-Type': 'multipart/form-data' }
    },
    [setFiles],
  );

  const onSave = () => {
    console.log("files : ", files);
    const formData = new FormData();
    files.forEach((file, i) => {
      formData.append("files", file);
    });
    uploadImg(formData)
      .then((res) => {
        console.log("res : ", res);
        setUploadedFiles([uploadedFiles, ...res.data]);
        setFiles([]);
      })
      .catch((err) => {
        console.log("err : ", err);
      });
  };

  const requestTrain = () => {
    console.log("requestTrain");
  }

  useEffect(() => {
    getMyTrainImgs()
      .then((res) => {
        console.log("res : ", res);
        setUploadedFiles(res.data);
      })
      .catch((err) => {
        console.log("err : ", err);
      });
  }, []);

  const images = files.map((file) => (
    <div key={file.name}>
      <img src={file.preview} style={{ width: "200px" }} alt="preview" />
    </div>
  ));

  return (
    <Box>
      <Grid item md={12}>
        <FileDropzone onDrop={onDrop} />
      </Grid>
      <aside style={{ display: "flex", flexWrap: "wrap", marginTop: "15px" }}>
        {images}
      </aside>
      <Grid item xs={12}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Button onClick={onSave} color={"secondary"} variant={"contained"}>
              저장
            </Button>
          </Grid>
          <Grid item>
            <Button variant={"contained"} color={"success"} onClick={requestTrain}>
              모델 훈련
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <List>
        {files.map((file, index) => (
          <ListItem key={index}>
            <ListItemText primary={file.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <aside style={{ display: "flex", flexWrap: "wrap", marginTop: "15px" }}>
        {uploadedFiles.map((file, index) => (
          <div key={file.id}>
            <img src={file.url} style={{ width: "200px" }} alt="preview" />
          </div>
        ))}
      </aside>
    </Box>
  );
};

export default Classfiy;
