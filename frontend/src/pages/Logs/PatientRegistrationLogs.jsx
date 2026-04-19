import React, { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function PatientRegistrationLogs() {
  const [patientRegistrationLogs, setPatientRegistrationLogs] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    const getAllRecordDeletionLogs = async () => {
      try {
        const response = await axiosPrivate.get(
          `/patient/getAllPatientRegistrationDetailsLogs`
        );
        // console.log(response.data);
        setPatientRegistrationLogs(response.data);
      } catch (err) {
        if (!err?.response) {
          // console.error("No Server Response");
        }
      }
    };
    getAllRecordDeletionLogs();
  }, []);
  const [search, setSearch] = useState("");
  return (
    <div>
      <div className="flex flex-row m-4 justify-between items-center">
        <div className="relative">
          <input
            className="m-4 h-[3.375rem] border-[#827F7F82] rounded-md focus:outline-none focus:ring focus:ring-[#02685A] focus:ring-opacity-70"
            type="text"
            placeholder="Search Record"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-2 flex items-center pr-4">
            <MdSearch className="h-[25px] w-[25px]" />
          </div>
        </div>
      </div>
      <div className="bg-[#827F7F82]  h-[0.5px] mx-8 my-4"></div>

      <div className="basis-[85%]">
        <div className="m-4 shadow-lg sm:rounded-lg 2xl:max-h-[500px] 4xl:max-h-[800px] lg:max-h-[500px] md:max-h-[450px] flex flex-col overflow-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs uppercase h-[4.5rem] bg-[#F5F6F8] text-[#7B7878] sticky top-0">
              <tr className="text-sm">
                <th scope="col" className="px-6 py-3">
                  S.No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Patient Name
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Registration Number
                </th> */}
                <th scope="col" className="px-6 py-3">
                  Registered By
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Email Address
                </th> */}
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Registration Method
                </th>
                <th scope="col" className="px-6 py-3">
                  Registration Time
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#444]">
              {patientRegistrationLogs
                .filter((log) => {
                  return search.toLowerCase() === ""
                    ? log
                    : log.patientName
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                        log.generatedByName
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        log.role.toLowerCase().includes(search.toLowerCase());
                })
                .map((log, index) => (
                  <tr key={index} className="bg-white border">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-[#444] whitespace-nowrap">
                      {log.patientName}
                    </td>
                    <td className="px-6 py-4">{log.generatedByName}</td>
                    <td className="px-6 py-4">{log.role}</td>
                    <td className="px-6 py-4">{log.registrationMethod}</td>
                    <td className="px-6 py-4">{log.generatedAt}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
