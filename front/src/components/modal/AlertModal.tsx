import { forwardRef, useCallback, useEffect } from 'react';
import { Backdrop, css, Dialog,styled } from '@mui/material';
import Button from '@mui/material/Button';
import { blue, grey } from '@mui/material/colors';
import { animated, useSpring } from '@react-spring/web';
import { useTranslation } from 'hooks/useTranslation';
import { useAppDispatch, useAppSelector } from 'stores/rootHook';
import { closeAlert, openAlert } from 'stores/rootSlice';

// Alert용 커스텀 이벤트 타입
interface AlertEventDetail {
  message: string;
  callback?: () => void;
}

interface AlertEvent extends CustomEvent<AlertEventDetail> {
  detail: AlertEventDetail;
}

const style = {
  position: 'relative',
  width: 400,
  zIndex: 1302,
};

const AlertModal = () => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const alert = useAppSelector((state) => state.alert);

  const handler = useCallback(
    (event: Event) => {
      const alertEvent = event as AlertEvent;
      if (alertEvent.detail.callback) {
        dispatch(
          openAlert({ message: alertEvent.detail.message, callback: alertEvent.detail.callback }),
        );
      } else {
        dispatch(openAlert({ message: alertEvent.detail.message }));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    window.addEventListener('Alert', handler);
    return () => {
      window.removeEventListener('Alert', handler);
    };
  }, [handler]);

  const onClose = useCallback(() => {
    if (alert && alert.callback) {
      alert.callback();
    }
    dispatch(closeAlert());
  }, [alert, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && alert.open) {
        event.preventDefault();
        onClose();
      }
    };

    if (alert.open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [alert.open, onClose]);

  return (
    <Modal
      aria-labelledby="spring-modal-title"
      aria-describedby="spring-modal-description"
      open={alert.open}
      onClose={onClose}
      BackdropComponent={StyledBackdrop}
    >
      <Fade in={alert.open}>
        <ModalContent sx={style}>
          <h2 id="spring-modal-title" className="modal-title">
            {t('modals.alert')}
          </h2>
          <p id="spring-modal-description" className="modal-description">
            {alert.message}
          </p>

          <Button
            onClick={onClose}
            sx={{
              background: blue['500'],
              color: 'black',
              '&:hover': {
                backgroundColor: 'green',
                color: 'white',
              },
            }}
          >
            {t('buttons.ok')}
          </Button>
        </ModalContent>
      </Fade>
    </Modal>
  );
};

export default AlertModal;

export const useAlert = () => {
  const dispatch = useAppDispatch();
  const alert = useCallback(
    (message: string, callback?: () => void) => {
      dispatch(openAlert({ message, callback }));
    },
    [dispatch],
  );
  return alert;
};

const ModalContent = styled('div')(
  ({ theme }) => css`
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === 'dark' ? 'rgb(0 0 0 / 0.5)' : 'rgb(0 0 0 / 0.2)'};
    padding: 24px;
    color: ${theme.palette.mode === 'dark' ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === 'dark' ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `,
);

const Modal = styled(Dialog)`
  z-index: 1301 !important;
  & .MuiDialog-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & .MuiDialog-paper {
    z-index: 1301 !important;
  }
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: 1300;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

interface FadeProps {
  children: React.ReactElement;
  in?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onEnter?: (_node: HTMLElement, _isAppearing: boolean) => void;
  onExited?: (_node: HTMLElement, _isAppearing: boolean) => void;
}

const Fade = forwardRef<HTMLDivElement, FadeProps>((props, ref) => {
  const { in: open, children, onEnter, onExited, ...other } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        // 애니메이션이 실제 요소를 제공하지 않으므로 더미 요소 사용
        onEnter(document.createElement('div'), true);
      }
    },
    onRest: () => {
      if (!open && onExited) {
        // 애니메이션이 실제 요소를 제공하지 않으므로 더미 요소 사용
        onExited(document.createElement('div'), true);
      }
    },
  });

  return (
    <animated.div ref={ref} style={style} {...other}>
      {children}
    </animated.div>
  );
});
