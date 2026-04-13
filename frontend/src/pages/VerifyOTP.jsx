import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTP = () => {
  const { backendUrl, setToken, token } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      navigate("/login");
    }
  }, [location]);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/user/verify-otp", {
        email,
        otp,
      });
      if (data.success) {
        toast.success(data.message);
        setToken(data.token); // This should ideally be true if context uses it as a flag, but if it stores actual token...
        // Wait, in Login.jsx it does setToken(true). Let's check Context.
        setToken(true);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Verify Account</p>
        <p>
          Please enter the 6-digit code sent to <b>{email}</b>
        </p>
        <div className="w-full">
          <p>OTP Code</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1 text-center text-xl tracking-widest"
            type="text"
            maxLength="6"
            onChange={(e) => setOtp(e.target.value)}
            value={otp}
            required
            placeholder="XXXXXX"
          />
        </div>
        <button
          type="submit"
          className="bg-[#000B6D] text-white w-full py-2 rounded-md text-base mt-2"
        >
          Verify OTP
        </button>
        <p className="text-xs text-center w-full mt-2">
          The code expires in 10 minutes.
        </p>
      </div>
    </form>
  );
};

export default VerifyOTP;
