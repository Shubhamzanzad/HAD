import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { useState } from "react";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const AddDoctorForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const axiosPrivate = useAxiosPrivate();

  const onSubmit = async () => {
    // console.log(getValues())
    try {
      const resp = await axiosPrivate.post(
        "/auth/sendEmail",
        getValues()
      );
      // console.log(resp);
      if (resp.status === 200) {
        toast.success(resp.data.status);
        // navigate("/login");
        setOpen(!open);
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data);
    }
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  return (
    <div>
      <button
        onClick={handleOpen}
        className="inline-flex gap-[15px] px-[1.05rem] m-2 py-[0.25rem] h-[2.8rem] justify-center items-center text-white w-fit hover:bg-[#276059] bg-[#006666] rounded-[10px]"
      >
        {/* <MdAdd className="h-[35px] w-[35px] m-auto" /> */}
        <div className="relative w-fit font-semibold m-auto text-[20px]">
          Invite Faculty
        </div>
      </button>

      <Dialog open={open} onClose={handleOpen} size="lg">
        <DialogHeader>Send Invite Link</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>
        <DialogBody>
          {/* <div className="grid grid-cols-2  gap-5 text-[#7B7878] font-medium text-xl p-5">
            <div>
              <div className="flex flex-col">
                <p className="text-xl pb-2 font-semibold">Name*</p>
                <div className=" ">
                  <input className="rounded-md w-full"></input>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col">
                <p className="text-xl pb-2 font-semibold">Mobile Number*</p>
                <div className=" ">
                  <input className="rounded-md w-full"></input>
                </div>
              </div>
            </div>
          </div> */}
          <div className="grid grid-cols-1 gap-5 text-[#7B7878] font-medium text-xl px-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <select
                className="w-full my-3 rounded-md"
                {...register("role", { required: "Required" })}
              >
                <option hidden defaultValue={true}>
                  Select Role
                </option>
                {/* <option value="HEAD_DOCTOR">Head Doctor</option> */}
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
              </select>

              <div className="flex flex-col">
                <p className="text-xl pb-2 font-semibold">Email Address</p>
                <div className="flex">
                  <input
                    className="rounded-md w-3/4"
                    {...register("to", {
                      required: "Required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  ></input>
                  <Button
                    className="hover:bg-[#276059] bg-[#006666] rounded-[10px] w-1/4 "
                    type="submit"
                  >
                    <span>Send Invite Link</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <hr className="h-[3px] bg-[#7B7878] mx-2 mt-6 opacity-50	" />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
export default AddDoctorForm;
