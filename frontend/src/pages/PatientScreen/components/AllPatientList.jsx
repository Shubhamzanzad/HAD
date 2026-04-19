import { MdSearch, MdAdd } from "react-icons/md";
import { FaCaretRight } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

import AddPatientForm from "../forms/AddPatientForm";

import { jwtDecode } from "jwt-decode";
import useAuth from "../../../hooks/useAuth";

const AllPatientList = (props) => {
  const axiosPrivate = useAxiosPrivate();
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const [AllPatientList, setAllPatientList] = useState([]);
  const [role, setRole] = useState("");
  const { auth } = useAuth();

  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
  useEffect(() => {
    if (props.id) {
      setPatientId(props.id);
    }
    const getAllPatientList = async () => {
      const resp = await axiosPrivate.get(
        "/patient/getPatientList"
      );
      // console.log(resp);
      setAllPatientList(resp.data);
    };
    // console.log(decoded)
    getAllPatientList();
    setRole(decoded?.role);
  }, []);

  const handleDataFromChild = async (data) => {
    if (data) {
      try {
        const resp = await axiosPrivate.get(
          "/patient/getPatientList"
        );
        setAllPatientList(resp.data);
      } catch (error) {
        // console.log(error.response.data);
      }
    }
  };

  const navigate = useNavigate();

  return (
    <>
      <div className="flex-auto p-3 overflow-hidden rounded-md">
        <div className="flex flex-col bg-white h-[842px] ">
          <div className="basis-[15%] bg-white ">
            <div className="text-[1.75rem] m-4 p-4 text-[#02685A] font-semibold">
              All Patients List
            </div>
            <div className="flex flex-row m-4 justify-between items-center">
              <div className="relative">
                <input
                  className="m-4 h-[3.375rem] border-[#827F7F82] rounded-md focus:outline-none focus:ring focus:ring-[#02685A] focus:ring-opacity-70"
                  type="text"
                  placeholder="Search Patients"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute inset-y-0 right-2 flex items-center pr-4">
                  <MdSearch className="h-[25px] w-[25px]" />
                </div>
              </div>
              {( role === "STAFF") && (
                <>
                  <AddPatientForm  sendDataToAllPatientList={handleDataFromChild} />
                </>
              )}
            </div>
          </div>
          <div className="bg-[#827F7F82]  h-[0.5px] mx-8 my-4"></div>
          <div className="m-4 shadow-lg sm:rounded-lg 2xl:max-h-[500px] 4xl:max-h-[800px] lg:max-h-[800px] bg-white md:max-h-[800px] flex flex-col overflow-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 h-full">
              <thead className="text-xs uppercase h-[4.5rem] bg-[#F5F6F8] text-[#7B7878] sticky top-0">
                <tr className="text-sm">
                  <th scope="col" className="px-6 py-3">
                    Patient Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Patient SBX
                  </th>
                  {/* <th scope="col" className="px-6 py-3">
                  Registration Number
                </th> */}
                  <th scope="col" className="px-6 py-3">
                    Abha Id
                  </th>
                  {/* <th scope="col" className="px-6 py-3">
                  Email Address
                </th> */}
                  <th scope="col" className="px-6 py-3">
                    Email Id
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#444]">
                {AllPatientList.length === 0 ? (
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
                    {AllPatientList.filter((item) => {
                      return search.toLowerCase() === ""
                        ? item
                        : item.name
                            .toLowerCase()
                            .includes(search.toLowerCase());
                    }).map((item, index) => (
                      <tr key={item.mrn} className="bg-white border ">
                        <td
                          scope="row"
                          className="px-6 py-4 font-medium text-[#444] whitespace-nowrap"
                        >
                          {item.name}
                        </td>
                        <td className="px-6 py-4">{item.abhaAddress}</td>
                        <td className="px-6 py-4">{item.mobileNumber}</td>
                        <td className="px-6 py-4">{item.email}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              navigate(`/patientScreen/${item.mrn}`);
                            }}
                            id=""
                            className="inline-flex justify-center items-center gap-[10px] rounded-lg
                                          border border-[#787887] bg-[#F5FEF2] text-[20px] text-[#02685A] font-semibold p-2.5"
                          >
                            <div>View</div>
                            <FaCaretRight className="h-[25px] w-[25px]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
export default AllPatientList;
