import React, { useState } from "react";
import TextField from "../../basic_components/TextField";
import { KeyValueGrid } from "./RfpDetailLeft";
import { DocumentIcon, GeneralDetailIcon } from "../../../utils/Icons";
import { updateProposalStatusAsync } from "../../../services/rfpService";

type ProposalSubmissionModalProps = {
  trigger: () => void
  proposal?: any
};

const ProposalSubmissionModal: React.FC<ProposalSubmissionModalProps> = ({ trigger, proposal }) => {

  const handleSubmit = async (e: React.FormEvent,type : "Approved" | "Rejected" ) => {
    e.preventDefault();

    await updateProposalStatusAsync(proposal?.id ?? 0 , type);
    trigger();
  };




  return (
    <div className="w-full h-full flex flex-col" >
      {/* Left Section */}
      <form
        onSubmit={(e) => { }}
        className="flex flex-col w-full h-full bg-white rounded overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-rounded scrollbar-track-blue-100"
      >
        <div className="bg-white w-full pt-3 pl-3 mb-[8px]">
          <div>
            <span className="font-bold text-[22px] leading-[33.8px] mb-[8px] block">{proposal?.vendorName}</span>
            <span className="mb-[4px] block" style={{ color: "gray", fontSize: "14px" }}>Malappuuram, Kerala</span>
            <span style={{ padding: "4px 8px", border: "1px solid #A8AEBA", borderRadius: "20px", fontSize: "14px", backgroundColor: "#EBEEF4" }}>ID: {proposal?.vendorCode}</span>
          </div>
        </div>
        <div className="p-4 rounded">
          <div className="mb-2">
            <KeyValueGrid className="mb-[16px]"
              data={[
                { label: "Bid Amount", value: proposal?.bidAmount ?? 0 },
                { label: "Bid Validity", value: `${proposal?.bidValidity ?? 0} days` },
              ]}
            />
            <KeyValueGrid className="mb-[16px]"
              data={[
                { label: "Tax Included", value: proposal?.isTaxIncluded ? "Yes" : "No"},
                { label: "Included Delivery/Logistics", value: proposal?.isShippingIncluded ? "Yes" : "No" },
              ]}
            />
            {/* Payment Terms */}
            <div className="mb-[16px]" style={{ width: "504px" }}>
              <span className="mb-[4px]" style={{ color: "gray", fontSize: "12px" }}>Payment Terms</span>
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{proposal?.paymentTerms}</p>
            </div>

            {/* Description */}
            <div className="mb-[16px]" style={{ width: "504px" }}>
              <span className="mb-[4px]" style={{ color: "gray", fontSize: "12px" }}>Escalation Clause / Price Revisions</span>
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{proposal?.escalationTerms}</p>
            </div>

            <span className="font-bold text-[16px] mb-[17.5px] flex"><GeneralDetailIcon className="size-5" /><span className="pl-[8px]">Documents</span></span>
            <div className="flex flex-col mb-[16px]">
              <a className="text-[13px] flex" href={""} download={""}><DocumentIcon className="size-4" /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{"temp.pdf"}</p></a>
              <a className="text-[13px] flex" href={""} download={""}><DocumentIcon className="size-4" /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{"temp.pdf"}</p></a>
              <a className="text-[13px] flex" href={""} download={""}><DocumentIcon className="size-4" /><p className="pl-[4px]" style={{ color: "blue", textDecoration: "underline" }}>{"temp.pdf"}</p></a>
            </div>
          </div>
        </div>
        <div className="flex justify-start items-center pl-4 h-[84px] space-x-2">
          <button
            onClick={(e) => handleSubmit(e,"Approved")}
            type="submit"
            // disabled={showLoaderOnButton || budgetLoader ? true : false}
            className={`bg-blue-500 w-full h-[36px] bg-blue-500 hover:bg-blue-400 text-sm pr-2 py-1 text-white rounded px-1 py-1`}
          >
            Approve
          </button>
          <button
            onClick={(e) => handleSubmit(e,"Rejected")}
            type="submit"
            // disabled={showLoaderOnButton || budgetLoader ? true : false}
            className={`bg-blue-500 w-full h-[36px] bg-red-500 hover:bg-red-400 text-sm py-1 text-white rounded px-1 py-1`}
          >
            Reject
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProposalSubmissionModal;
