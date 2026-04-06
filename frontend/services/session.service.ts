import { api } from "@/lib/api";

export const createSession = async (problemId: string) => {
  const { data } = await api.post("/sessions", { problemId });
  return data.data;
};

export const getActiveSession = async ({page = 1, limit = 20}) => {
    const { data } = await api.get("sessions/active", {
        params: {
            page,
            limit
        }
    });
    return data.data;
} 

export const getMyRecentSessions = async ({ page = 1, limit = 20 }) => {
    const { data } = await api.get("sessions/my-recent", {
        params: {
            page,
            limit
        }
    });
    return data.data;
} 

export const getSessionById = async (id: string) => {
    const { data } = await api.get(`/sessions/${id}`);
    return data.data;
} 

export const joinSession = async (id: string) => {
    const { data } = await api.post(`/sessions/${id}/join`);
    return data.data;
} 

export const leaveSession = async (id: string) => {
    const { data } = await api.post(`/sessions/${id}/leave`);
    return data.data;
} 

export const endSession = async (id: string) => {
    const { data } = await api.post(`/sessions/${id}/end`);
    return data.data;
} 
