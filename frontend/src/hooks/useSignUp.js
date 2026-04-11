import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signupMutate, verifySignupOtpMutate } from "../lib/api";
import toast from "react-hot-toast";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const requestOtp = useMutation({
    mutationFn: signupMutate,
    onSuccess: (data) => {
      toast.success(data.message || "Verification code sent successfully!");
    },
  });

  const verifyOtp = useMutation({
    mutationFn: verifySignupOtpMutate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Account created successfully!");
    },
  });

  return {
    requestOtpMutation: requestOtp.mutate,
    verifyOtpMutation: verifyOtp.mutate,
    isRequestingOtp: requestOtp.isPending,
    isVerifyingOtp: verifyOtp.isPending,
    requestOtpError: requestOtp.error,
    verifyOtpError: verifyOtp.error,
    resetRequestOtp: requestOtp.reset,
    resetVerifyOtp: verifyOtp.reset,
  };
};

export default useSignUp;
