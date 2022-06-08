import { gql, useQuery } from '@apollo/client'
import Collectors from '@components/Shared/Collectors'
import Markup from '@components/Shared/Markup'
import { Button } from '@components/UI/Button'
import { Modal } from '@components/UI/Modal'
import AppContext from '@components/utils/AppContext'
import { BCharityPost } from '@generated/bcharitytypes'
import {
  ClockIcon,
  CogIcon,
  HashtagIcon,
  PencilAltIcon,
  UsersIcon
} from '@heroicons/react/outline'
import consoleLog from '@lib/consoleLog'
import humanize from '@lib/humanize'
import imagekitURL from '@lib/imagekitURL'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import dynamic from 'next/dynamic'
import React, { FC, ReactNode, useContext, useState } from 'react'

import Join from './Join'

const Settings = dynamic(() => import('./Settings'), {
  loading: () => <div className="m-5 h-5 rounded-lg shimmer" />
})

dayjs.extend(relativeTime)

export const HAS_JOINED_QUERY = gql`
  query HasJoined($request: HasCollectedRequest!) {
    hasCollected(request: $request) {
      results {
        collected
      }
    }
  }
`

interface Props {
  group: BCharityPost
}

const Details: FC<Props> = ({ group }) => {
  const { currentUser } = useContext(AppContext)
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const [joined, setJoined] = useState<boolean>(false)
  const { loading: joinLoading } = useQuery(HAS_JOINED_QUERY, {
    variables: {
      request: {
        collectRequests: {
          publicationIds: group.id,
          walletAddress: currentUser?.ownedBy
        }
      }
    },
    skip: !currentUser || !group,
    onCompleted(data) {
      setJoined(data?.hasCollected[0]?.results[0]?.collected)
      consoleLog(
        'Query',
        '#8b5cf6',
        `Fetched has joined check Group:${group?.id} Joined:${joined}`
      )
    }
  })

  const MetaDetails = ({
    children,
    icon
  }: {
    children: ReactNode
    icon: ReactNode
  }) => (
    <div className="flex gap-2 items-center">
      {icon}
      {children}
    </div>
  )

  return (
    <div className="px-5 mb-4 space-y-5 sm:px-0">
      <div className="relative w-32 h-32 sm:w-72 sm:h-72">
        <img
          src={imagekitURL(
            group?.metadata?.cover?.original?.url
              ? group?.metadata?.cover?.original?.url
              : `https://avatar.tobi.sh/${group?.id}.png`,
            'avatar'
          )}
          className="w-32 h-32 bg-gray-200 rounded-xl ring-2 ring-gray-200 sm:w-72 sm:h-72 dark:bg-gray-700 dark:ring-gray-700/80"
          height={128}
          width={128}
          alt={group?.id}
        />
      </div>
      <div className="pt-1 text-2xl font-bold">
        <div className="truncate">{group?.metadata?.name}</div>
      </div>
      <div className="space-y-5">
        {group?.metadata?.description && (
          <div className="mr-0 leading-7 sm:mr-10 linkify">
            <Markup>{group?.metadata?.description}</Markup>
          </div>
        )}
        <div className="flex items-center space-x-2">
          {joinLoading ? (
            <div className="w-28 rounded-lg h-[34px] shimmer" />
          ) : joined ? (
            <div className="py-0.5 px-2 text-sm text-white rounded-lg shadow-sm bg-brand-500 w-fit">
              Member
            </div>
          ) : (
            <Join group={group} setJoined={setJoined} />
          )}
          {currentUser?.id === group?.profile?.id && (
            <>
              <Button
                variant="secondary"
                className="!py-1.5"
                icon={<PencilAltIcon className="w-5 h-5" />}
                onClick={() => setShowSettingsModal(!showSettingsModal)}
              />
              <Modal
                title="Settings"
                icon={<CogIcon className="w-5 h-5 text-brand" />}
                show={showSettingsModal}
                onClose={() => setShowSettingsModal(!showSettingsModal)}
              >
                <Settings group={group} />
              </Modal>
            </>
          )}
        </div>
        <div className="space-y-2">
          <MetaDetails icon={<HashtagIcon className="w-4 h-4" />}>
            {group?.id}
          </MetaDetails>
          <MetaDetails icon={<UsersIcon className="w-4 h-4" />}>
            <>
              <button
                type="button"
                onClick={() => setShowMembersModal(!showMembersModal)}
              >
                {humanize(group?.stats?.totalAmountOfCollects)}{' '}
                {group?.stats?.totalAmountOfCollects > 1 ? 'members' : 'member'}
              </button>
              <Modal
                title="Members"
                icon={<UsersIcon className="w-5 h-5 text-brand" />}
                show={showMembersModal}
                onClose={() => setShowMembersModal(!showMembersModal)}
              >
                <Collectors pubId={group.id} />
              </Modal>
            </>
          </MetaDetails>
          <MetaDetails icon={<UsersIcon className="w-4 h-4" />}>
            <>
              {humanize(group?.stats?.totalAmountOfComments)}{' '}
              {group?.stats?.totalAmountOfComments > 1 ? 'posts' : 'post'}
            </>
          </MetaDetails>
          <MetaDetails icon={<ClockIcon className="w-4 h-4" />}>
            {dayjs(new Date(group?.createdAt)).fromNow()}
          </MetaDetails>
        </div>
      </div>
    </div>
  )
}

export default Details
