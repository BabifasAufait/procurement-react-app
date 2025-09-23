import React from "react";
import CompletedStep from "./CompletedStep";
import CurrentStep from "./CurrentStep";
import userPhoto from "../../../../assets/profile_photo/userPhoto.png"
import { IStep } from "../../../../types/approvalflowTypes";



const StepCard: React.FC<{ step: IStep, trigger: () => void, flowType:"rfp" | "rfpproposal" | "rfpaward",proposalId?:number }> = ({ step, trigger, flowType, proposalId }) => {
    console.log(step)
    return (
        <div className="bg-white rounded border border-gray-200 overflow-hidden mb-2 hover:shadow-sm transition-all duration-200">
            {/* Header Section */}
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    {/* Role Icon */}
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs">
                            {step.approverRole === 'HOD' ? '👨‍💼' : 
                             step.approverRole === 'IT' ? '💻' : 
                             step.approverRole === 'Finance' ? '💰' : '👤'}
                        </span>
                    </div>
                    
                    {/* Role Title */}
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{step.approverRole}</h3>
                    </div>
                </div>
            </div>

            {/* User Information Section */}
            <div className="p-3">
                <div className="flex items-center space-x-2 mb-2">
                    {/* User Avatar */}
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full border border-white shadow-sm overflow-hidden">
                            <img 
                                className="w-full h-full object-cover" 
                                src={step.photo || userPhoto} 
                                alt={step.approverName} 
                            />
                        </div>
                        {/* Status Indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                    </div>

                    {/* User Details */}
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{step.approverName}</h4>
                        <div className="flex items-center space-x-1 text-gray-600">
                            <span className="text-sm">📧</span>
                            <span className="text-sm">{step.approverEmail}</span>
                        </div>
                    </div>
                </div>

                {/* Action Section */}
                <div className="mt-2">
                    {step.current && step.status == "pending" && <CurrentStep proposalId={proposalId} step={step} trigger={trigger} flowType={flowType} />}
                    {(step.status == "rejected" || step.status == "approved" || step.status == "initiated") && <CompletedStep step={step} />}
                </div>
            </div>
        </div>
    )
};


export default StepCard