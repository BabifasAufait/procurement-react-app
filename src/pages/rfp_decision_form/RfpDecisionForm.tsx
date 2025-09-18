import { useEffect, useState } from "react";
import { Form, Input, Select, DatePicker, Upload, Button, Space, message } from "antd";
import dayjs from "dayjs";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";
import CommonTitleCard from "../../components/basic_components/CommonTitleCard";
import { createOrUpdateRfpDecisionPaperAsync, getAllProposalsByFilterAsync, getAllRfpsByFilterAsync, getRfpDecisionPaperByRfpIdAsync } from "../../services/rfpService";
import { getAllBudgetTypesAsync, getAllContractTypesAsync } from "../../services/commonService";
import { useNavigate, useParams } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx";
const MAX_MB = 2;

const beforeUploadValidate: UploadProps["beforeUpload"] = (file) => {
    const isAllowed = ACCEPT.split(",").some((ext) => file.name.toLowerCase().endsWith(ext.trim()));
    if (!isAllowed) {
        message.error("Only PDF, DOC(X), or XLS(X) files are allowed.");
        return Upload.LIST_IGNORE;
    }
    const okSize = file.size / 1024 / 1024 < MAX_MB;
    if (!okSize) {
        message.error(`File must be smaller than ${MAX_MB}MB.`);
        return Upload.LIST_IGNORE;
    }
    return true;
};

// Fake upload (so the list behaves without a backend). Replace with your endpoint.
const dummyRequest: UploadProps["customRequest"] = ({ onSuccess }) => {
    setTimeout(() => onSuccess && onSuccess("ok" as any), 400);
};

interface RfpDecisionFormType {
    type: "edit" | "create" | "view"
    rfpIdFromParent?: number
}

