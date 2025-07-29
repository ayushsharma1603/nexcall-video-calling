import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signupMutate } from "../lib/api";
import toast from "react-hot-toast";

const useSignUp = () => {
  const queryClient = useQueryClient();
    //mutate is default name used by react-query to mutate data here we are renaing as signupMutation
    const {
      mutate: signupMutation,
      isPending,
      error,
    } = useMutation({
      mutationFn: signupMutate,
      onSuccess: async () => {
        await queryClient.invalidateQueries(["authUser"]);
        toast.success("Account created successfully!");
      },
    });
    return {
      signupMutation,
      isPending,
      error,
    };
}

export default useSignUp