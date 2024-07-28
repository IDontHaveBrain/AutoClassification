import { useNavigate } from "react-router-dom";
import { WorkspaceModel } from "model/WorkspaceModel";
import { CardMedia, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { deleteWorkspace, getWorkspace } from "service/Apis/WorkspaceApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import Button from "@mui/material/Button";
import { useEffect, useState, useCallback } from "react";
import { eventBus } from "layouts/BackGround";
import { SseEvent, SseType } from "model/GlobalModel";

interface Props {
    data: WorkspaceModel;
    handleClose: () => void;
}

const WorkspaceDetail = ({ data, handleClose }: Props) => {
    const [detail, setDetail] = useState<WorkspaceModel>(data);
    const navigate = useNavigate();

    const fetchWorkspaceDetail = useCallback(async (id: number) => {
        try {
            const res = await getWorkspace(id);
            setDetail(res.data);
        } catch (err) {
            console.error(err);
            onAlert(Strings.Common.apiFailed);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaceDetail(data.id);

        const handleSseMessage = (event: SseEvent) => {
            if (event.type === SseType.WORKSPACE_UPDATE) {
                const updatedWorkspace = JSON.parse(event.data);
                if (updatedWorkspace.id === data.id) {
                    fetchWorkspaceDetail(data.id);
                }
            }
        };

        eventBus.subscribe(SseType.WORKSPACE_UPDATE, handleSseMessage);

        return () => {
            eventBus.unsubscribe(SseType.WORKSPACE_UPDATE, handleSseMessage);
        };
    }, [data.id, fetchWorkspaceDetail]);

    const handleEdit = () => {
        navigate("/workspace/editor", { state: { data: detail } });
    };

    const handleDelete = () => {
        deleteWorkspace(detail.id)
            .then((res) => {
                handleClose();
                onAlert(Strings.Common.apiSuccess);
            })
            .catch((err) => {
                console.log(err);
                onAlert(Strings.Common.apiFailed);
            });
    };

    return (
        <>
            <DialogTitle>{detail.name}</DialogTitle>
            <DialogContent>
                <DialogContentText
                    dangerouslySetInnerHTML={{
                        __html: detail?.description || "",
                    }}
                />
                {detail.files?.map((file) => (
                    <CardMedia
                        component="img"
                        height="140"
                        image={file.url}
                        alt={file.fileName}
                        key={file.id}
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDelete}>삭제</Button>
                <Button onClick={handleEdit}>수정</Button>
                <Button onClick={handleClose} autoFocus>
                    닫기
                </Button>
            </DialogActions>
        </>
    );
};
export default WorkspaceDetail;
