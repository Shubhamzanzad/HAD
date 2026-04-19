import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import React, { useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function ChangePasswordDialog(id, role) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const changePassword = async () => {
    if (getValues("newPassword") === getValues("confirmPassword")) {
      setValue("id", id);
      setValue("role", role);
      // console.log(getValues());
      try {
        const response = await axiosPrivate.post(
          `/auth/changePassword`,
          getValues()
        );
        toast.success("Password Changed Successfully");
        navigate("/login");
        // setUserDetails(response.data);
      } catch (err) {
        if (!err?.response) {
          // console.error("No Server Response");
          toast.error("Password Change Failed");
        }
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="inline-flex font-bold text-[15px]"
      >
        Change Password
      </button>
      <Dialog open={open} onClose={handleOpen} size="xl">
        <DialogHeader>Change Password</DialogHeader>
        <div className="h-[1px] bg-[#827F7F82]"></div>
        <DialogBody className="flex flex-col item-center justify-center">
          <input
            type="password"
            className="items-center justify-center mb-5 rounded"
            placeholder="Enter Old Password"
            {...register("oldPassword", {
              required: "Required",
            })}
          />
          <input
            type="password"
            className="flex items-center mb-5 justify-center rounded"
            placeholder="Enter New Password"
            {...register("newPassword", {
              required: "Required",
            })}
          />

          <input
            type="password"
            className="flex items-center justify-center rounded "
            placeholder="Confirm Password"
            {...register("confirmPassword", {
              required: "Required",
            })}
          />
        </DialogBody>
        <DialogFooter>
          {/* {role === "head_doctor" && (
            <Button
              variant="filled"
              className="bg-[#FFA000]"
              //   onClick={() => deletePatient(patient)}
            >
              <span>Delete Patient</span>
            </Button>
          )} */}
          <Button
            variant="filled"
            className="bg-[#FFA000]"
            onClick={() => changePassword()}
          >
            <span>Change Password</span>
          </Button>

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
}
