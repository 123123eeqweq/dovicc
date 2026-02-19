import { ToastType } from '@/components/ui/Toast';

let toastContext: {
  showToast: (type: ToastType, message: string) => void;
} | null = null;

export function setToastContext(context: { showToast: (type: ToastType, message: string) => void }) {
  toastContext = context;
}

export const toast = {
  success: (message: string) => {
    if (toastContext) {
      toastContext.showToast('success', message);
    }
  },
  error: (message: string) => {
    if (toastContext) {
      toastContext.showToast('error', message);
    }
  },
  info: (message: string) => {
    if (toastContext) {
      toastContext.showToast('info', message);
    }
  },
  warning: (message: string) => {
    if (toastContext) {
      toastContext.showToast('warning', message);
    }
  },
};
