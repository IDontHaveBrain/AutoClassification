import {useEffect, useState} from "react";
import {getMyWorkspaceList} from "service/Apis/WorkspaceApi";
import {WorkspaceModel} from "model/WorkspaceModel";
import {Autocomplete, MenuItem, Select} from "@mui/material";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import BaseTitle from "component/baseBoard/BaseTitle";

const AutoLabel = () => {
    const [workspaceList, setWorkspaceList] = useState<WorkspaceModel[]>([]);
    const [selected, setSelected] = useState<WorkspaceModel>();


    useEffect(() => {
        getMyWorkspaceList({size: 100}).then(res => {
            setWorkspaceList(res.data.content);
        }).catch(err => {
            console.error(err);
        });
    }, []);

    const handleSelectChange = (e) => {
        setSelected(e.target.value);
    };

    return (
        <>
            <BaseTitle title={'AutoLabel'} />
            <Grid container>
                <Grid item xs={3}>
                    <Autocomplete
                        options={workspaceList}
                        getOptionLabel={(option) => option.name}
                        value={selected}
                        onChange={(event, newValue) => {
                            setSelected(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} label="Workspace" variant="outlined" fullWidth />}
                    />
                </Grid>
            </Grid>
        </>
    );
}

export default AutoLabel;