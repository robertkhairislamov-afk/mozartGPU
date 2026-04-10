import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Instance, InstanceCreate } from '@/lib/types'

const INSTANCES_KEY = ['instances'] as const

export function useInstances() {
  return useQuery<Instance[]>({
    queryKey: INSTANCES_KEY,
    queryFn: async () => {
      const { data } = await api.get<Instance[]>('/instances/')
      return data
    },
  })
}

export function useInstance(id: string) {
  return useQuery<Instance>({
    queryKey: [...INSTANCES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<Instance>(`/instances/${id}`)
      return data
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'creating') return 5000
      if (status === 'running') return 30000
      return false
    },
  })
}

export function useCreateInstance() {
  const queryClient = useQueryClient()
  return useMutation<Instance, Error, InstanceCreate>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Instance>('/instances/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTANCES_KEY })
    },
  })
}

export function useDestroyInstance() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/instances/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTANCES_KEY })
    },
  })
}
