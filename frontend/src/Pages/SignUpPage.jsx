import { useState } from "react";
import { Rainbow } from "lucide-react";
import { Link } from "react-router-dom";
import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const {
    requestOtpMutation,
    verifyOtpMutation,
    isRequestingOtp,
    isVerifyingOtp,
    requestOtpError,
    verifyOtpError,
    resetRequestOtp,
    resetVerifyOtp,
  } = useSignUp();
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    otp: "",
  });
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpExpiresInMinutes, setOtpExpiresInMinutes] = useState(10);

  const activeError = isOtpStep ? verifyOtpError : requestOtpError;
  const isBusy = isRequestingOtp || isVerifyingOtp;

  const handleRequestOtp = (e) => {
    e.preventDefault();

    resetVerifyOtp();
    requestOtpMutation(
      {
        fullName: signupData.fullName,
        email: signupData.email,
        password: signupData.password,
      },
      {
        onSuccess: (data) => {
          setIsOtpStep(true);
          setOtpEmail(data.email || signupData.email);
          setOtpExpiresInMinutes(data.expiresInMinutes || 10);
        },
      }
    );
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    resetRequestOtp();
    verifyOtpMutation({
      email: otpEmail || signupData.email,
      otp: signupData.otp,
    });
  };

  const handleEditDetails = () => {
    resetVerifyOtp();
    setSignupData((currentData) => ({ ...currentData, otp: "" }));
    setIsOtpStep(false);
  };

  const handleResendOtp = () => {
    resetVerifyOtp();
    requestOtpMutation(
      {
        fullName: signupData.fullName,
        email: signupData.email,
        password: signupData.password,
      },
      {
        onSuccess: (data) => {
          setIsOtpStep(true);
          setOtpEmail(data.email || signupData.email);
          setOtpExpiresInMinutes(data.expiresInMinutes || 10);
        },
      }
    );
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Rainbow className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              NexCall
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {activeError && (
            <div className="alert alert-error mb-4">
              <div>
                <span>
                  {activeError.response?.data?.message ||
                    "An error occurred. Please try again."}
                </span>
              </div>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={isOtpStep ? handleVerifyOtp : handleRequestOtp}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {isOtpStep ? "Verify Your Email" : "Create an Account"}
                  </h2>
                  <p className="text-sm opacity-70">
                    {isOtpStep
                      ? `Enter the 6-digit code sent to ${otpEmail || signupData.email}.`
                      : "Join NexCall and start your adventure!"}
                  </p>
                </div>

                {!isOtpStep ? (
                  <div className="space-y-3">
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered w-full"
                        value={signupData.fullName}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@gmail.com"
                        className="input input-bordered w-full"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <input
                        type="password"
                        placeholder="********"
                        className="input input-bordered w-full"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="text-xs opacity-70 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          required
                        />

                        <span className="text-xs leading-tight">
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="text-primary hover:underline"
                          >
                            terms of service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="text-primary hover:underline"
                          >
                            privacy policy
                          </Link>
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                      <p className="font-medium">Verification code sent</p>
                      <p className="mt-1 opacity-70">
                        Your code expires in {otpExpiresInMinutes} minutes.
                      </p>
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">OTP Code</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="123456"
                        className="input input-bordered w-full tracking-[0.5em]"
                        value={signupData.otp}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                          })
                        }
                        required
                      />
                      <p className="text-xs opacity-70 mt-1">
                        Enter the 6-digit code from your email.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="btn btn-outline flex-1"
                        onClick={handleEditDetails}
                        disabled={isBusy}
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost flex-1"
                        onClick={handleResendOtp}
                        disabled={isBusy}
                      >
                        {isRequestingOtp ? "Resending..." : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}

                <button className="btn btn-primary w-full" type="submit">
                  {isBusy ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      {isOtpStep ? "Verifying..." : "Sending OTP..."}
                    </>
                  ) : (
                    (isOtpStep ? "Verify & Create Account" : "Create Account")
                  )}
                </button>

                {!isOtpStep && (
                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/vc.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with friends worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends online and explore new
                cultures with NexCall.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
