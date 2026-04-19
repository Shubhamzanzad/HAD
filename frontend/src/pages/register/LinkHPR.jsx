import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FaRegListAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { RiHospitalFill } from "react-icons/ri";
import AccountDetails from "./AccountDetails";
import Loading from "../../utilComponents/Loading";
import { useNavigate } from "react-router-dom";
function LinkHPR({ isHead }) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValues,
    formState: { errors },
  } = useForm();
  const [success, setSuccess] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState({});
  const [txnId, setTxnId] = useState("");

  const navigate = useNavigate();
  // useEffect(() => {
  //   const windowValues = window.location.search;
  //   const requestParams = new URLSearchParams(windowValues);
  //   const isHeadDoctor = requestParams.get("isHeadDoctor");
  //   console.log(data)
  //   setDoctorDetails((prevDoctorDetails) => ({
  //     ...prevDoctorDetails,
  //     isHeadDoctor: isHeadDoctor === "true",
  //   }));
  // }, []);

  const generateOTP = async () => {
    const requestBody = {
      hprId: getValues("hprId"),
    };
    requestBody.hprId += "@hpr.abdm";
    try {
      const resp = await axios.post(
        "/auth/generateAadharOTPHPR",
        requestBody
      );
      // console.log(resp);
      setTxnId(resp?.data?.txnId);
      if (resp.status === 200) {
        toast.success("OTP Sent");
        setDoctorDetails(resp.data);
      }
    } catch (error) {
      setLoading(false);
      setSuccess(false);
      toast.error(error.response.data.details[0].message);
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    const RequestBody = {
      txnId: txnId,
      otp: getValues("otp"),
    };

    try {
      const resp = await axios.post(
        "/auth/get-doctor-details",
        RequestBody
      );

      if (resp.status === 200) {
        setLoading(false);
        toast.success("Details Fetched Successfully");
        setSuccess(true);
        setDoctorDetails(resp.data);
      }
    } catch (error) {
      setLoading(false);
      setSuccess(false);
      toast.error(error.response.data.details[0].message);
    }
  };

  return (
    <div className="min-h-screen min-w-screen">
      {success ? (
        <AccountDetails isHeadDoc={isHead} data={doctorDetails} />
      ) : (
        <div className="h-full w-full flex justify-center items-center">
          {isLoading ? (
            <Loading />
          ) : (
            <div className=" bg-white h-full  w-full overflow-auto">
              <div className="bg-white mx-10 text-white min-h-screen">
                <div className="h-4"></div>
                <div className="mx-10 border border-black rounded-md">
                  <div className="my-5 h-20 bg-[#98a2a3] flex items-center justify-center text-3xl font-semibold text-white py-5">
                    Welcome to MediSync
                  </div>

                  <div className="h-40 flex items-center justify-center">
                    {isHead ? (
                      <div>
                        <div className="h-full flex items-center justify-between">
                          <div className="w-24 h-1 bg-[#02685A] my-2 rounded-l-lg flex-1"></div>
                          <div className="w-23 h-23 bg-[#5AAC74] rounded-full flex-0">
                            <div className="w-20 h-20 bg-[#02685A] mx-1.5 my-1.5 rounded-full flex justify-center items-center">
                              <FaRegListAlt className="h-[30px] w-[30px]" />
                            </div>
                          </div>
                          <div className="w-36 h-1 bg-[#DDDDDD] my-2 flex-1"></div>
                          <div className="w-20 h-20 bg-[#DDDDDD] rounded-full flex justify-center items-center">
                            <FaUser className="h-[25px] w-[25px]" />
                          </div>
                          <div className="w-36 h-1 bg-[#DDDDDD] my-2 flex-1"></div>
                          <div className="w-20 h-20 bg-[#DDDDDD] rounded-full flex justify-center items-center">
                          <RiHospitalFill className="h-[25px] w-[25px]" />
                        </div>
                          <div className="w-24 h-1 bg-[#DDDDDD] my-2 rounded-r-lg"></div>
                        </div>

                        <div className="flex mt-2">
                          <p className="ml-32 text-[#02685A] font-semibold text-xl">
                            Link HPR
                          </p>
                          <p className="ml-24 text-[#7F8C8D] font-semibold text-xl">
                            Account Details
                          </p>
                          <p className="ml-20 text-[#7F8C8D] font-semibold text-xl">
                          Practice Details
                        </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="h-full flex items-center justify-between">
                          <div className="w-24 h-1 bg-[#02685A] my-2 rounded-l-lg flex-1"></div>
                          <div className="w-23 h-23 bg-[#5AAC74] rounded-full flex-0">
                            <div className="w-20 h-20 bg-[#02685A] mx-1.5 my-1.5 rounded-full flex justify-center items-center">
                              <FaRegListAlt className="h-[30px] w-[30px]" />
                            </div>
                          </div>
                          <div className="w-36 h-1 bg-[#DDDDDD] my-2 flex-1"></div>
                          <div className="w-20 h-20 bg-[#DDDDDD] rounded-full flex justify-center items-center">
                            <FaUser className="h-[25px] w-[25px]" />
                          </div>
                          <div className="w-36 h-1 bg-[#DDDDDD] my-2 flex-1"></div>
                          {/* <div className="w-20 h-20 bg-[#DDDDDD] rounded-full flex justify-center items-center">
                        <RiHospitalFill className="h-[25px] w-[25px]" />
                      </div> */}
                          {/* <div className="w-24 h-1 bg-[#DDDDDD] my-2 rounded-r-lg"></div> */}
                        </div>

                        <div className="flex mt-2">
                          <p className="ml-32 text-[#02685A] font-semibold text-xl">
                            Link HPR
                          </p>
                          <p className="ml-24 text-[#7F8C8D] font-semibold text-xl">
                            Account Details
                          </p>
                          {/* <p className="ml-20 text-[#7F8C8D] font-semibold text-xl">
                        Practice Details
                      </p> */}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex px-10 bg-white mt-10">
                    <p className="font-semibold py-1.5 text-[#5F5F5F] text-lg">
                      Create your HPR ID by Clicking on the link:
                    </p>
                    <button className="mx-8 bg-[#308EDC] h-10 rounded-md font-semibold text-lg w-56">
                      <a
                        href="https://hspsbx.abdm.gov.in/createID"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LINK
                      </a>
                    </button>
                  </div>
                  <form className="p-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="my-12 px-10 text-black">
                      <p className="text-sm font-semibold text-[#787887]">
                        Enter your Healthcare Professional ID/Username *
                      </p>
                      <div className="flex w-full">
                        <label className="flex-1 cursor-pointer">
                          {" "}
                          {/* Set width to 2/3 */}
                          <input
                            className="w-full h-10 rounded-l-md"
                            type="text"
                            {...register("hprId", { required: true })}
                          />
                        </label>
                        <p className="flex-2.2 bg-slate-200 rounded-r-md border border-[#787887] bg-[#02685A] text-white font-semibold py-1 text-lg px-20">
                          @hpr.abdm
                        </p>
                        <button
                          className="flex-2.2 bg-red-900 ml-20 rounded-md text-white px-6"
                          onClick={generateOTP}
                        >
                          Generate OTP
                        </button>
                      </div>

                      <p className="errorMsg">{errors.hprId?.message}</p>
                    </div>
                    <div className="my-12 bg-white px-10 text-black">
                      <p className="text-sm font-semibold text-[#787887]">
                        Enter OTP
                      </p>
                      <div>
                        <label>
                          <input
                            className="w-full h-10 my-3 rounded-md"
                            type="password"
                            {...register("otp", { required: true })}
                          />
                        </label>
                      </div>
                      <p className="errorMsg">{errors.password?.message}</p>
                    </div>
                    <div className="px-10">
                      <button
                        className="bg-[#02685A] text-md font-semibold h-12 w-56 rounded-md"
                        type="submit"
                      >
                        Get Account Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default LinkHPR;
