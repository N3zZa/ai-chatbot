"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "./keys";
import { authService } from "@/services/auth";
import { UserRequest, UserType } from "@/types/auth.types";
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
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: () => {
      console.log(error);
      toast.error("Неверный логин или пароль");
    },
  });

  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: UserRequest) =>
      authService.signUp(email, password),
    onSuccess: () => {
      toast.success("Проверьте почту для подтверждения!");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Ошибка при регистрации");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), {
        user: null,
        canAsk: true,
        remaining: ANON_MSG_LIMIT,
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Не удалось выйти из аккаунта");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: () => toast.success("Пароль успешно обновлен"),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => toast.success("Пароль успешно обновлен"),
  });

  return {
    user: data?.user ?? null,
    isAnonymous: !data?.user,
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
  };
}