export default function RfpDecisionForm({ type, rfpIdFromParent }: RfpDecisionFormType = { type: "create", rfpIdFromParent: 0 }) {
    const [form] = Form.useForm();
    const { rfpId } = useParams();
    const [selectedRfp, setSelectedRfp] = useState<number>(0);
    const [initialData, setInitialData] = useState<any>({
        decisionType: "Decision Paper for Award"
    });
    const [masterDatas, setMasterDatas] = useState<any>({
        rfps: [],
        budgetTypes: [],
        contractTypes: [],
        proposals: []
    });
    const navigate = useNavigate();
    const [techFiles, setTechFiles] = useState<UploadFile[]>([]);
    const [commFiles, setCommFiles] = useState<UploadFile[]>([]);

    const onFinish = async (values: any) => {
        try {
            const payload = {
                ...values,
                floatedOn: values.floatedOn?.format?.("YYYY-MM-DD"),
                closedOn: values.closedOn?.format?.("YYYY-MM-DD"),
                openedOn: values.openedOn?.format?.("YYYY-MM-DD"),
                // technicalEvaluationFiles: techFiles.map((f) => ({ name: f.name, uid: f.uid })),
                // commercialEvaluationFiles: commFiles.map((f) => ({ name: f.name, uid: f.uid })),
            };
            console.log(payload, "technicalEvaluationFiles");

            const formFile = new FormData();
            for (let x in payload) {
                formFile.append(x, payload[x]);
            }
            payload.vendorRfpProposalIds.forEach((id: any,index:number) => {
                formFile.append(`vendorProposals[${index}].VendorRfpProposalId`, id);
            });

            let i = 0;
            // Append technical evaluation files
            techFiles.forEach((file) => {
                formFile.append(`Attachments[${i}].Document`, file.originFileObj as any); // Here, send the file itself
                formFile.append(`Attachments[${i}].DocumentTypeId`, "1");
                i++;
            });

            // Append commercial evaluation files
            commFiles.forEach((file) => {
                formFile.append(`Attachments[${i}].Document`, file.originFileObj as any); // Send the file object here
                formFile.append(`Attachments[${i}].DocumentTypeId`, "2");
                i++;
            });

            await createOrUpdateRfpDecisionPaperAsync(formFile);
            // Send payload to API here
            // await api.saveDecisionPaper(payload)
            message.success("Decision paper saved (check console for payload)");
            // For demo
            // eslint-disable-next-line no-console
            console.log("Decision Paper Payload:", payload);

            if (rfpId) navigate(`/rfps/${rfpId}`)
        } catch (err) {

        }
    };

    const proposalsSetup = async (rfpId: number = selectedRfp) => {
        try {
            const proposals = await getAllProposalsByFilterAsync(
                {
                    pageNo: 0,
                    pageSize: 0,
                    fields: [
                        { columnName: "rfpId", value: rfpId }
                    ],
                    sortColumn: "CreatedAt",
                    sortDirection: "ASC"
                }
            )
            setMasterDatas((prev: any) => (
                {
                    ...prev,
                    proposals: proposals
                }
            ))
        } catch (err) {

        }
    }

    const setupDecisionForm = async () => {
        try {
            const rfps = await getAllRfpsByFilterAsync({
                pageNo: 0,
                pageSize: 0,
                fields: [
                    ...(type == "create" ? [{ columnName: "status", value: 9 }] : [])
                ],
                sortColumn: "TenderNumber",
                sortDirection: "ASC"
            });
            const budgetTypes = await getAllBudgetTypesAsync();
            const contractTypes = await getAllContractTypesAsync();
            setMasterDatas((prev: any) => (
                {
                    ...prev,
                    rfps: rfps,
                    budgetTypes: budgetTypes,
                    contractTypes: contractTypes,
                }
            ))

            if (rfpId) {
                setSelectedRfp(Number(rfpId));
                setInitialData((prev: any) => ({ ...prev, rfpId: Number(rfpId) }))
            }

            if (type == "edit" || type == "view") {
                const decission_paper = await getRfpDecisionPaperByRfpIdAsync((type == "view" && rfpIdFromParent) ? rfpIdFromParent : Number(rfpId));
                await proposalsSetup(rfpIdFromParent || 0);
                setInitialData((prev: any) => ({ ...prev, ...decission_paper, vendorRfpProposalIds: decission_paper?.vendorProposalsList?.map((p: any) => p?.vendorRfpProposalId) }));
            }

        } catch (err) {

        }
    }

    useEffect(() => {
        if (selectedRfp)
            proposalsSetup();
    }, [selectedRfp])

    useEffect(() => {
        setupDecisionForm();
    }, [])

    useEffect(() => {
        console.log(initialData, "initialData")
    }, [initialData])

    useEffect(() => {
        if (!initialData) return;
        const values: any = { ...initialData };
        if (values.floatedOn) values.floatedOn = dayjs(values.floatedOn);
        if (values.closedOn) values.closedOn = dayjs(values.closedOn);
        if (values.openedOn) values.openedOn = dayjs(values.openedOn);
        form.setFieldsValue(values);
    }, [initialData, form, masterDatas])

    return (
        <div>
            {type != "view" && <CommonTitleCard />}
            {initialData ?
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    className="w-full h-full mx-auto p-6 bg-white shadow relative"
                    initialValues={initialData}
                >
                    {type != "view" && <h1 className="text-2xl font-bold mb-6">Decision Paper for Award</h1>}
                    {/* RFP title */}
                    <div className="w-full grid grid-cols-1 gap-y-0 gap-x-6 md:grid-cols-3">
                        <Form.Item
                            label="RFP No./Title"
                            name="rfpId"
                            rules={[{ required: true, message: "Please enter the RFP number/title" }]}
                        >
                            <Select disabled={type == "view" || type == "edit"} placeholder="Select the type" allowClear showSearch optionFilterProp="label" onChange={(val) => { setSelectedRfp(val) }}>
                                {masterDatas.rfps.map((d: any) => (
                                    <Option key={d.id} value={d.id} label={d.rfpTitle}>{d.rfpTitle}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Type of decision */}
                        <Form.Item
                            label="Type of decision"
                            name="decisionType"
                            rules={[{ required: true, message: "Please select the type" }]}
                        >
                            <Input placeholder="Enter the RFP No./Title" disabled />
                            {/* <Select placeholder="Select the type" allowClear showSearch optionFilterProp="label">
                            {decisionTypes.map((d) => (
                                <Option key={d.id} value={d.id} label={d.label}>{d.label}</Option>
                            ))}
                        </Select> */}
                        </Form.Item>

                        {/* Proposal */}
                        <Form.Item
                            label="Proposal from vendor"
                            name="vendorRfpProposalIds"
                            rules={[{ required: true, message: "Please select at least one proposal" }]}
                        >
                            <Select 
                                mode="multiple"
                                disabled={type == "view"} 
                                placeholder="Select proposals" 
                                showSearch 
                                optionFilterProp="labelName" 
                                allowClear 
                                options={
                                    masterDatas.proposals.map((p: any) => {
                                        console.log(p, "p");
                                        return({
                                        value: p.id,
                                        labelName: p.vendorName,
                                        label: p.vendorName
                                        // label: (
                                        //     <div>
                                        //         <p className="font-bold">{p.vendorName}</p>
                                        //         <p>
                                        //             <span>Bid amount: </span>{p.bidAmount}
                                        //         </p>
                                        //     </div>
                                        // ),p.
                                    })})
                                }
                            />
                        </Form.Item>

                        {/* Floated on */}
                        <Form.Item label="Floated on" name="floatedOn" rules={[{ required: true, message: "Select the date" }]}>
                            <DatePicker disabled={type == "view"} className="w-full" format="DD/MM/YY" placeholder="DD/MM/YY" />
                        </Form.Item>

                        {/* Closed on */}
                        <Form.Item label="Closed on" name="closedOn" rules={[{ required: true, message: "Select the date" }]}>
                            <DatePicker disabled={type == "view"} className="w-full" format="DD/MM/YY" placeholder="DD/MM/YY" />
                        </Form.Item>

                        {/* Opened on */}
                        <Form.Item label="Opened on" name="openedOn" rules={[{ required: true, message: "Select the date" }]}>
                            <DatePicker disabled={type == "view"} className="w-full" format="DD/MM/YY" placeholder="DD/MM/YY" />
                        </Form.Item>

                        {/* Contract type */}
                        <Form.Item label="Contract type" name="contractTypeId" rules={[{ required: true, message: "Please select the type" }]}>
                            <Select disabled={type == "view"} placeholder="Select the type" allowClear>
                                {masterDatas.contractTypes.map((c: any) => (
                                    <Option key={c.id} value={c.id}>{c.contractTypeName}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Budget type */}
                        <Form.Item label="Budget type" name="budgetTypeId" rules={[{ required: true, message: "Please select the type" }]}>
                            <Select disabled={type == "view"} placeholder="Select the type" allowClear>
                                {masterDatas.budgetTypes.map((b: any) => (
                                    <Option key={b.id} value={b.id}>{b.budgetTypeName}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-y-0">
                        {/* Background */}
                        <div className="md:col-span-2">
                            <Form.Item label="Background" name="background" rules={[{ required: true, message: "Please enter the background" }]}>
                                <TextArea disabled={type == "view"} placeholder="Enter the background" rows={3} />
                            </Form.Item>
                        </div>

                        {/* Technical evaluation */}
                        <div className="md:col-span-2">
                            <Form.Item label="Technical evaluation" name="technicalEvaluationComments" rules={[{ required: true, message: "Enter the technical evaluation" }]}>
                                <TextArea disabled={type == "view"} placeholder="Enter the technical evaluation" rows={3} />
                            </Form.Item>
                        </div>

                        {/* Technical evaluation attachments */}
                        {type != "view" && <div className="md:col-span-1">
                            <Form.Item label="Technical evaluation attachments" tooltip="PDF, DOC or XLS (max. 2MB)">
                                <Dragger
                                    multiple
                                    fileList={techFiles}
                                    onChange={({ fileList }) => setTechFiles(fileList)}
                                    beforeUpload={beforeUploadValidate}
                                    customRequest={dummyRequest}
                                    accept={ACCEPT}
                                >
                                    <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: 'gray' }} /></p>
                                    <p className="ant-upload-text">Click to upload</p>
                                    <p className="ant-upload-hint">or drag and drop<br />PDF, DOC or XLS (max. 2MB)</p>
                                </Dragger>
                            </Form.Item>
                        </div>}

                        {/* Commercial evaluation */}
                        <div className="md:col-span-2">
                            <Form.Item label="Commercial evaluation" name="commercialEvaluationComments" rules={[{ required: true, message: "Enter the commercial evaluation" }]}>
                                <TextArea disabled={type == "view"} placeholder="Enter the commercial evaluation" rows={3} />
                            </Form.Item>
                        </div>

                        {/* Commercial evaluation attachments */}
                        {type != "view" && <div className="md:col-span-1">
                            <Form.Item label="Commercial evaluation attachments" tooltip="PDF, DOC or XLS (max. 2MB)">
                                <Dragger
                                    multiple
                                    fileList={commFiles}
                                    onChange={({ fileList }) => setCommFiles(fileList)}
                                    beforeUpload={beforeUploadValidate}
                                    customRequest={dummyRequest}
                                    accept={ACCEPT}
                                >
                                    <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: 'gray' }} /></p>
                                    <p className="ant-upload-text">Click to upload</p>
                                    <p className="ant-upload-hint">or drag and drop<br />PDF, DOC or XLS (max. 2MB)</p>
                                </Dragger>
                            </Form.Item>
                        </div>}
                    </div>

                    {/* Actions */}
                    {type != "view" && <div className="md:col-span-2">
                        <Space>
                            <Button type="primary" htmlType="submit">{type == "create" ? "Sent for award" : "Update"}</Button>
                            <Button htmlType="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</Button>
                        </Space>
                    </div>}
                </Form> : <div></div>}
        </div>
    );
}
