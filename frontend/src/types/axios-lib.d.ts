import type { AxiosInstance } from "axios";

declare module "*/lib/axios" {
  const api: AxiosInstance;
  export default api;
}
