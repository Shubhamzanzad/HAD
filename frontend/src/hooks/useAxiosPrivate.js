import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
import axios from "../api/axios"
import { toast } from "react-toastify";
const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    const sd = async () => {
        try{
            await axios.post(
              "/auth/isLogged",
              {},
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth?.accessToken}`,
                },
                withCredentials: true,
              }
            );
        }
        catch (error){
            console.log(error);
            if (error.response?.status === 500 || error.response?.status === 503 || !error.response) {
                toast.error("Server error. Please try again later.");
                return;
            }
            setAuth({});
            localStorage.setItem("isLogged", false);
            toast.info("Session expired. Please log in again.");
        }
    };
    sd();
  }, []);

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.log(error)
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          if(newAccessToken === null){
            return Promise.reject(error);
          }
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;
