import axios from '../api/axios';
import useAuth from './useAuth';
import { toast } from 'react-toastify';
const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        try{
            const response = await axios.post('/auth/refreshtoken', {
                withCredentials: true
            });
            setAuth(prev => {
                console.log(JSON.stringify(prev));
                console.log(response.data.token);
                return { ...prev, accessToken: response.data.token }
            });
            localStorage.setItem("isLogged",true);
            return response.data.token;
        }
        catch(error){
            if(error.response.status === 500 || error.response.status===503){
                toast.error("Internal Server Error ! try again after some time")
            }
            else{

                toast.info("Session expired. Please log in again.");
            }
            setAuth({});
            localStorage.setItem("isLogged",false);
            return null;
        }
    }
    return refresh;
};

export default useRefreshToken;