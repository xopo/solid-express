import { apiGetContent } from "../api";
import { Guest, Reservation, User } from "./ReserveProvider";

export const getData = async (date: string): Promise<{users: User[], tables: Reservation[], guests: Guest[]}> => {
    const result =  await apiGetContent(date);
    if (result?.data) {
        return result.data;
    }
    return {users: [], tables: [], guests: []};
}
