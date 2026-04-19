import React, { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function RecordDeletionLogs() {
  const [recordDeletionLogs, setRecordDeletionLogs] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    const getAllRecordDeletionLogs = async () => {
      try {
        const response = await axiosPrivate.get(
          `/patient/getAllRecordDeletionLogs`
        );
        // console.log(response.data);
        setRecordDeletionLogs(response.data);
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
                  Record Deleted By
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Registration Number
                </th> */}
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Email Address
                </th> */}
                <th scope="col" className="px-6 py-3">
                  Record Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Record Id
                </th>
                <th scope="col" className="px-6 py-3">
                  Deletion Time
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#444]">
              {recordDeletionLogs
                .filter((log) => {
                  return search.toLowerCase() === ""
                    ? log
                    : log.deletedByName
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                        log.deletedRecordType
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        log.deletedRecordId
                          .toLowerCase()
                          .includes(search.toLowerCase());
                })
                .map((log, index) => (
                  <tr key={index} className="bg-white border">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-[#444] whitespace-nowrap">
                      {log.deletedByName}
                    </td>
                    <td className="px-6 py-4">{log.deletedByRole}</td>
                    <td className="px-6 py-4">{log.deletedRecordType}</td>
                    <td className="px-6 py-4">{log.deletedRecordId}</td>
                    <td className="px-6 py-4">{log.deletedOn}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
