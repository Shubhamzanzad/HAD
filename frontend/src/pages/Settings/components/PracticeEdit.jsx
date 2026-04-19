import { Button } from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const PracticeEdit = () => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const axiosPrivate = useAxiosPrivate();
  const [states, setStates] = useState([]);
  const [district, setdistrict] = useState([]);
  useEffect(() => {
    // setValue("state", "Maharashtra");
    // setValue("district", "Thane");
    const getStates = async () => {
      try {
        const response = await axiosPrivate.post(
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

  const handleDistrict = (event) => {
    // console.log(event);
    const selectedState = states[event].districts;
    // console.log(selectedState);
    setdistrict(selectedState);
    // console.log(states);
    setValue("state", `${states[event].name}-${states[event].code}`);
  };
  const onSubmit = async () => {
    // console.log(getValues());
    try {
      const response = await axiosPrivate.post(
        `/auth/editDetails`,
        getValues()
      );
      // console.log(response.data);
      // setUserDetails(response.data);
      toast.success("response.data")
    } catch (err) {
      if (!err?.response) {
        // console.error("No Server Response");
        toast.error("No Server Response")
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full overflow-auto h-[700px]">
        {/* <div className="text-[#02685A] text-3xl font-bold p-0 ml-10 w-1/5 flex flex-col justify-center items-center">
        <p>Edit Details</p>
      </div> */}
        <div className="grid grid-cols-2 gap-5 text-[#7B7878] font-medium text-xl  p-5">
        <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Clinic Id*</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("clinicId", { required: true })}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Clinic Name*</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("clinicName", { required: true })}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Specialization*</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("specialization", { required: true })}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Bridge Id*</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("bridgeId", { required: true })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1  gap-5 text-[#7B7878] font-medium text-xl  p-5">
          <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Registraion Number*</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("registrationNumber", { required: true })}
            />
          </div>
        </div>
        {/* <div className="grid grid-cols-3  gap-5 text-[#7B7878] font-medium text-xl  p-5"> */}
          {/* <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Contact Number</p>
            <input
              className="rounded-md w-full"
              type="number"
              {...register("contactNumber", { required: true })}
            />
          </div> */}

          {/* <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Email Address</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("email", { required: true })}
            />
          </div> */}

        {/* <div className="flex flex-col"></div> */}
        {/* </div> */}
        <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
        <div className="grid grid-cols-3  gap-5 text-[#7B7878] font-medium text-xl  p-5">
          <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Address Line*</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("addressLine", { required: true })}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col">
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
          <div className="flex flex-col">
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
        </div>
        <div className="grid grid-cols-3  gap-5 text-[#7B7878] font-medium text-xl  p-5">
          <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">Pincode</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("pincode", {
                required: "Required",
              })}
            />
          </div>
          {/* <div className="flex flex-col">
            <p className="text-xl pb-2 font-medium">GSTIN</p>
            <input
              className="rounded-md w-full"
              type="text"
              {...register("to", {
                required: "Required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
          </div> */}
          <div className="flex flex-col"></div>
        </div>
        <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
        <div className="flex flex-row-reverse  gap-5 text-[#7B7878] font-medium text-xl mr-10 p-5">
          <Button variant="filled" className="bg-[#FFA000]" type="submit">
            <span>Save</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
export default PracticeEdit;
