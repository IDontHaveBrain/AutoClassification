import {useEffect, useState} from "react";
import {getMyWorkspaceList, getWorkspace} from "service/Apis/WorkspaceApi";
import {WorkspaceModel} from "model/WorkspaceModel";
import {Autocomplete, Button} from "@mui/material";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import BaseTitle from "component/baseBoard/BaseTitle";
import {onAlert} from "component/modal/AlertModal";
import WorkspaceDataSet from "pages/contents/workspace/editor/WorkspaceDataSet";
import {Strings} from "utils/strings";
import LabelledImages from "component/imgs/LabelledImages";
import {blue} from "@mui/material/colors";
import {requestAutoLabel} from "service/Apis/TrainApi";

const AutoLabel = () => {
    const [workspaceList, setWorkspaceList] = useState<WorkspaceModel[]>([]);
    const [selected, setSelected] = useState<WorkspaceModel | null>(null);


    useEffect(() => {
        getMyWorkspaceList({size: 100}).then(res => {
            setWorkspaceList(res.data.content);
        }).catch(err => {
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

    const handleLabelingRequest = () => {
        if (!selected) {
            onAlert('Select Workspace');
            return;
        }
        if (!selected.files || selected.files.length === 0) {
            onAlert('No images to label');
            return;
        }

        requestAutoLabel(selected.id).then(res => {
            onAlert(Strings.Common.apiSuccess);
        }).catch(err => {
            console.error(err);
            onAlert(Strings.Common.apiFailed);
        });
    }

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
                <Grid item>
                    <Button onClick={handleLabelingRequest} color="inherit" style={{ backgroundColor: blue[300] }}>Labeling Request</Button>
                </Grid>
            </Grid>
            <Grid mt={2} container spacing={2} xs={10}>
                {selected && selected.files &&
                    <>
                        <WorkspaceDataSet imgs={selected?.files || []} setState={setSelected}/>
                        <LabelledImages files={selected?.files || []}/>
                    </>
                }
            </Grid>
        </>
    );
}

export default AutoLabel;