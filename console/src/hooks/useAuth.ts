import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getMe, isAuthenticated, login, logout, register } from '@/lib/auth'
import type { LoginRequest, RegisterRequest, User } from '@/lib/types'

export const AUTH_KEY = ['auth', 'me'] as const

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: AUTH_KEY,
    queryFn: getMe,
    enabled: isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min
  })

  const loginMutation = useMutation<User, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEY, data)
      navigate('/dashboard')
    },
  })

  const registerMutation = useMutation<User, Error, RegisterRequest>({
    mutationFn: register,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEY, data)
      navigate('/dashboard')
    },
  })

  const logoutFn = () => {
    logout()
    queryClient.clear()
    navigate('/login')
  }

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: isAuthenticated() && !isError,
    login: loginMutation,
    register: registerMutation,
    logout: logoutFn,
  }
}
