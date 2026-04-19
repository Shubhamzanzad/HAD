import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";
import { jwtDecode } from "jwt-decode";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import dayjs from "dayjs";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9005";

const useFetchEventSource = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

  const originalRequest = async (url, config) => {
    // console.log("config");
    // console.log(config);
    url = `${BASE_URL}${url}`;
    await fetchEventSource(url, config);
  };

  let callFetch = async (url,config) => {
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;
    const isExpired = dayjs.unix(decoded.exp).diff(dayjs()) < 1;
    let accessToken = auth.accessToken;

    if (isExpired) {
      accessToken = await refresh();
    }

    config["headers"] = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      credentials: "include",
    };

    await originalRequest(url, config);
  };

  return callFetch;
};

export default useFetchEventSource;
