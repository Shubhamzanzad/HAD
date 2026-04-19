import React from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../../utilComponents/Loading";
import { useParams } from "react-router-dom";
import axios from "../../../api/axios";

export default function VerifyEmail() {
  const navigate = useNavigate();
  useEffect(() => {
    const windowValues = window.location.search;
    const requestParams = new URLSearchParams(windowValues);
    let role = requestParams.get("role");
    const token = requestParams.get("token");
    const isHeadDoctor = requestParams.get("flag");
    const requestBody = {
      role: role,
      token: token,
      isHeadDoctor: isHeadDoctor,
    };
    const verifyToken = async () => {
      try {
        const resp = await axios.post(
          "/auth/verifyEmail",
          requestBody
        );
        // console.log(resp);
        if (
          resp.data == "Invalid Token" ||
          resp.data == "Verification Token Expired"
        ) {
          toast.error(resp.data);
          navigate("/login")
        } else {
          toast.success(resp.data);
          if (role === "HEAD_DOCTOR") role = role.slice(5);
          navigate(
            `/register/${role.toLocaleLowerCase()}/?isHeadDoctor=${isHeadDoctor}`,{ state: { token:  token} }
          );
        }
      } catch (error) {
        // console.log(error);
        toast.error(error.response.data);
      }
    };
    verifyToken();
  }, []);

  return <Loading />;
}
