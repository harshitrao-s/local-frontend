import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";
import full_logo_img from "../../src/Assets/dist/img/sb_logo_full.jpg";
import apiFetch from "../Utils/apiFetch";
import Swal from "sweetalert2";
import { API_ENDPOINTS } from "../Config/api";
import { Eye, EyeOff } from "lucide-react"
import { Input } from "../Components/Common/ui/input";
import { Button } from "../Components/Common/ui/button";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false)
  const redirectTo = params.get("redirectTo") || "/dashboard";
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(false);

    try {
      const data = await apiFetch(API_ENDPOINTS.API_LOGIN, {
        method: "POST",
        body: {
          username: email,
          password: password,
        },
        skipAuthRefresh: true,
      });

      if (data?.status === "success") {
        setShowSuccess(true)

        setTimeout(() => {
          login()
          navigate(decodeURIComponent(redirectTo), { replace: true })
        }, 1200)
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      const msg = "Invalid credentials";

      setLoginError(true);
      Swal.close();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Invalid email or password",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#f8d7da",   // light red
        color: "#842029",        // dark red text
        iconColor: "#842029",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col justify-content-center lg:flex-row overflow-hidden ">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex justify-center items-center px-4 sm:px-6 md:px-10 lg:px-16 py-8">

        {/* Container */}
        <div className="w-full max-w-[540px]">

          {/* Logo */}
          <div className="mb-8 md:mb-10">
            <img
              src="/Logo.svg"
              className="w-[180px] md:w-[220px] lg:w-[249px] h-auto"
            />
          </div>

          {/* Header */}
          <div className="flex flex-col gap-5 md:gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#323130]">
                Log In
              </h2>
              <p className="text-sm md:text-base text-gray-500">
                Let's get you started
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="flex flex-col gap-6">

              <div className="flex flex-col gap-4">

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (loginError) setLoginError(false)
                    }}
                    placeholder="yogavvijaya@gmail.com"
                    className={`w-full h-[48px] md:h-[52px] px-4 border rounded-[30px] focus:ring-2 focus:ring-blue-800 ${loginError ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (loginError) setLoginError(false)
                      }}
                      placeholder="Input password"
                      className={`w-full h-[48px] md:h-[52px] px-4 pr-10 border rounded-[30px] focus:ring-2 focus:ring-blue-800 ${loginError ? "border-red-500" : "border-gray-300"
                        }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-600">
                    <Input type="checkbox" className="mr-2 h-4 w-4" />
                    Remember me
                  </label>

                  <Link className="text-[14px] font-semibold text-[#002961] cursor-pointer">
                    Forgot Password
                  </Link>
                </div>
              </div>

              {/* Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF141F] text-white text-sm md:text-base font-bold py-4 rounded-[30px]"
              >
                {loading ? "Loading..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side (only desktop) */}
      <div className="hidden lg:flex lg:w-1/2">
        <img
          src="/loginBanner.svg"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Login Animation after click on button */}

     
    </div>
  );
};

export default LoginPage;
