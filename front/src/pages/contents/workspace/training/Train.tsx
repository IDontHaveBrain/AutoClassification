import { useEffect, useState } from "react";
import { WorkspaceModel } from "model/WorkspaceModel";
import { getMyWorkspaceList, getWorkspace } from "service/Apis/WorkspaceApi";
import BaseTitle from "component/baseBoard/BaseTitle";
import Grid from "@mui/material/Grid";
import { Autocomplete, Button, TextField, Paper, Typography, CircularProgress } from "@mui/material";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import LabelledImages from "component/imgs/LabelledImages";
import WorkspaceDataSet from "pages/contents/workspace/editor/WorkspaceDataSet";
import { requestTrain } from "service/Apis/TrainApi";

const Train = () => {
    const [workspaceList, setWorkspaceList] = useState<WorkspaceModel[]>([]);
    const [selected, setSelected] = useState<WorkspaceModel | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        getMyWorkspaceList({ size: 100 })
            .then((res) => {
                setWorkspaceList(res.data.content);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const isOptionEqualToValue = (option, value) => option.id === value.id;

    const handleSelectChange = (e, newValue: WorkspaceModel) => {
        const workspace = newValue;
        if (workspace) {
            setIsLoading(true);
            getWorkspace(workspace?.id)
                .then(res => {
                    setSelected(res.data);
                })
                .catch(err => {
                    console.error(err);
                    onAlert(Strings.Common.apiFailed);
                })
                .finally(() => setIsLoading(false));
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

        setIsLoading(true);
        requestTrain(selected.id)
            .then(() => {
                onAlert(Strings.Common.apiSuccess);
            })
            .catch((err) => {
                console.error(err);
                onAlert(Strings.Common.apiFailed);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <BaseTitle title={'Train'} />
            <Grid container direction="column" spacing={3}>
                <Grid item container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                            options={workspaceList}
                            getOptionLabel={(option) => option.name}
                            value={selected}
                            onChange={handleSelectChange}
                            renderInput={(params) => <TextField {...params} label="Workspace" variant="outlined" />}
                            disabled={isLoading}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={handleTrainRequest}
                            variant="contained"
                            color="primary"
                            disabled={!selected || isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : "Train Request"}
                        </Button>
                    </Grid>
                </Grid>
                {selected && (
                    <Grid item container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Workspace Data</Typography>
                            <WorkspaceDataSet
                                imgs={selected.files || []}
                                setState={setSelected}
                                isLoading={isLoading}
                                classes={selected.classes || []}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Labelled Images</Typography>
                            <LabelledImages files={selected.files || []} />
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default Train;
