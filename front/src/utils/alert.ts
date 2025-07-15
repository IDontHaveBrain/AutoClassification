export const onAlert = (message: string, callback?: () => void) => {
  const doAlert = (detail) => {
    window.dispatchEvent(
      new CustomEvent('Alert', {
        detail,
      }),
    );
  };
  doAlert({ message, callback });
};