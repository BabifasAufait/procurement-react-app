import axios from "axios";
import { Urls } from "./ApiConfig";
import { getUserToken } from "../utils/common";

export const getAllNotificationsAsync = async () => {
    try {
        let response = await axios.get(`${Urls.defaultUrl}/api/Notifications`, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    }catch (err: any) {
        throw err.response.data;
    }
}

export const updateNotificationAsync = async (id:number,notification:any) => {
    try {
        let response = await axios.put(`${Urls.defaultUrl}/api/Notifications/${id}`, notification,{
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    }catch (err: any) {
        throw err.response.data;
    }
}

//delete notifications
export const deleteNotificationAsync = async (ids:number[]) => {
    try {
        let response = await axios.post(`${Urls.defaultUrl}/api/Notifications/delete`, 
            ids
        ,{
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;

    }catch (err: any) {
        throw err.response.data;
    }
}