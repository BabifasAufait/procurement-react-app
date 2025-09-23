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
import { getAllEvaluationReportsAsync, getAllSelectedProposalsByRfpIdAsync, getRfpDecisionPaperByRfpIdAsync, sendFinalBidRequestAsync } from '../../../services/rfpService';
import Modal from '../../basic_components/Modal';
import RfpDecisionForm from '../../../pages/rfp_decision_form/RfpDecisionForm';
import { Button, Select } from 'antd';
import ViewTable from '../../basic_components/ViewTable';

interface IRfpDetailRight {
    rfpDetails: any
    trigger: () => void
}

const RfpAwardflow: React.FC<IRfpDetailRight> = ({ rfpDetails, trigger }) => {
    const [stepsList, setStepsList] = useState<any[]>([])
    const [showModal, setShowModal] = useState<boolean>(false);
    const [decissionPaper, setDecissionPaper] = useState<any>({
        vendorRfpProposalId: 0
    })
    const [evaluationDocuments, setEvaluationDocuments] = useState<any>([]);
    const [selectedProposals, setSelectedProposals] = useState<any[]>([]);
    const[enableSelect, setEnableSelect] = useState<boolean>(false);

    const setupRfpProposalApproveReject = async () => {
        const response: any[] = await getRpfApprovalFlowsByIdAsync(rfpDetails?.id, "rfpaward");
        const formatedSteps = response.map((item: any, i) => ({ ...item, current: (getUserCredentials().userId == item.approverId && (i == 0 || response[i - 1].status == 1)), status: item.status == 0 ? "pending" : item.status == 1 ? "approved" : "rejected" }));
        setStepsList(formatedSteps);
        if (rfpDetails?.status == 9 || rfpDetails?.status == 10) {
            const evaluationReports = await getAllEvaluationReportsAsync(Number(rfpDetails?.id || "0"));
            const evalutionDocumentMapped = evaluationReports.map((d: any) => ({ documentUrl: d.filePath, documentName: d.fileTitle }));
            setEvaluationDocuments(evalutionDocumentMapped);
            const selectedProposalsList = await getAllSelectedProposalsByRfpIdAsync(rfpDetails?.id || 0);
            console.log(selectedProposalsList, "selectedProposalsList--------------selectedProposalsList")
            setSelectedProposals(selectedProposalsList);
            const decissionPaperTemp = await getRfpDecisionPaperByRfpIdAsync(rfpDetails?.id);
            if (decissionPaperTemp) setDecissionPaper(decissionPaperTemp);
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
                            evaluationDocuments.map((d: any) => (<span><a className="text-[13px] flex items-end mb-5" href={d.documentUrl ? d.documentUrl : d.document} target="blank" download={d.documentName} ><DocumentIconByExtension className="w-[25px] h-[25px]" filePath={d.documentUrl} /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{d.documentName}</p></a><label htmlFor="upload-eval-file"></label></span>))
                        }
                    </div>
                </>}

                <div className="w-full">

                    {selectedProposals.length > 0 && (
                        <div className="space-y-4">
                            <span className="font-bold text-[16px] mb-[8px] flex"><span>Vendor Proposals</span></span>
                            <ViewTable
                                columns={["vendor", "bidAmount"]}
                                columnLabels={{ vendor: "Vendor", bidAmount: "Bid Amount" }}
                                items={selectedProposals.map((p: any) => ({
                                    id: p.id,
                                    vendor: p.vendorName || `Vendor #${p.vendorId}`,
                                    bidAmount: p.bidAmount,
                                }))}
                            />

                            {selectedProposals.map((p: any) => (
                                <div key={p.id} className="space-y-2">
                                    <span className="font-bold text-[14px] flex"><span>Bid split - {p.vendorName || `Vendor #${p.vendorId}`}</span></span>
                                    <ViewTable
                                        columns={["itemCode", "itemName", "quantity", "amount"]}
                                        columnLabels={{ itemCode: "Item Code", itemName: "Item Name", quantity: "Qty", amount: "Amount" }}
                                        items={(p.vendorRfpProposalItems || []).map((it: any) => ({
                                            id: it.id,
                                            itemCode: it.rfpItem?.itemCode,
                                            itemName: it.rfpItem?.itemName,
                                            quantity: it.rfpItem?.quantity,
                                            amount: it.amount,
                                        }))}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-md mb-1">Selectd vendor for Award</label>
                                <Select className='w-[400px]' placeholder="Select proposal" disabled={!enableSelect} onChange={(val) => setDecissionPaper((x: any) => ({ ...x, vendorRfpProposalId: val }))} value={decissionPaper.vendorRfpProposalId} allowClear options={selectedProposals.map((c: any) => ({ value: c.id, label: c.vendorName })) || []} />
                            </div>
                        </div>
                    )}

                </div>

                {rfpDetails?.finalBidSubmitted == null && <div className='w-full flex justify-end'>
                    <Button type='primary' onClick={() => {
                        (async () => {
                            await sendFinalBidRequestAsync(rfpDetails?.id);
                            trigger && trigger()
                        })();
                    }}>Send Final Bid Request</Button>
                </div>}

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
                                        proposalId={decissionPaper.vendorRfpProposalId}
                                        flowType='rfpaward'
                                        key={index}
                                        step={step || []}
                                        trigger={() => {
                                            setupRfpProposalApproveReject();
                                        }}
                                    />
                                );
                            }
                            setEnableSelect(true);
                            // Show future steps in a plain div
                            return (
                                (rfpDetails.status == 1 || rfpDetails.status == 2) && (rfpDetails.createdBy == getUserCredentials().userId) ?
                                    <StepCard
                                        proposalId={decissionPaper.vendorRfpProposalId}
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