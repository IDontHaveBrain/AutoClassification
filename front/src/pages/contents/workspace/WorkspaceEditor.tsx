import Grid from "@mui/material/Grid";
import BaseEditor from "component/baseEditor/BaseEditor";

const WorkspaceEditor = () => {
  return (
    <Grid item md={true}>
      <BaseEditor handleSave={() => {}} defaultValue={null} ref={null} />
    </Grid>
  );
};

export default WorkspaceEditor;
