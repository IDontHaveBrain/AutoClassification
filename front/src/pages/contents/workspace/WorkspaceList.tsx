import { useEffect, useState } from "react";
import { getMyWorkspaceList } from "../../../service/Apis/WorkspaceApi";

const WorkspaceList = () => {
  const [workspaceList, setWorkspaceList] = useState([]);

  useEffect(() => {
    getMyWorkspaceList()
      .then((res) => {
        console.log(res);
        setWorkspaceList(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <h1>WorkspaceList</h1>
    </div>
  );
};

export default WorkspaceList;
