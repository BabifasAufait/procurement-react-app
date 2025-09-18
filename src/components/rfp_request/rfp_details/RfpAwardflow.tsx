// ApprovalWorkflow.tsx
import React, { useEffect, useState } from 'react';
// import { getApprovalFlowById } from '../../services/flowService';
// import { getAllUsersByFilterAsync } from '../../services/userService';
// import { ApprovalStep } from '../../types/approvalTypes';
// import { handleFile } from '../../utils/common';
// import userPhoto from "../../../assets/profile_photo/userPhoto.png"
// import { IStep } from '../../../types/approvalflowTypes';
import { getRpfApprovalFlowsByIdAsync } from '../../../services/flowService';
import { getUserCredentials } from '../../../utils/common';
import StepIndicator from './rfp_approve-reject_right_component/StepIndicator';
import StepCard from './rfp_approve-reject_right_component/StepCard';
import { DocumentIconByExtension, GeneralDetailIcon } from '../../../utils/Icons';
import { getAllEvaluationReportsAsync, sendFinalBidRequestAsync } from '../../../services/rfpService';
import Modal from '../../basic_components/Modal';
import RfpDecisionForm from '../../../pages/rfp_decision_form/RfpDecisionForm';
import { Button } from 'antd';
import ViewTable from '../../basic_components/ViewTable';

interface IRfpDetailRight {
    rfpDetails: any
    trigger: () => void
}

const RfpAwardflow: React.FC<IRfpDetailRight> = ({ rfpDetails, trigger }) => {
    const [stepsList, setStepsList] = useState<any[]>([])
    const [showModal, setShowModal] = useState<boolean>(false);
    const [evaluationDocuments, setEvaluationDocuments] = useState<any>([
        // {
        //     fileTitle: "asjhads",
        //     filePath: "sdhgfdsjhfdsk.png"
        // }
    ]);


    const setupRfpProposalApproveReject = async () => {
        const response: any[] = await getRpfApprovalFlowsByIdAsync(rfpDetails?.id, "rfpaward");
        const formatedSteps = response.map((item: any, i) => ({ ...item, current: (getUserCredentials().userId == item.approverId && (i == 0 || response[i - 1].status == 1)), status: item.status == 0 ? "pending" : item.status == 1 ? "approved" : "rejected" }));
        setStepsList(formatedSteps);
        if (rfpDetails?.status == 9) {
            const evaluationReports = await getAllEvaluationReportsAsync(Number(rfpDetails?.id || "0"));
            const evalutionDocumentMapped = evaluationReports.map((d: any) => ({ documentUrl: d.filePath, documentName: d.fileTitle }));
            setEvaluationDocuments(evalutionDocumentMapped);
        }
    }

    useEffect(() => {
        setupRfpProposalApproveReject()
    }, [rfpDetails.id])

    return (
        <>
            <div className="w-full space-y-2 desktop:max-w-[712px] mx-auto rounded-lg h-full px-6 max-h-[890px] overflow-y-auto scrollbar">
                <StepIndicator steps={stepsList} />


                <div className="w-full">
                    <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Approval for Award</span></span>
                </div>
                <div
                    className={`border border-lightblue p-4 flex text-sm rounded-lg bg-[#EDF4FD] mb-[16px] flex-col`}
                >
                    <div className="pr-[55px] group relative">
                        <span className="font-bold text-[16px] mb-[17.5px] flex"><span>Decission Paper</span></span>
                        <div className='flex flex-col' onClick={() => setShowModal(true)}>
                            <p className='font-bold text-blue-600 cursor-pointer'>{"View >"}</p>
                        </div>
                    </div>
                </div>
                {evaluationDocuments.length > 0 && <>
                    <span className="font-bold text-[16px] mb-[17.5px] flex"><span>Evaluation Report</span></span>
                    <div className='flex flex-col'>
                        {
                            evaluationDocuments.map((d: any) => (<span><a className="text-[13px] flex items-end mb-5" href={d.documentUrl ? d.documentUrl : d.document} target="blank" download={d.documentName} ><DocumentIconByExtension className="w-[25px] h-[25px]" filePath={d.documentUrl} /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{d.documentName}</p></a><label htmlFor="upload-eval-file"><span className='px-3 py-2 bg-white rounded-md border'>Reupload</span></label></span>))
                        }
                    </div>
                </>}

                {rfpDetails?.finalBidSubmitted == null && <div className='w-full flex justify-end'>
                    <Button type='primary' onClick={() => {
                        (async () => {
                            await sendFinalBidRequestAsync(rfpDetails?.id);
                            trigger && trigger()
                        })();
                    }}>Send Final Bid Request</Button>
                </div>}
                {/* <div className="w-full">


                    <ViewTable columns={[""]}/>

                </div> */}
                {(rfpDetails?.finalBidSubmitted == true || rfpDetails?.finalBidSubmitted == null) ? <>
                    <div className="w-full">
                        {stepsList.map((step, index) => {
                            // Find the index of the current step

                            // Find the latest step with currentUser that comes after stepCurrent
                            let currentIndex = -1;
                            for (let i = 0; i < stepsList.length; i++) {
                                if (stepsList[i].current) {
                                    currentIndex = i;
                                }
                            }

                            // Show all steps up to (and including) the currentIndex in StepCard
                            if (index <= currentIndex) {
                                return (
                                    <StepCard
                                        flowType='rfpaward'
                                        key={index}
                                        step={step || []}
                                        trigger={() => {
                                            setupRfpProposalApproveReject();
                                        }}
                                    />
                                );
                            }

                            // Show future steps in a plain div
                            return (
                                (rfpDetails.status == 1 || rfpDetails.status == 2) && (rfpDetails.createdBy == getUserCredentials().userId) ?
                                    <StepCard
                                        flowType="rfpaward"
                                        key={index}
                                        step={step || []}
                                        trigger={() => {
                                            setupRfpProposalApproveReject();
                                        }}
                                    /> :
                                    <div key={index} className="text-gray-500 mb-4 bg-white px-2 py-2 rounded-md flex-col items-center justify-center">
                                        {step.approverRole} <p className='text-xs'>{step.approverName} | {step.approverEmail}</p>
                                    </div>
                            );
                        })}
                    </div></> :
                    <div className="w-full">
                        The RFP Under final bid submission
                    </div>}
            </div>
            <Modal width='4/4' title='Decision Paper for Award' contentPosition="center" isOpen={showModal}
                content={<RfpDecisionForm type={"view"} rfpIdFromParent={rfpDetails.id} />}
                onClose={() => { setShowModal(prev => !prev) }}
            />
        </>
    );
};

export default RfpAwardflow;