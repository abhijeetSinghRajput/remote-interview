import { toast } from "sonner";

export function showApiErrorToast(err: any) {
  let message = "An unexpected error occurred.";
  if (err?.response?.data?.message) {
    message = err.response.data.message;
  } else if (err?.message) {
    message = err.message;
  }
  toast.error(message);
}
