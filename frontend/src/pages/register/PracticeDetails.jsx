import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FaRegListAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { RiHospitalFill } from "react-icons/ri";

function PracticeDetails() {
  const [states, setStates] = useState([]);
  const [district, setdistrict] = useState([]);
  const {
    register,
    handleSubmit,
    // reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  useEffect(() => {
    const getStates = async () => {
      try {
        const response = await axios.post(
          "/patient/getLgdStatesList"
        );
        setStates(response.data);
        // console.log(response.data);
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    };
    // console.log(getValues());

    getStates();
  }, []);

  const onSubmit = async () => {
    // console.log(getValues());

    try {
      const resp = await axios.post(
        "/auth/registerFacility",
        getValues()
      );
      console.log(resp);
      if (resp.status === 200) {
        navigate("/login");
        toast.success(resp.data);
      }
    } catch (error) {
      // console.log(error);
      navigate("/login");
      // toast.error(error.response);
    }
  };
  const handleDistrict = (event) => {
    // console.log(event);
    const selectedState = states[event].districts;
    // console.log(selectedState);
    setdistrict(selectedState);
    // console.log(states);
    setValue("state", `${states[event].name}-${states[event].code}`);
  };
  // console.log(states);
  return (
    <div className="bg-white h-screen">
      <div className="bg-white  mx-10 my-4 h-screen mb-12 ">
        <div className="mx-40 border mt-4 border-black rounded-md">
          <div className="my-5 h-20 bg-[#98a2a3] flex items-center justify-center text-3xl font-semibold text-white py-5">
            Welcome to MediSync
          </div>

          <div className="h-40 flex items-center justify-center">
            <div>
              <div className="h-full flex items-center justify-between">
                <div className="w-24 h-1 bg-[#02685A] my-2 rounded-l-lg"></div>
                <div className="w-20 h-20 bg-[#02685A] my-1.5 rounded-full flex justify-center items-center">
                  <FaRegListAlt className="h-[25px] w-[25px] text-white" />
                </div>
                <div className="w-36 h-1 bg-[#02685A] my-2"></div>
                <div className="w-20 h-20 bg-[#02685A] my-1.5 rounded-full flex justify-center items-center">
                  <FaUser className="h-[25px] w-[25px] text-white" />
                </div>
                <div className="w-36 h-1 bg-[#02685A] my-2"></div>
                <div className="w-23 h-23 bg-[#5AAC74] rounded-full">
                  <div className="w-20 h-20 bg-[#02685A] mx-1.5 my-1.5 rounded-full flex justify-center items-center">
                    <RiHospitalFill className="h-[30px] w-[30px] text-white" />
                  </div>
                </div>
                <div className="w-24 h-1 bg-[#02685A] my-2 rounded-r-lg"></div>
              </div>


              <div className="flex mt-2">
                <p className="ml-24 text-[#02685A] font-semibold text-xl">
                  Link HPR
                </p>
                <p className="ml-28 text-[#02685A] font-semibold text-xl">
                  Account Details
                </p>
                <p className="ml-20 text-[#02685A] font-semibold text-xl">
                  Practice Details
                </p>
              </div>
            </div>
          </div>

          <div className="flex mx-32 bg-white mt-10">
            <p className="font-semibold py-1.5 text-[#5F5F5F] text-lg">
              Hello Doc, It is important to fill all the details to use the
              platform !
            </p>
          </div>
          {/* <div className="flex px-10 bg-white mt-10">
            <p className="font-semibold py-1.5 text-[#5F5F5F] text-lg">
              Create your HFR ID by Clicking on the link:
            </p>
            <button className="mx-8 bg-[#308EDC] h-10 rounded-md font-semibold text-lg w-56">
              <a
                href="https://hspsbx.abdm.gov.in/createID"
                target="https://hspsbx.abdm.gov.in/createID"
                // rel="noopener noreferrer"
              >
                LINK
              </a>
            </button>
          </div> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex my-3 mx-32">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#787887]">
                  Clinic ID*
                </p>
                <input
                  className="mt-3 rounded-md w-full"
                  type="text"
                  {...register("facilityId", { required: "Required" })}
                />
              </div>
              <div className="flex-1 mx-10">
                <p className="text-sm font-semibold text-[#787887]">
                  Clinic Name*
                </p>
                <input
                  className="mt-3 rounded-md w-full"
                  type="text"
                  {...register("facilityName", { required: "Required" })}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#787887]">
                  Clinic Specialization*
                </p>
                <input
                  className="mt-3 rounded-md w-full"
                  type="text"
                  {...register("specialization", { required: "Required" })}
                />
              </div>
            </div>

            <div className="flex my-6 mx-32">
              <div className="flex-1 mr-9">
                <p className="text-sm font-semibold text-[#787887]">
                  Clinic Address*
                </p>
                <input
                  className="mt-3 rounded-md w-full"
                  type="text"
                  {...register("address", { required: "Required" })}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-3 text-[#787887]">
                  State*
                </p>
                <select
                  className="w-full rounded-md"
                  name="doctor"
                  onChange={(e) => handleDistrict(e.target.value)}
                  defaultValue="" // Set the default value to an empty string
                >
                  <option disabled value="">
                    Select State
                  </option>
                  {states.map((state, index) => (
                    <option
                      key={index}
                      className="font-light text-s option-hover"
                      value={index}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex my-3 mx-32 ">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-3 text-[#787887]">
                  District*
                </p>
                <select
                  className="w-full rounded-md"
                  name="district"
                  id=""
                  {...register("district", {
                    required: "Required",
                  })}
                >
                  <option value="" hidden defaultValue={true}>
                    Select District
                  </option>
                  {district.map((item, index) => (
                    <option key={item.code} value={`${item.name}-${item.code}`}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 mx-10">
                <p className="text-sm font-semibold text-[#787887]">Pincode*</p>
                <input
                  className="mt-3 rounded-md w-full"
                  type="number"
                  {...register("pincode", { required: "Required" })}
                />
              </div>

             
            </div>

            <div className="w-full h-0.5 bg-[#DDDDDD] mt-20 my-2 "></div>

            <div className="flex items-center justify-center my-5">
              <button className="bg-[#FFA000] block font-bold w-56 h-12 text-xl rounded-md mx-auto">
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PracticeDetails;
