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

const Training = () => {
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

    return (
        <>
            <BaseTitle title={'AutoLabel'}/>
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
            </Grid>
        </>
    );
};

export default Training;
