import AlertModal from "../component/Modal/AlertModal";
import {useAppDispatch, useAppSelector} from "../store/rootHook";
import {useEffect} from "react";


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