import React, { useEffect, useState } from "react";
import { KeyValueGrid } from "./RfpDetailLeft";
import { DocumentIconByExtension, GeneralDetailIcon, TickIcon } from "../../../utils/Icons";
import { getAllProposalDocuments, getAllProposalRemarkAttachmentsAsync, uploadProposalRemarkAttachmentAsync } from "../../../services/rfpService";
import { documentTypeConst } from "../../../utils/constants";
import { getUserCredentials } from "../../../utils/common";
import AddAttachment from "../../basic_components/AddAttachments";
import { notification } from "antd";
import ViewTable from "../../basic_components/ViewTable";

type ProposalSubmissionModalProps = {
  rfp: any;
  trigger: () => void
  proposal?: any
};

const ProposalSubmissionModal: React.FC<ProposalSubmissionModalProps> = ({ rfp, proposal }) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [remarksAttachment, setRemarksAttachment] = useState<any[]>([]);

  const [ownerIn, setOwnerIn] = useState<{ technical: boolean, commercial: boolean }>({
    technical: false, commercial: false
  })

  // const handleSubmit = async (e: React.FormEvent, type: "Approved" | "Rejected") => {
  //   e.preventDefault();

  //   await updateProposalStatusAsync(proposal?.id ?? 0, type);
  //   trigger();
  // };


  const setupProposalModal = async () => {
    try {
      const response = await getAllProposalDocuments(proposal.rfpId, proposal.id);
      setAttachments(response);

      const tempOwnerIn = {
        technical: false, commercial: false
      };

      (rfp?.rfpOwners as any[])?.forEach(ow => {
        if (ow.ownerId.toString() == getUserCredentials().userId && ow.ownerType == documentTypeConst.technical) tempOwnerIn.technical = true;
        else if (ow.ownerId.toString() == getUserCredentials().userId && ow.ownerType == documentTypeConst.commercial) tempOwnerIn.commercial = true;
      })
      setOwnerIn(tempOwnerIn);

      const proposalRemarkAttachments = await getAllProposalRemarkAttachmentsAsync(proposal.id);
      const tempProposalRemarkAttachments = proposalRemarkAttachments.map((item: any) => ({ document: null, documentName: item?.fileTitle, documentUrl: item?.filePath }))
      setRemarksAttachment(tempProposalRemarkAttachments);
    } catch (err) { }
  }


  useEffect(() => {
    setupProposalModal();
  }, [proposal])

  return (
    <div className="w-full h-full relative" >
      {/* Left Section */}
      <form
        onSubmit={() => { }}
        className="flex flex-col w-full h-full bg-white rounded overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-rounded scrollbar-track-blue-100 overflow-auto"
      >
        <div className="h-full flex flex-col">
          <div className="bg-white w-full pt-3 pl-3 mb-[8px]">
            <div>
              <span className="font-bold text-[22px] leading-[33.8px] mb-[8px] block">{proposal?.vendorName}</span>
              <span style={{ padding: "4px 8px", border: "1px solid #A8AEBA", borderRadius: "20px", fontSize: "14px", backgroundColor: "#EBEEF4" }}>ID: {proposal?.vendorCode}</span>
            </div>
          </div>
          <div className="p-4 rounded">
            <div className="mb-2">
              <KeyValueGrid className="mb-[16px]"
                data={[
                  { label: "Bid Amount", value: ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? proposal?.bidAmount ?? 0 : "*********" },
                  { label: "Bid Validity", value: ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? `${proposal?.bidValidity ?? 0} days` : "*********" },
                ]}
              />
              <KeyValueGrid className="mb-[16px]"
                data={[
                  { label: "Tax Included", value: ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? proposal?.isTaxIncluded ? "Yes" : "No" : "*********" },
                  { label: "Included Delivery/Logistics", value: ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? proposal?.isShippingIncluded ? "Yes" : "No" : "*********" },
                ]}
              />
              {/* Payment Terms */}
              <div className="mb-[16px]" style={{ width: "504px" }}>
                <span className="mb-[4px]" style={{ color: "gray", fontSize: "12px" }}>Payment Terms</span>
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? proposal?.paymentTerms : "*********"}</p>
              </div>

              {/* Description */}
              <div className="mb-[16px]" style={{ width: "504px" }}>
                <span className="mb-[4px]" style={{ color: "gray", fontSize: "12px" }}>Escalation Clause / Price Revisions</span>
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? proposal?.escalationTerms : "*********"}</p>
              </div>
              
              <div className="mb-[16px]" style={{ width: "504px" }}>
                <span className="font-bold text-[16px] mb-[8px] flex">
                  <span>Bid Split</span>
                </span>
                <ViewTable
                  columns={["itemCode", "itemName", "quantity", "amount"]}
                  columnLabels={{ 
                    itemCode: "Item Code", 
                    itemName: "Item Name", 
                    quantity: "Qty", 
                    amount: "Amount" 
                  }}
                  items={(proposal?.vendorRfpProposalItems || []).map((item: any) => ({
                    id: item.id,
                    itemCode: item.rfpItem?.itemCode || "",
                    itemName: item.rfpItem?.itemName || "",
                    quantity: ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? item.rfpItem?.quantity || 0 : "***",
                    amount: ownerIn.commercial || rfp.createdBy.toString() == getUserCredentials().userId ? item.amount || 0 : "***"
                  }))}
                />
              </div>

              {ownerIn.technical && <>
                <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Technical Documents</span></span>
                <div className="flex flex-col mb-[16px]">
                  {attachments.map((doc) => doc.documentTypeId == documentTypeConst.technical ? <a className="text-[13px] flex" href={doc?.filePath} download={doc?.fileTitle}><DocumentIconByExtension filePath={doc?.filePath} className="w-5 h-5" /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{doc?.fileTitle}</p></a> : <></>)}
                </div></>}
              {ownerIn.commercial && <>
                <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Commercial Documents</span></span>
                <div className="flex flex-col mb-[16px]">
                  {attachments.map((doc) => doc.documentTypeId == documentTypeConst.commercial ? <a className="text-[13px] flex" href={doc?.filePath} download={doc?.fileTitle}><DocumentIconByExtension filePath={doc?.filePath} className="w-5 h-5" /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{doc?.fileTitle}</p></a> : <></>)}
                </div>
              </>}
            </div>
          </div>

          <div className="w-full flex flex-col items-center space-y-1">
            {proposal?.isTechnicalTeamApproved && <div className="w-10/12 p-4 flex text-sm rounded-lg bg-[#EDF4FD]"><TickIcon className="w-5 h-5" />Technical team Approved</div>}
            {proposal?.isCommercialTeamApproved && <div className="w-10/12 p-4 flex text-sm rounded-lg bg-[#EDF4FD]"><TickIcon className="w-5 h-5" />Commercial team Approved</div>}
          </div></div>
        {(ownerIn.technical || ownerIn.commercial) && <div className="w-full p-4">
          <span className="font-bold text-[16px] mb-[12px] flex"><span className="">Remarks</span></span>
          <AddAttachment viewOnly={rfp.status == 6} id={"file-upload-1"} attachments={remarksAttachment} setAttachments={async (file) => {
            setRemarksAttachment([file])
            const formData = new FormData();
            formData.append("File", file.document);
            formData.append("VendorRfpProposalId", proposal?.id);
            await uploadProposalRemarkAttachmentAsync(formData)
            notification.success({ message: "Attachment uploaded successfully" });
            setupProposalModal();
          }} />
        </div>}
        {/* {proposal?.status != "Approved" && proposal?.status != "Rejected" && (ownerIn.technical && !proposal?.isTechnicalTeamApproved  || ownerIn.commercial && !proposal?.isCommercialTeamApproved) && <div className="w-full flex justify-start pl-4 py-2 space-x-2 absolute bottom-0">
          <button
            onClick={(e) => handleSubmit(e, "Approved")}
            type="submit"
            // disabled={showLoaderOnButton || budgetLoader ? true : false}
            className={`h-[36px] bg-blue-500 hover:bg-blue-400 text-sm py-1 px-2 text-white rounded`}
          >
            Approve
          </button>
          <button
            onClick={(e) => handleSubmit(e, "Rejected")}
            type="submit"
            // disabled={showLoaderOnButton || budgetLoader ? true : false}
            className={`h-[36px] bg-red-500 hover:bg-red-400 text-sm py-1 px-2 text-white rounded`}
          >
            Reject
          </button>
        </div>} */}
      </form>
    </div>
  );
}

export default ProposalSubmissionModal;
