import { toast } from "@heroui/react";

export function sucesso(msg: string) {
  toast.success(msg);
}

export function erro(msg: string) {
  toast.danger(msg);
}

export function info(msg: string) {
  toast.info(msg);
}
