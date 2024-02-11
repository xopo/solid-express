import { apiGetContent } from "../api";
import { Reservation, User } from "./ReserveProvider";

export const getData = async (date: string): Promise<{users: User[], tables: Reservation[]}> => {
    console.log('get data', date)
    const result =  await apiGetContent(btoa(date));
    if (result?.data) {
        return result.data;
    }
    return {users: [], tables: []};
}
