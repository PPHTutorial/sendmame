
import { TriangleAlert } from "lucide-react"
import { ToastOptions } from "react-hot-toast"

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}


export const toastErrorStyle = {
  style: {
    borderColor: '1px solid #ff4d4f',
    fontSize: '14px',
    color: '#ff4d4f',
    backgroundColor: '#fff1f0',
  }
}
export const toastSuccessStyle = {
  style: {
    borderColor: '1px solid #4caf50',
    fontSize: '14px',
    color: '#4caf50',
    backgroundColor: '#e8f5e9',
  }
}

export const toastWarningStyle: ToastOptions = {
  style: {
    borderColor: '1px solid #ffcc00',
    fontSize: '14px',
    color: '#ffcc00',
    backgroundColor: '#fff8e1',
  },
}