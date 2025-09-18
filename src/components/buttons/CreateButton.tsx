import React from "react";
import { AddIcon, TickIcon } from "../../utils/Icons";

interface CreateButtonProps{
    name:string;
    onClick:()=>void;
    width?:string;
    height?:string;
}

const CreateButton:React.FC<CreateButtonProps>=({name,onClick,width="146px",height="36px"})=>{
    return(
        <button onClick={onClick} className={`w-[${width}] p-3 h-[${height}] bg-customBlue text-white rounded-md flex justify-end items-center text-sm`}>
            <AddIcon className="w-6 pr-2 h-6"/> {name}
        </button>
    )
}

export const PublishButton:React.FC<CreateButtonProps>=({name,onClick,width="146px",height="36px"})=>{
    return(
        <button onClick={onClick} className={`w-[${width}] p-3 h-[${height}] bg-customBlue text-white rounded-md flex justify-end items-center text-sm`}>
            <TickIcon className="w-6 pr-2 h-6"/> {name}
        </button>
    )
}

export default CreateButton