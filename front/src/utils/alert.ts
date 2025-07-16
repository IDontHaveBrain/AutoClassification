import { type AlertDetail } from 'types';

export const onAlert = (message: string, callback?: () => void) => {
  const doAlert = (detail: AlertDetail) => {
    window.dispatchEvent(
      new CustomEvent('Alert', {
        detail,
      }),
    );
  };
  doAlert({ message, callback });
};