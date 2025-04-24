
export interface AsyncResult<T> {
    status: "idle" | "pending" | "success" | "error";
    data: T | null;
    error: Error | null;
}
