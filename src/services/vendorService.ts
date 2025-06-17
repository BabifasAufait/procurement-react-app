import axios from "axios";
import { Urls } from "./ApiConfig";
import { getUserToken } from "../utils/common";

export const getAllVendorsAsync = async (data: any) => {
    try {
        const response = await axios.post(`${Urls.defaultUrl}/api/Vendor/GetAllVendors`, data, {
            headers: {
                Authorization: `Bearer ${getUserToken()}`
            }
        })
        return response.data;
    } catch (err) {

    }
}