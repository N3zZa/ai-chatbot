"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "./keys";
import { authService } from "@/services/auth";
import { UserRequest, UserType } from "@/types/auth.types";
import { useEffect } from "react";
import { ANON_MSG_LIMIT } from "@/constants";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<UserType>({
    queryKey: authKeys.user(),
    queryFn: authService.me,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: UserRequest) =>
      authService.login(email, password),
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Invalid username or password");
    },
  });

  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: UserRequest) =>
      authService.signUp(email, password),
    onSuccess: () => {
      toast.success("Check your email for confirmation!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error during registration");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
        queryClient.setQueryData(authKeys.user(), {
          user: null,
          canAsk: true,
          remaining: ANON_MSG_LIMIT,
        });
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Couldn't log out of account");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: () => toast.success("Password has been successfully updated"),
    onError: (error) => {
      console.error(error);
      toast.error("Couldn't update password");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => toast.success("Password has been successfully updated"),
    onError: (error) => {
      console.error(error);
      toast.error("Couldn't update password");
    },
  });

  const signInAnonymouslyMutation = useMutation({
    mutationFn: authService.signInAnonymously,
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });

  useEffect(() => {
    if (!isLoading && !data?.user) {
      signInAnonymouslyMutation.mutate();
    }
  }, [data?.user, isLoading]);

  return {
    user: data?.user ?? null,
    isAnonymous: data?.user?.is_anonymous ?? true,
    canAsk: data?.canAsk ?? true,
    remaining: data?.remaining ?? 0,
    isLoading,
    error,

    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,

    signUp: signUpMutation.mutate,
    isSigningUp: signUpMutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    updatePassword: updatePasswordMutation.mutate,
    isUpdatingPassword: updatePasswordMutation.isPending,

    forgotPassword: forgotPasswordMutation.mutate,
    isForgotingPassword: forgotPasswordMutation.isPending,

    signInAnonymously: signInAnonymouslyMutation.mutate,
  };
}
