import AlertModal from "../component/Modal/AlertModal";
import {useAppDispatch, useAppSelector} from "../store/rootHook";
import {useCallback, useEffect} from "react";
import {CONSTANT, URLS} from "../utils/constant";


const BackGround = () => {
    const sseClient = useAppSelector(state => state.sse.sseClient);

    const handleSseMessage = useCallback((event: MessageEvent) => {
        console.log(event);
    }, []);

    const handleSseError = useCallback((event: Event) => {
        console.error(event);
    }, []);

    useEffect(() => {
        const tok = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);
        if (tok && sseClient && !sseClient.isConnected()) {
            sseClient.connect(CONSTANT.API_URL + URLS.API.SSE.SUBSCRIBE, handleSseMessage, handleSseError);
        }

        return () => {
            sseClient?.disconnect();
        }
    }, [sseClient, handleSseError, handleSseMessage]);

    return (
        <>
            <AlertModal/>
        </>
    )
}

export default BackGround;