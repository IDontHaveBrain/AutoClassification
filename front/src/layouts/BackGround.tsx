import { useCallback, useEffect } from "react";
import { useAppDispatch } from "stores/rootHook";
import { SseEvent, SseType } from "model/GlobalModel";
import SseClient from "service/commons/SseClient";
import { CONSTANT, URLS } from "utils/constant";
import AlertModal from "component/modal/AlertModal";
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';

const BackGround = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const handleSseMessage = useCallback((event: SseEvent) => {
    const sseEvent = event;
    console.log()
    if (sseEvent.type === SseType.HEARTBEAT) {
      SseClient.getInstance().sendHeartbeat();
      return;
    }

    if (sseEvent.type === SseType.ALARM) {
      enqueueSnackbar(event.message.title, { variant: 'success'});
    }
  }, [enqueueSnackbar]);

  const handleSseError = useCallback((event: Event) => {
    console.error(event);
  }, []);

  useEffect(() => {
    const tok = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);
    const sseClient = SseClient.getInstance();
    if (
      tok &&
      sseClient &&
      !sseClient.isConnected() &&
      handleSseMessage &&
      handleSseError
    ) {
      sseClient.connect(
        CONSTANT.API_URL + URLS.API.SSE.SUBSCRIBE,
        handleSseMessage,
        handleSseError,
      );
    }

    return () => {
      sseClient?.disconnect();
    };
  }, [handleSseError, handleSseMessage]);

  return (
    <>
      <AlertModal />
    </>
  );
};

export default BackGround;
