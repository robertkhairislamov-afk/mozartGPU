import api, { clearTokens, getAccessToken, setTokens } from './api'
import type { LoginRequest, RegisterRequest, TokenResponse, User } from './types'

export const isAuthenticated = (): boolean => {
  return Boolean(getAccessToken())
}

export const login = async (credentials: LoginRequest): Promise<User> => {
  const { data: tokens } = await api.post<TokenResponse>('/auth/login', credentials)
  setTokens(tokens.access_token, tokens.refresh_token)
  const { data: user } = await api.get<User>('/auth/me')
  return user
}

export const register = async (payload: RegisterRequest): Promise<User> => {
  const { data: tokens } = await api.post<TokenResponse>('/auth/register', payload)
  setTokens(tokens.access_token, tokens.refresh_token)
  const { data: user } = await api.get<User>('/auth/me')
  return user
}

export const logout = (): void => {
  clearTokens()
}

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/auth/me')
  return data
}
