import { useEffect, useState } from "react";
import { WorkspaceModel } from "model/WorkspaceModel";
import {getMyWorkspaceList, getWorkspace} from "service/Apis/WorkspaceApi";
import BaseTitle from "component/baseBoard/BaseTitle";
import Grid from "@mui/material/Grid";
import {Autocomplete, Button} from "@mui/material";
import TextField from "@mui/material/TextField";
import {blue} from "@mui/material/colors";
import {onAlert} from "component/modal/AlertModal";
import {Strings} from "utils/strings";
import LabelledImages from "component/imgs/LabelledImages";

const Train = () => {
    const [workspaceList, setWorkspaceList] = useState<WorkspaceModel[]>([]);
    const [selected, setSelected] = useState<WorkspaceModel | null>(null);

    useEffect(() => {
        getMyWorkspaceList({ size: 100 })
            .then((res) => {
                setWorkspaceList(res.data.content);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const isOptionEqualToValue = (option, value) => option.id === value.id;

    const handleSelectChange = (e, newValue: WorkspaceModel) => {
        const workspace = newValue;
        if (workspace) {
            getWorkspace(workspace?.id).then(res => {
                setSelected(res.data);
            }).catch(err => {
                console.error(err);
                onAlert(Strings.Common.apiFailed);
            });
        }
    };

    const handleTrainRequest = () => {
        if (!selected) {
            onAlert('Select Workspace');
            return;
        }
        if (!selected.files || selected.files.length === 0) {
            onAlert('No images to label');
            return;
        }

        // TODO: 훈련 요청
    }

    return (
        <>
            <BaseTitle title={'Train'}/>
            <Grid container direction="row" alignItems="center" spacing={2}>
                <Grid item xs={3}>
                    <Autocomplete
                        options={workspaceList}
                        getOptionLabel={(option) => option.name}
                        value={selected}
                        isOptionEqualToValue={isOptionEqualToValue}
                        onChange={handleSelectChange}
                        renderInput={(params) => <TextField {...params} label="Workspace" variant="outlined"/>}
                    />
                </Grid>
                <Grid item>
                    <Button onClick={handleTrainRequest} color="inherit" style={{ backgroundColor: blue[300] }}>Train Request</Button>
                </Grid>
            </Grid>
            <Grid mt={2} container spacing={2} xs={10}>
                {selected && selected.files &&
                    <LabelledImages files={selected?.files || []}/>
                }
            </Grid>
        </>
    );
};

export default Train;
