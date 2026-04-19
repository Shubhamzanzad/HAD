import AddConsentForm from "../forms/AddConsentForm";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Spinner } from "@material-tailwind/react";
import { FaEye } from "react-icons/fa";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import PdfViewer from "../../../utilComponents/PdfViewer";
function ConsentTable({ patientId }) {
  const [PatientDetails, setPatientDetails] = useState({});
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  const [consentList, setConsentList] = useState([]);
  const [LoadingId, setLoading] = useState(null);
  const [consentData, setConsentData] = useState([]);

  const [openReport, setOpenReport] = useState(false);
  const handleOpenReport = () => setOpenReport(!openReport);
  const [reportData, setReportData] = useState(null);

  const [openAttachment, setOpenAttachment] = useState(false);
  const handleOpenAttachment = () => setOpenAttachment(!openAttachment);
  const [attachmentData, setAtachmenttData] = useState(null);
  const [attachmentContentType, setAttachmentContentType] = useState(null);

  const doctorDecoded = auth?.accessToken
    ? jwtDecode(auth.accessToken)
    : undefined;

  const [activeDescriptionId, setactiveDescriptionId] = useState(null);

  const getConsentData = async (consentId) => {
    try {
      const path = `/consent/getConsentData?consentId=${consentId}`;
      const resp = await axiosPrivate.get(path);
      // console.log(resp);
      if (resp.status === 200) {
        setLoading(null);
        setConsentData(resp.data);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const toggleDescription = (consentId) => {
    getConsentData(consentId);
    if (LoadingId === null) {
      const descriptionRow = document.getElementById(`${consentId}Description`);
      const toggleIcon = document.getElementById(`${consentId}Toggle`);

      if (activeDescriptionId !== null && activeDescriptionId !== consentId) {
        const activeDescriptionRow = document.getElementById(
          `${activeDescriptionId}Description`
        );
        const activeToggleIcon = document.getElementById(
          `${activeDescriptionId}Toggle`
        );
        activeDescriptionRow.classList.add("hidden");
        activeToggleIcon.classList.remove("flipped-icon");
      }

      descriptionRow.classList.toggle("hidden");
      toggleIcon.classList.toggle("flipped-icon");

      if (!descriptionRow.classList.contains("hidden")) {
        setactiveDescriptionId(consentId);
      } else {
        setactiveDescriptionId(null);
      }
    }
  };

  useEffect(() => {
    const getPatientDetails = async () => {
      try {
        const path = `/patient/getPatientDetails?id=${patientId.patientId}`;
        const resp = await axiosPrivate.get(path);
        // console.log(resp.data);
        setPatientDetails(resp.data);
      } catch (error) {
        // console.log(error);
      }
    };
    getPatientDetails();

    const getAllConsentsList = async () => {
      try {
        const path = `/consent/getConsentList?doctor_reg_no=${doctorDecoded.registrationNumber}&patient_id=${patientId.patientId}`;
        const resp = await axiosPrivate.get(path);
        setConsentList(resp.data);
      } catch (error) {
        // console.log(error.response.data);
      }
    };
    getAllConsentsList();
  }, []);

  const handleDataFromChild = async (data) => {
    if (data) {
      try {
        const path = `/consent/getConsentList?doctor_reg_no=${doctorDecoded.registrationNumber}&patient_id=${patientId.patientId}`;
        const resp = await axiosPrivate.get(path);
        setConsentList(resp.data);
      } catch (error) {
        // console.log(error.response.data);
      }
    }
  };

  return (
    <div className="border mx-3 my-4 border-[#006666] rounded-md border-l-4">
      <div className="flex justify-between items-center">
        <p className="font-semibold relative text-2xl ml-4 mt-4 mb-4 text-[#444444]">
          Consent Request Details
        </p>
        <AddConsentForm
          patientDetails={PatientDetails}
          sendDataToParent={handleDataFromChild}
        />
      </div>
      <div className="h-[1px] bg-[#827F7F82]"></div>
      <div className="sm:rounded-lg 2xl:max-h-[500px] 4xl:max-h-[800px] lg:max-h-[50px] flex flex-col overflow-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase h-[4.5rem] bg-gray-50 bg-[#F5F6F8] text-[#7B7878] sticky top-0">
            <tr className="text-sm">
              <th scope="col" className="px-6 py-3">
                Patient Name
              </th>
              <th scope="col" className="px-6 py-3">
                ABHA ID
              </th>
              <th scope="col" className="px-6 py-3">
                Requester Name
              </th>
              <th scope="col" className="px-6 py-3">
                Purpose
              </th>
              <th scope="col" className="px-6 py-3">
                Permission From
              </th>
              <th scope="col" className="px-6 py-3">
                Permission To
              </th>
              <th scope="col" className="px-6 py-3">
                View Records
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-[#444]">
            {consentList.length === 0 ? (
              <>
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-zinc-600 bg-gray-200 p-6 rounded-bottom-lg font-bold text-[20px]"
                  >
                    No records to display
                  </td>
                </tr>
              </>
            ) : (
              <>
                {consentList.map((item, index) => (
                  <>
                    <tr
                      key={item.id}
                      className="bg-white border"
                      onClick={() => {
                        if (item.status == "RECEIVED") {
                          toggleDescription(item.id);
                        }
                      }}
                    >
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium text-[#444] whitespace-nowrap"
                      >
                        {PatientDetails.name}
                      </td>
                      <td className="px-6 py-4">
                        {PatientDetails.abhaAddress}
                      </td>
                      <td className="px-6 py-4">{item.requester_name}</td>
                      <td className="px-6 py-4">{item.purpose_code}</td>
                      <td className="px-6 py-4">{item.permission_from}</td>
                      <td className="px-6 py-4">{item.permission_to}</td>
                      {item.status != "RECEIVED" ? (
                        <>
                        {item.status === "REVOKED"? <>
                        <td className="font-bold px-6 py-4 text-[#e01010]">
                            {item.status}
                          </td>
                        </> : <>
                          <td className="font-bold px-6 py-4 text-[#FAA000]">
                            {item.status}
                          </td>
                        </>}
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="font-semibold p-2.5 text-[20px] text-[#02685A] rounded-lg px-4 py-4 bg-[#F5FEF2] text-center inline-flex items-center">
                              <div>View</div>
                              <svg
                                id={item.id + "Toggle"}
                                className="w-6 h-6 mx-3"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"></path>
                              </svg>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    {item.status == "REQUESTED" ? (
                      <></>
                    ) : (
                      <>
                        {LoadingId === item.id ? (
                          <>
                            <tr>
                              <td colSpan={7}>
                                <div className="m-2">
                                  <Spinner className="m-auto " />
                                </div>
                              </td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr
                              id={item.id + "Description"}
                              className="hidden py-2 px-2 border-b border-gray-400"
                            >
                              <td colSpan="7" className="p-2">
                                <div className="p-4 w-full">
                                  <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                  >
                                    Consent Data
                                  </Typography>

                                  <Table size="small" aria-label="consentData">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>
                                          <div className="font-bold">Date</div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="font-bold">
                                            Hospital Name
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="font-bold">
                                            Doctor Name
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="font-bold">
                                            Patient Name
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="font-bold">
                                            Reason
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="font-bold">
                                            Report
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="font-bold">
                                            Attachment
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {consentData.map((item, index) => (
                                        <>
                                          {item.consentArtefactData.map(
                                            (cc, i) => (
                                              <TableRow>
                                                <TableCell
                                                  component="th"
                                                  scope="row"
                                                >
                                                  {cc.content.appointmentDate}
                                                </TableCell>
                                                <TableCell
                                                  component="th"
                                                  scope="row"
                                                >
                                                  {cc.content.hospitalName} (
                                                  {cc.content.hospitalId})
                                                </TableCell>
                                                <TableCell
                                                  component="th"
                                                  scope="row"
                                                >
                                                  {cc.content.doctorName}
                                                </TableCell>
                                                <TableCell
                                                  component="th"
                                                  scope="row"
                                                >
                                                  {cc.content.name}
                                                </TableCell>
                                                <TableCell>
                                                  {cc.content.reason}
                                                </TableCell>
                                                <TableCell>
                                                  <button
                                                    className="flex border-2 border-black p-1 rounded-xl "
                                                    onClick={() => {
                                                      setReportData(
                                                        cc.content
                                                          .reportDocument.data
                                                      );
                                                      handleOpenReport();
                                                    }}
                                                  >
                                                    <div className="mx-2">
                                                      View
                                                    </div>{" "}
                                                    <FaEye className="m-auto" />
                                                  </button>
                                                </TableCell>
                                                <TableCell>
                                                  {cc.content.attachment ? (
                                                    <button
                                                      className="flex border-2 border-black p-1 rounded-xl "
                                                      onClick={() => {
                                                        setAtachmenttData(
                                                          cc.content.attachment
                                                            .data
                                                        );
                                                        setAttachmentContentType(
                                                          cc.content.attachment
                                                            .contentType
                                                        );
                                                        handleOpenAttachment();
                                                      }}
                                                    >
                                                      <div className="mx-2">
                                                        View
                                                      </div>{" "}
                                                      <FaEye className="m-auto" />
                                                    </button>
                                                  ) : (
                                                    <>-</>
                                                  )}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          )}
                                        </>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </td>
                            </tr>
                          </>
                        )}
                      </>
                    )}
                  </>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={openReport} handler={handleOpenReport} size="lg">
        <DialogHeader>Report</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>
        <DialogBody>
          <PdfViewer file={reportData} />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpenReport}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openAttachment} handler={handleOpenAttachment} size="lg">
        <DialogHeader>Attachment</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>
        <DialogBody>
          {attachmentContentType === "image/jpeg" ? (
            <img src={`data:image/jpeg;base64,${attachmentData}`} />
          ) : (
            <PdfViewer file={attachmentData} />
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpenAttachment}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default ConsentTable;
