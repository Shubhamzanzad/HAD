import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { MdSearch, MdAdd } from "react-icons/md";
import { FaCaretRight } from "react-icons/fa";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import AddAppointmentForm from "../forms/AddAppointmentForm";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import useAuth from "../../../hooks/useAuth";

function PastRecords({ patientId, sendDataToParent }) {
  const [AppointmentDetailsList, setAppointmentDetailsList] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const [role, setRole] = useState("");
  const [name, setname] = useState("");
  const { auth } = useAuth();

  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;

  useEffect(() => {
    setRole(decoded?.role);
    setname(decoded?.name);
    const getAppointmentDetails = async () => {
      try {
        let path;
        if (decoded?.role === "DOCTOR") {
          const name = decoded?.name;
          path = `/patient/appointment/getAppointmentForDoctor?id=${patientId.patientId}&name=${name}`;
        } else {
          path = `/patient/appointment/getAppointmentDetails?id=${patientId.patientId}`;
        }
        const resp = await axiosPrivate.get(path);
        // console.log(resp.data);
        setAppointmentDetailsList(resp.data);
      } catch (error) {
        // console.log(error);
      }
    };
    getAppointmentDetails();
    // console.log(decoded);
  }, []);

  const handleDataFromChild = async (data) => {
    if (data) {
      try {
        let path;
        if (decoded?.role === "DOCTOR") {
          const name = decoded?.name;
          path = `/patient/appointment/getAppointmentForDoctor?id=${patientId.patientId}&name=${name}`;
        } else {
          path = `/patient/appointment/getAppointmentDetails?id=${patientId.patientId}`;
        }
        const resp = await axiosPrivate.get(path);
        // console.log(resp.data);
        setAppointmentDetailsList(resp.data);
      } catch (error) {
        // console.log(error.response.data);
      }
    }
  };

  const deleteAppointment = async (appointment_id) => {
    const requestBody = {
      appointmentId: parseInt(appointment_id),
      role: role,
      name: name,
    };
    try {
      const resp = await axiosPrivate.post(
        `/patient/deleteAppointment`,
        requestBody
      );
      // console.log(resp.data);
      toast.success(resp.data);
    } catch (error) {
      // console.error(error);
    }
  };



  return (
    <div className="border mx-3 my-4 border-[#006666] rounded-md border-l-4">
      <div className="flex justify-between items-center">
        <p className="font-semibold relative text-2xl ml-4 mt-4 mb-4 text-[#444444]">
          All Appointment Details
        </p>
        {(role === "STAFF" || role==="HEAD_DOCTOR")  && (
            <>
              <AddAppointmentForm sendDataToParent={handleDataFromChild} patientId={patientId} />
            </>
          )}
      </div>
      <div className="h-[1px] bg-[#827F7F82]"></div>
      <div className="sm:rounded-lg 2xl:max-h-[580px] 4xl:max-h-[800px] lg:max-h-[50px] flex flex-col overflow-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs uppercase h-[4.5rem] bg-[#F5F6F8] text-[#7B7878] sticky top-0">
            <tr className="text-sm">
              <th scope="col" className="px-6 py-3">
                Doctor Name
              </th>
              <th scope="col" className="px-6 py-3">
                Appointment Date
              </th>
              <th scope="col" className="px-6 py-3">
                Appointment Time
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>

              <th scope="col" className="px-6 py-3">
                Details
              </th>
              <th scope="col" className="px-6 py-3">
                View
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-[#444]">
            {AppointmentDetailsList.length === 0 ? (
              <>
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-zinc-600 bg-gray-200 p-6 rounded-bottom-lg font-bold text-[20px]"
                  >
                    No records to display
                  </td>
                </tr>
              </>
            ) : (
              <>
                {AppointmentDetailsList.map((item, index) => (
                  <tr className="bg-white border " key={item.appointment_id}>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-[#444] whitespace-nowrap"
                    >
                      {item.doctorName}
                    </th>
                    <td className="px-6 py-4">{item.date}</td>
                    <td className="px-6 py-4">{item.time}</td>
                    <td className="px-6 py-4">{item.status}</td>
                    <td className="px-6 py-4">{item.notes}</td>
                    <td className="px-6 py-4">
                      <button
                        className={
                          role === "STAFF"
                            ? `inline-flex justify-center items-center gap-[10px] rounded-lg
                         text-[20px] text-white font-semibold p-2.5 bg-gray-500 cursor-not-allowed`
                            : `inline-flex justify-center items-center gap-[10px] rounded-lg
                                        border border-[#787887] bg-[#F5FEF2] text-[20px] text-[#02685A] font-semibold p-2.5`
                        }
                        disabled={role === "STAFF"}
                        onClick={() => {
                          sendDataToParent(
                            item.appointment_id,
                            item.status === "Completed"
                          );
                        }}
                      >
                        <div>View</div>
                        <FaCaretRight className="h-[25px] w-[25px]" />
                      </button>
                    </td>
                    {(role === "HEAD_DOCTOR" ||
                      role === "STAFF") && (
                        <td className="px-6 py-4">
                          <button
                            className="inline-flex justify-center items-center gap-[10px] text-[30px]
                                        text-[#b82d2d] "
                            onClick={() => {
                              deleteAppointment(item.appointment_id);
                            }}
                          >
                            <div>
                              <MdDelete />
                            </div>
                          </button>
                        </td>
                      )}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PastRecords;
