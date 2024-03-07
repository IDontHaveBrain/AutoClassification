import { useEffect, useRef, useState } from "react";
import BaseEditor from "component/baseEditor/BaseEditor";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { addNotice, updateNotice } from "service/Apis/NoticeApi";
import { useLocation, useNavigate } from "react-router-dom";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";

const NoticeEditor = () => {
  const [notice, setNotice] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const editorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.data) {
      setIsEdit(true);
      setNotice(location.state["data"]);
    }
  }, [location]);

  const handleSave = () => {
    if (!editorRef.current) return;
    const editorState = editorRef.current.getEditorState();

    if (isEdit) {
      updateNotice(notice.id, editorState)
        .then((res) => {
          onAlert(Strings.Notice.update);
          navigate(-1);
        })
        .catch((err) => {
          console.log(err);
          onAlert(Strings.Notice.updateFailed);
        });
    } else {
      addNotice(editorState)
        .then((res) => {
          onAlert(Strings.Notice.add);
          navigate(-1);
        })
        .catch((err) => {
          console.log(err);
          onAlert(Strings.Notice.addFailed);
        });
    }
  };

  return (
    <Grid item md={true}>
      {(notice || !isEdit) && (
        <BaseEditor
          handleSave={handleSave}
          defaultValue={notice}
          ref={editorRef}
        />
      )}
    </Grid>
  );
};

export default NoticeEditor;
