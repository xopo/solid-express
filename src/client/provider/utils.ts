import { apiGetContent } from "../api";
import { Reservation, User } from "../components/MainPage";

export const getData = async (date: string): Promise<{users: User[], tables: Reservation[]}> => {
    console.log('get data', date)
    const result =  await apiGetContent(btoa(date));
    if (result?.data) {
        return {
            users: JSON.parse(result.data.users),
            tables: JSON.parse(result.data.tables),
        }
    }
    return {users: [], tables: []};
}
