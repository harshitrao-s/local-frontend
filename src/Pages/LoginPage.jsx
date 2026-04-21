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
        login();
        navigate(decodeURIComponent(redirectTo), { replace: true });
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
    // <div className="bg-light min-vh-100 d-flex align-items-center py-5">
    //   <div className="container">
    //     <div className="row justify-content-center">
    //       <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">

    //         {/* Logo */}
    //         <div className="text-center mb-4">
    //           <img
    //             src={full_logo_img}
    //             alt="ShopperBeats Logo"
    //             className="img-fluid mb-3"
    //             style={{ maxHeight: "60px" }}
    //           />
    //           <h4 className="fw-bold">Admin Portal</h4>
    //           <p className="text-muted small">
    //             Please enter your credentials to continue
    //           </p>
    //         </div>

    //         {/* Login Card */}
    //         <div className="card border-0 shadow-sm rounded-4">
    //           <div className="card-body p-4 p-md-5">
    //             <form onSubmit={handleLogin}>

    //               {/* Email */}
    //               <div className="mb-3">
    //                 <label className="form-label small fw-bold text-muted text-uppercase">
    //                   Email
    //                 </label>
    //                 <div className="input-group">
    //                   <span className={`input-group-text bg-white border-end-0 ${
    //                       loginError ? "input-error" : ""
    //                     }`}>
    //                     <i className="fas fa-envelope text-muted"></i>
    //                   </span>
    //                   <input
    //                     type="email"
    //                     value={email}
    //                     className={`form-control border-start-0 ps-0 ${
    //                       loginError ? "input-error" : ""
    //                     }`}
    //                     placeholder="Email address"
    //                     onChange={(e) => {
    //                       setEmail(e.target.value);
    //                       if (loginError) setLoginError(false);
    //                     }}
    //                     required
    //                   />
    //                 </div>
    //               </div>

    //               {/* Password */}
    //               <div className="mb-4">
    //                 <label className="form-label small fw-bold text-muted text-uppercase">
    //                   Password
    //                 </label>
    //                 <div className="input-group">
    //                   <span className={`input-group-text bg-white border-end-0 ${
    //                       loginError ? "input-error" : ""
    //                     }`}>
    //                     <i className="fas fa-lock text-muted"></i>
    //                   </span>
    //                   <input
    //                     type="password"
    //                     value={password}
    //                     className={`form-control border-start-0 ps-0 ${
    //                       loginError ? "input-error" : ""
    //                     }`}
    //                     placeholder="••••••••"
    //                     onChange={(e) => {
    //                       setPassword(e.target.value);
    //                       if (loginError) setLoginError(false);
    //                     }}
    //                     required
    //                   />
    //                 </div>
    //               </div>

    //               {/* Button */}
    //               <button
    //                 type="submit"
    //                 className="btn btn-dark w-100 py-2 fw-bold rounded-3"
    //                 disabled={loading}
    //               >
    //                 {loading && (
    //                   <span className="spinner-border spinner-border-sm me-2"></span>
    //                 )}
    //                 Login
    //               </button>

    //             </form>
    //           </div>
    //         </div>

    //         {/* Footer */}
    //         <div className="text-center mt-4">
    //           <p className="text-muted small">
    //             © {new Date().getFullYear()} ShopperBeats. All rights reserved.
    //           </p>
    //         </div>

    //       </div>
    //     </div>
    //   </div>
    // </div>

    // <div className="flex h-screen w-full flex-col lg:flex-row overflow-hidden ">
    //   {/* Left Side: Login Form  */}
    //   <div className="w-full lg:w-1/2 h-full overflow-hidden flex flex-col p-6 md:p-10 lg:p-16 justify-center align-items-center">
    //     <div className="h-[530px] w-[540px]">
    //       {/* Logo */}
    //       <div className="mb-[48px]">
    //         <img
    //           src="/Logo.svg"
    //           alt="Dashboard Preview"
    //           className="w-[249px] h-[51px] object-cover"
    //         />
    //       </div>

    //       {/* Text Header */}
    //       <div className="flex flex-col gap-[25px]">
    //         <div className="flex flex-col gap-[8px]">
    //           <h2 className="text-[30px] text-600 font-roboto font-semibold text-[#323130] leading-[39px]">Sign Up</h2>
    //           <p className="text-gray-500">Let's get you started</p>
    //         </div>
    //         {/* Form */}

    //         <form className="flex flex-col gap-[24px]">
    //           <div className="h-[214px] flex flex-col gap-[16px]">

    //             <div className="h-[79px] flex flex-col gap-[6px]">
    //               <label className="block text-sm h-[21px] font-medium text-gray-700">Email</label>

    //               <Input type="email"
    //                 placeholder="yogavvijaya@gmail.com"
    //                 className="w-full h-[52px] px-4 py-3 border border-gray-300 rounded-[30px] focus:ring-2 focus:ring-red-500 focus:outline-none" />
    //             </div>

    //             <div className="h-[79px] flex flex-col gap-[6px]">
    //               <label className="block text-sm h-[21px] font-medium text-gray-700">
    //                 Password
    //               </label>

    //               <div className="relative">
    //                 <Input
    //                   type={showPassword ? "text" : "password"}
    //                   placeholder="Input password"
    //                   className="w-full px-4 py-3 h-[52px] border border-gray-300 rounded-[30px] pr-10 focus:ring-2 focus:ring-blue-800 focus:outline-none"
    //                 />

    //                 {/* Eye Button */}
    //                 <Button
    //                   type="button"
    //                   onClick={() => setShowPassword(!showPassword)}
    //                   className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-0"
    //                 >
    //                   {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
    //                 </Button>
    //               </div>
    //             </div>

    //             <div className="flex items-center justify-between h-[24px]">
    //               <label className="flex items-center text-sm text-gray-600">
    //                 <Input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 accent-red-600" />
    //                 Remember me?
    //               </label>
    //               <a href="#" className="text-[14px] eading-[0.5em] font-bold text-[#002961] underline">Forget Password</a>
    //             </div>
    //           </div>

    //           <Button
    //             type="submit"
    //             variant="ghost"
    //             className="w-full bg-[#FF141F] text-white text-[14px] font-[700] py-4 px-3 rounded-[30px]"
    //           >
    //             Sign In
    //           </Button>
    //         </form>
    //       </div>

    //       <p className="pt-3 text-center  text-[14px] leading-[0.5em] text-[#323130]">
    //         Do not have account ? <Link href="#" className="text-[#002961] font-bold underline text-[14px] leading-[0.5em]">Sign Up</Link>
    //       </p>
    //     </div>
    //   </div>

    //   {/* Right Side: Image Section (720px) - Hidden on Mobile */}
    //   <div className="hidden lg:flex lg:w-1/2 h-full overflow-hidden">
    //     <img
    //       src="/loginBanner.svg"
    //       alt="Dashboard Preview"
    //       className="w-full h-full object-cover"
    //     />

    //   </div>
    // </div>

    <div className="flex h-screen w-full flex-col lg:flex-row overflow-hidden ">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 h-full overflow-hidden flex flex-col p-6 md:p-10 lg:p-16 justify-center align-items-center">
        <div className="h-[530px] w-[540px]">

          {/* Logo */}
          <div className="mb-[48px]">
            <img src="/Logo.svg" className="w-[249px] h-[51px] object-cover" />
          </div>

          {/* Header */}
          <div className="flex flex-col gap-[25px]">
            <div className="flex flex-col gap-[8px]">
              <h2 className="text-[30px] text-600 font-roboto font-semibold text-[#323130] leading-[39px]">
                Sign Up
              </h2>
              <p className="text-gray-500">Let's get you started</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="flex flex-col gap-[24px]">

              <div className="h-[214px] flex flex-col gap-[16px]">

                {/* Email */}
                <div className="h-[79px] flex flex-col gap-[6px]">
                  <label className="block text-sm h-[21px] font-medium text-gray-700">
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
                    className={`w-full h-[52px] px-4 py-3 border rounded-[30px] focus:ring-2 focus:ring-red-500 focus:outline-none ${loginError ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                </div>

                {/* Password */}
                <div className="h-[79px] flex flex-col gap-[6px]">
                  <label className="block text-sm h-[21px] font-medium text-gray-700">
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
                      className={`w-full px-4 py-3 h-[52px] border rounded-[30px] pr-10 focus:ring-2 focus:ring-blue-800 focus:outline-none ${loginError ? "border-red-500" : "border-gray-300"
                        }`}
                    />

                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-0"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                  </div>
                </div>

                {/* Remember */}
                <div className="flex items-center justify-between h-[24px]">
                  <label className="flex items-center text-sm text-gray-600">
                    <Input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300 accent-red-600" />
                    Remember me?
                  </label>
                  <a href="#" className="text-[14px] font-bold text-[#002961] underline">
                    Forget Password
                  </a>
                </div>
              </div>

              {/* Button */}
              <Button
                type="submit"
                variant="ghost"
                disabled={loading}
                className="w-full bg-[#FF141F] text-white text-[14px] font-[700] py-4 px-3 rounded-[30px]"
              >
                {loading ? "Loading..." : "Sign In"}
              </Button>

            </form>
          </div>

          {/* <p className="pt-3 text-center text-[14px] text-[#323130]">
            Do not have account ?{" "}
            <span className="text-[#002961] font-bold underline">
              Sign Up
            </span>
          </p> */}
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-1/2 h-full overflow-hidden">
        <img src="/loginBanner.svg" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default LoginPage;
