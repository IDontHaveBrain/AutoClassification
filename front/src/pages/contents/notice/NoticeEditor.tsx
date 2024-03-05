import { useEffect, useRef, useState } from "react";
import BaseEditor from "component/baseEditor/BaseEditor";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { addNotice, updateNotice } from "service/Apis/NoticeApi";
import { useLocation, useNavigate } from "react-router-dom";
import { onAlert } from "component/modal/AlertModal";

const NoticeEditor = () => {
  const [notice, setNotice] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const editorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state["data"] != null) {
      setIsEdit(true);
      setNotice(location.state["data"]);
    }
  }, [location]);

  const handleSave = () => {
    if (!editorRef.current) return;
    const editorState = editorRef.current.getEditorState();

    if (isEdit) {
      updateNotice(notice.id, editorState).then((res) => {
        console.log(res);
        onAlert("공지사항 수정이 완료되었습니다.");
        navigate(-1);
      }).catch((err) => {
        console.log(err);
        onAlert("공지사항 수정에 실패했습니다." );
      });
    } else {
      addNotice(editorState).then((res) => {
        console.log(res);
        onAlert("등록완료.");
        navigate(-1)
      }).catch((err) => {
        console.log(err);
        onAlert("공지사항 등록에 실패했습니다." );
      });
    }
  };

  useEffect(() => {}, []);

  return (
    <Grid item md={true}>
      {notice && (
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
