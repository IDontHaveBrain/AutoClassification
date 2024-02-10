import {forwardRef, useCallback, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/rootHook";
import {closeAlert, onAlert} from "../../store/rootSlice";
import {AlertDetail} from "../../model/GlobalModel";
import {Modal as BaseModal} from '@mui/base/Modal';
import {animated, useSpring} from '@react-spring/web';
import {Backdrop, css, styled} from "@mui/material";
import {useDispatch} from "react-redux";
import {blue, blueGrey, grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import {Strings} from "../../utils/strings";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
};

const AlertModal = () => {
    const dispatch = useDispatch();
    const alert = useAppSelector(state => state.alert);

    // useEffect(() => {
    //     window.addEventListener("alert", handler as any);
    //     return () => {
    //         window.removeEventListener("alert", handler as any);
    //     };
    // }, [handler]);

    const onClose = () => {
        if (alert && alert.open && alert.callback) {
            alert.callback();
        }
        dispatch(closeAlert());
    }

    return (
        <Modal
            aria-labelledby="spring-modal-title"
            aria-describedby="spring-modal-description"
            open={alert.open}
            onClose={onClose}
            closeAfterTransition
            slots={{ backdrop: StyledBackdrop }}
        >
            <Fade in={alert.open}>
                <ModalContent sx={style}>
                    <h2 id="spring-modal-title" className="modal-title">
                        Alert
                    </h2>
                    <p id="spring-modal-description" className="modal-description">
                        {alert.message}
                    </p>

                    <Button onClick={onClose}
                            sx={{
                                background: blue["500"],
                                color: 'black',
                                '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white'
                                }
                            }}>{Strings.ok}</Button>
                </ModalContent>
            </Fade>
        </Modal>
    )
}

export default AlertModal;

export const useAlert = () => {
    const dispatch = useAppDispatch();
    const alert = useCallback((message: string, callback?: () => void) => {
        dispatch(onAlert({message, callback}));
    }, [dispatch]);
    return alert;
};

const ModalContent = styled('div')(
    ({theme}) => css`
        font-family: 'IBM Plex Sans', sans-serif;
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
        box-shadow: 0 4px 12px ${theme.palette.mode === 'dark' ? 'rgb(0 0 0 / 0.5)' : 'rgb(0 0 0 / 0.2)'};
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

const Modal = styled(BaseModal)`
    position: fixed;
    z-index: 1300;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
    z-index: -1;
    position: fixed;
    inset: 0;
    background-color: rgb(0 0 0 / 0.5);
    -webkit-tap-highlight-color: transparent;
`;

interface FadeProps {
    children: React.ReactElement;
    in?: boolean;
    onClick?: any;
    onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
    onExited?: (node: HTMLElement, isAppearing: boolean) => void;
}

const Fade = forwardRef<HTMLDivElement, FadeProps>(function Fade(props, ref) {
    const {in: open, children, onEnter, onExited, ...other} = props;
    const style = useSpring({
        from: {opacity: 0},
        to: {opacity: open ? 1 : 0},
        onStart: () => {
            if (open && onEnter) {
                onEnter(null as any, true);
            }
        },
        onRest: () => {
            if (!open && onExited) {
                onExited(null as any, true);
            }
        },
    });

    return (
        <animated.div ref={ref} style={style} {...other}>
            {children}
        </animated.div>
    );
});