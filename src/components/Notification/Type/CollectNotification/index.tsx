import {
  NotificationProfileAvatar,
  NotificationProfileName
} from '@components/Notification/Profile'
import {
  NotificationWalletProfileAvatar,
  NotificationWalletProfileName
} from '@components/Notification/WalletProfile'
import { BCharityNotification } from '@generated/bcharitytypes'
import { NewCollectNotification } from '@generated/types'
import { CashIcon, CollectionIcon, UsersIcon } from '@heroicons/react/outline'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import React, { FC } from 'react'

import CollectedAmount from './Amount'
import CollectedContent from './Content'

dayjs.extend(relativeTime)

interface Props {
  notification: NewCollectNotification & BCharityNotification
}

const CollectNotification: FC<Props> = ({ notification }) => {
  const postType =
    notification?.collectedPublication?.metadata?.attributes[0]?.value ??
    notification?.collectedPublication?.__typename?.toLowerCase()

  return (
    <div className="flex gap-x-3 items-center">
      {notification?.wallet?.defaultProfile ? (
        <NotificationProfileAvatar
          profile={notification?.wallet?.defaultProfile}
        />
      ) : (
        <NotificationWalletProfileAvatar wallet={notification?.wallet} />
      )}
      <div className="w-4/5">
        {notification?.wallet?.defaultProfile ? (
          <NotificationProfileName
            profile={notification?.wallet?.defaultProfile}
          />
        ) : (
          <NotificationWalletProfileName wallet={notification?.wallet} />
        )}{' '}
        <span className="text-gray-600 dark:text-gray-400">
          {postType === 'group'
            ? 'joined your'
            : postType === 'fundraise'
            ? 'funded your'
            : 'collected your'}{' '}
        </span>
        <Link
          href={
            postType === 'group'
              ? `/groups/${notification?.collectedPublication?.id}`
              : `/posts/${notification?.collectedPublication?.id}`
          }
          prefetch={false}
        >
          <a
            href={
              postType === 'group'
                ? `/groups/${notification?.collectedPublication?.id}`
                : `/posts/${notification?.collectedPublication?.id}`
            }
            className="font-bold"
          >
            {postType}
          </a>
        </Link>
        <CollectedContent notification={notification} />
        {postType !== 'group' && (
          <CollectedAmount notification={notification} />
        )}
        <div className="flex items-center pt-1 space-x-1 text-gray-400 text-[12px]">
          {postType === 'group' ? (
            <UsersIcon className="text-pink-500 h-[15px]" />
          ) : postType === 'fundraise' ? (
            <CashIcon className="text-pink-500 h-[15px]" />
          ) : (
            <CollectionIcon className="text-pink-500 h-[15px]" />
          )}
          <div>{dayjs(new Date(notification?.createdAt)).fromNow()}</div>
        </div>
      </div>
    </div>
  )
}

export default CollectNotification
