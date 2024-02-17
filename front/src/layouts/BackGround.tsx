import AlertModal from "../component/Modal/AlertModal";
import {useAppDispatch, useAppSelector} from "../store/rootHook";
import {useEffect} from "react";
import SseClient from "../service/SseClient";
import {setSseClient} from "../store/rootSlice";


const BackGround = () => {
    const sseClient = useAppSelector(state => state.sse.sseClient);
    const dispatch = useAppDispatch();

    useEffect(() => {
    }, []);

    return (
        <>
            <AlertModal/>
        </>
    )
}

export default BackGround;