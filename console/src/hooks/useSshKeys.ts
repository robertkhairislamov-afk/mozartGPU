import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { SshKey, SshKeyCreate } from '@/lib/types'

export const SSH_KEYS_KEY = ['ssh-keys'] as const

export function useSshKeys() {
  return useQuery<SshKey[]>({
    queryKey: SSH_KEYS_KEY,
    queryFn: async () => {
      const { data } = await api.get<SshKey[]>('/ssh-keys/')
      return data
    },
  })
}

export function useAddSshKey() {
  const queryClient = useQueryClient()
  return useMutation<SshKey, Error, SshKeyCreate>({
    mutationFn: async (payload) => {
      const { data } = await api.post<SshKey>('/ssh-keys/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SSH_KEYS_KEY })
    },
  })
}

export function useDeleteSshKey() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/ssh-keys/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SSH_KEYS_KEY })
    },
  })
}
