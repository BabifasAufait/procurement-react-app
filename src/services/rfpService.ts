import axios from "axios"
import { Urls } from "./ApiConfig"
import { getUserToken } from "../utils/common"
import { IFilterDto } from "../types/commonTypes"
import { defaultFilter } from "../utils/constants"

export const createOrUpdateRfpAsync = async(data:any)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps`,data,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const sendFinalBidRequestAsync = async(rfpId:number)=>{

    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/SentForFinalBidding?rfpId=${rfpId}`,null,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const publishRfpAsync = async(rfpId:number)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/RfpPublish?rfpId=${rfpId}`,null,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const openRfpProposalsAsync = async(rfpId:number)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/OpenRfpProposal?rfpId=${rfpId}`,null,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getRfpByIdAsync = async(id:number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/${id}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getAllRfpsByFilterAsync = async(filterDto:IFilterDto = defaultFilter)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/filter`,filterDto,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}


export const getAllProposalsByFilterAsync = async(filterDto:IFilterDto)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/GetAllRfpProposalsAsync`,filterDto,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getProposalByIdAsync = async(id : number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/GetAllRfpProposalsAsync/${id}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getAllProposalDocuments = async(rfpId : number, proposalId : number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/GetVendorProposalsDocuments?rfpId=${rfpId}&vendorProposalId=${proposalId}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const updateProposalStatusAsync = async(proposalId : number,status : "Pending" | "Approved" | "Rejected")=>{
    try{
        const response = await axios.put(`${Urls.defaultUrl}/api/Rfps/UpdateProposalStatus?proposalId=${proposalId}&status=${status}`,null,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const deleteRfpByIdAsync = async(id:any)=>{
    try{
        const response = await axios.delete(`${Urls.defaultUrl}/api/Rfps/${id}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const sendRfpClarificationRequestAsync = async(data:any)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/SendVendorClarificationRequest`,data,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getAllRfpsClarification = async(rfpId:number,vendorId:number)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/GetVendorClarification?rfpId=${rfpId}&vendorId=${vendorId}`,null,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getAllRfpIntrestByFilterAsync = async(filterDto:IFilterDto)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/GetAllRfpIntrestsAsync`,filterDto,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const uploadProposalRemarkAttachmentAsync = async(data:FormData)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/UploadProposalRemarkAttachment`,data,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getAllProposalRemarkAttachmentsAsync = async(proposalId:number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/GetAllProposalRemarkAttachments?proposalId=${proposalId}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const uploadEvaluationReportAsync = async(data:FormData)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/UploadRfpEvaluationReport`,data,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getAllEvaluationReportsAsync = async(rfpId:number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/GetAllRfpEvaluationReports?rfpId=${rfpId}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const createOrUpdateRfpDecisionPaperAsync = async(data:any)=>{
    try{
        const response = await axios.post(`${Urls.defaultUrl}/api/Rfps/RfpDecisionPapers`,data,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getRfpDecisionPapersAsync = async(id:number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/RfpDecisionPapers/${id}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getRfpDecisionPaperByRfpIdAsync = async(id:number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/RfpDecisionPapers?rfpId=${id}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}

export const getAllSelectedProposalsByRfpIdAsync = async(rfpId:number)=>{
    try{
        const response = await axios.get(`${Urls.defaultUrl}/api/Rfps/GetAllSelectedProposalsByRfpId/${rfpId}`,{
            headers:{
                Authorization:`Bearer ${getUserToken()}`
            }
        })
        return response.data;
    }catch(err){
        console.log(err);
    }
}
