let showToastHandler = null;

export const setToastHandler = (handler) => {
  showToastHandler = handler;
};

const normalizeMessage = (message) => {
  if (message === undefined || message === null) return '';
  if (typeof message === 'string') return message;
  if (message instanceof Error) return message.message;
  return String(message);
};

const callToast = (type, title, message, options = {}) => {
  if (!showToastHandler) {
    return;
  }
  showToastHandler(type, title, normalizeMessage(message), options.duration);
};

const toast = (message, options = {}) => {
  callToast('info', options.title || 'Notice', message, options);
};

toast.success = (message, options = {}) => {
  callToast('success', options.title || 'Success', message, options);
};

toast.error = (message, options = {}) => {
  callToast('error', options.title || 'Error', message, options);
};

toast.warning = (message, options = {}) => {
  callToast('warning', options.title || 'Warning', message, options);
};

toast.info = (message, options = {}) => {
  callToast('info', options.title || 'Info', message, options);
};

toast.ai = (message, options = {}) => {
  callToast('ai', options.title || 'AI', message, options);
};

export default toast;

