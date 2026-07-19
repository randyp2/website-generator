"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query"

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.api"
import type {
  NotificationDTO,
  NotificationListResponse,
  UnreadCountResponse,
} from "./notifications.types"

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (page: number, size: number) =>
    [...notificationQueryKeys.lists(), { page, size }] as const,
  infiniteLists: () => [...notificationQueryKeys.all, "infinite"] as const,
  infiniteList: (size: number) =>
    [...notificationQueryKeys.infiniteLists(), { size }] as const,
}

const withReadState = (
  notification: NotificationDTO,
  readAt: string,
): NotificationDTO => ({
  ...notification,
  read: true,
  readAt: notification.readAt ?? readAt,
})

const mergeNotificationRead = (
  notification: NotificationDTO,
  notificationId: string,
  readAt: string,
  updatedNotification?: NotificationDTO,
): NotificationDTO => {
  if (notification.id !== notificationId) return notification
  return updatedNotification ?? withReadState(notification, readAt)
}

const updateListResponseNotification = (
  response: NotificationListResponse | undefined,
  notificationId: string,
  readAt: string,
  updatedNotification?: NotificationDTO,
): NotificationListResponse | undefined => {
  if (!response) return response

  return {
    ...response,
    notifications: response.notifications.map((notification) =>
      mergeNotificationRead(
        notification,
        notificationId,
        readAt,
        updatedNotification,
      ),
    ),
  }
}

const markListResponseAllRead = (
  response: NotificationListResponse | undefined,
  readAt: string,
): NotificationListResponse | undefined => {
  if (!response) return response

  return {
    ...response,
    notifications: response.notifications.map((notification) =>
      withReadState(notification, readAt),
    ),
  }
}

const updateInfiniteNotification = (
  data: InfiniteData<NotificationListResponse, number> | undefined,
  notificationId: string,
  readAt: string,
  updatedNotification?: NotificationDTO,
): InfiniteData<NotificationListResponse, number> | undefined => {
  if (!data) return data

  return {
    ...data,
    pages: data.pages.map((page) =>
      updateListResponseNotification(
        page,
        notificationId,
        readAt,
        updatedNotification,
      ) ?? page,
    ),
  }
}

const markInfiniteAllRead = (
  data: InfiniteData<NotificationListResponse, number> | undefined,
  readAt: string,
): InfiniteData<NotificationListResponse, number> | undefined => {
  if (!data) return data

  return {
    ...data,
    pages: data.pages.map((page) => markListResponseAllRead(page, readAt) ?? page),
  }
}

type ListSnapshot = Array<
  readonly [readonly unknown[], NotificationListResponse | undefined]
>

type InfiniteListSnapshot = Array<
  readonly [
    readonly unknown[],
    InfiniteData<NotificationListResponse, number> | undefined,
  ]
>

const snapshotNotificationQueries = (queryClient: QueryClient) => ({
  unreadCount: queryClient.getQueryData<UnreadCountResponse>(
    notificationQueryKeys.unreadCount(),
  ),
  lists: queryClient.getQueriesData<NotificationListResponse>({
    queryKey: notificationQueryKeys.lists(),
  }) as ListSnapshot,
  infiniteLists: queryClient.getQueriesData<
    InfiniteData<NotificationListResponse, number>
  >({
    queryKey: notificationQueryKeys.infiniteLists(),
  }) as InfiniteListSnapshot,
})

const restoreNotificationQueries = (
  queryClient: QueryClient,
  snapshot: ReturnType<typeof snapshotNotificationQueries> | undefined,
) => {
  if (!snapshot) return

  queryClient.setQueryData(notificationQueryKeys.unreadCount(), snapshot.unreadCount)
  snapshot.lists.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data)
  })
  snapshot.infiniteLists.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data)
  })
}

const decrementUnreadCount = (queryClient: QueryClient) => {
  queryClient.setQueryData<UnreadCountResponse>(
    notificationQueryKeys.unreadCount(),
    (current) => ({
      unreadCount: Math.max(0, (current?.unreadCount ?? 0) - 1),
    }),
  )
}

const clearUnreadCount = (queryClient: QueryClient) => {
  queryClient.setQueryData<UnreadCountResponse>(
    notificationQueryKeys.unreadCount(),
    { unreadCount: 0 },
  )
}

const markNotificationReadInCache = (
  queryClient: QueryClient,
  notificationId: string,
  updatedNotification?: NotificationDTO,
) => {
  const readAt = updatedNotification?.readAt ?? new Date().toISOString()

  queryClient.setQueriesData<NotificationListResponse>(
    { queryKey: notificationQueryKeys.lists() },
    (response) =>
      updateListResponseNotification(
        response,
        notificationId,
        readAt,
        updatedNotification,
      ),
  )

  queryClient.setQueriesData<InfiniteData<NotificationListResponse, number>>(
    { queryKey: notificationQueryKeys.infiniteLists() },
    (data) =>
      updateInfiniteNotification(
        data,
        notificationId,
        readAt,
        updatedNotification,
      ),
  )
}

const markAllNotificationsReadInCache = (queryClient: QueryClient) => {
  const readAt = new Date().toISOString()

  queryClient.setQueriesData<NotificationListResponse>(
    { queryKey: notificationQueryKeys.lists() },
    (response) => markListResponseAllRead(response, readAt),
  )

  queryClient.setQueriesData<InfiniteData<NotificationListResponse, number>>(
    { queryKey: notificationQueryKeys.infiniteLists() },
    (data) => markInfiniteAllRead(data, readAt),
  )
}

export const useUnreadNotificationCountQuery = () =>
  useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: fetchUnreadNotificationCount,
    select: (response) => response.unreadCount,
  })

export const useNotificationPreviewQuery = ({
  enabled,
  size,
}: {
  enabled: boolean
  size: number
}) =>
  useQuery({
    queryKey: notificationQueryKeys.list(0, size),
    queryFn: () => fetchNotifications({ page: 0, size }),
    enabled,
  })

export const useNotificationsInfiniteQuery = (pageSize: number) =>
  useInfiniteQuery({
    queryKey: notificationQueryKeys.infiniteList(pageSize),
    queryFn: ({ pageParam }) =>
      fetchNotifications({ page: pageParam, size: pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.notifications.length === pageSize ? allPages.length : undefined,
  })

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all })
      const snapshot = snapshotNotificationQueries(queryClient)
      markNotificationReadInCache(queryClient, notificationId)
      decrementUnreadCount(queryClient)
      return snapshot
    },
    onError: (_error, _notificationId, snapshot) => {
      restoreNotificationQueries(queryClient, snapshot)
    },
    onSuccess: (updatedNotification) => {
      markNotificationReadInCache(
        queryClient,
        updatedNotification.id,
        updatedNotification,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    },
  })
}

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.all })
      const snapshot = snapshotNotificationQueries(queryClient)
      markAllNotificationsReadInCache(queryClient)
      clearUnreadCount(queryClient)
      return snapshot
    },
    onError: (_error, _variables, snapshot) => {
      restoreNotificationQueries(queryClient, snapshot)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    },
  })
}
