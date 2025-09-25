import { JSX } from "react"

export interface ColumnData{
    columnName:string,
    operator?:string | undefined
    value:string | number | Date | null | undefined | boolean
}

export interface IFilterDto{
    fields:ColumnData[]
    sortDirection?:string | undefined
    sortColumn?:string | undefined
    pageNo?:number
    pageSize?:number
    globalSearch?:string
}

export interface statusDataProp {
    icon: JSX.Element | string,
    label: string,
    value: number,
    color: string,
    textColor: string,
}

export interface IModalProps{
    closeModal: () => void;
    trigger: ()=>void
}

export interface SuccessResponse{
    status:boolean,
    message:string
}

export interface ErrorResponse{
    statusCode:number
    status:boolean,
    message:string
}

export interface INotificationItem {
    id: number;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    clientId: string;
    uid: string;
    title: string;
    description: string;
    userId: number;
    userType: string;
    uniqueId:string;
    notificationType:string;
    status: string;
    priority: string;
    isRead: boolean;
    isArchived: boolean;
    isDeleted:boolean;
  }

  export interface ICountryCode {
    id: string;
    countryName: string,
    code: string;
    countryCode: string;
    currency: string;
    currencyLabel: string;
}



