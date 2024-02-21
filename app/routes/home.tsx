import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Outlet } from '@remix-run/react';
import { Prisma, Kudo as IKudo, Profile } from '@prisma/client';
import { requireUserId } from '~/utils/auth.server';
import { Layout } from '~/components/Layout';
import { UserPanel } from '~/components/UserPanel';
import { Kudo } from '~/components/Kudo';
import { SearchBar } from '~/components/SearchBar';
import { RecentPanel } from '~/components/RecentPanel';
import { getOtherUsers } from '~/utils/user.server';
import { getFilteredKudos, getRecentKudos } from '~/utils/kudos.server';

interface KudoWithProfile extends IKudo {
  author: {
    profile: Profile;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);

  const url = new URL(request.url);
  const sort = url.searchParams.get('sort');
  const filter = url.searchParams.get('filter');

  let sortOptions: Prisma.KudoOrderByWithRelationInput = {};
  if (sort) {
    if (sort === 'date') {
      sortOptions = { createdAt: 'desc' };
    }
    if (sort === 'sender') {
      sortOptions = { author: { profile: { firstName: 'asc' } } };
    }
    if (sort === 'emoji') {
      sortOptions = { style: { emoji: 'asc' } };
    }
  }

  let textFilter: Prisma.KudoWhereInput = {};
  if (filter) {
    textFilter = {
      OR: [
        { message: { mode: 'insensitive', contains: filter } },
        {
          author: {
            OR: [
              {
                profile: {
                  is: { firstName: { mode: 'insensitive', contains: filter } },
                },
              },
              {
                profile: {
                  is: { lastName: { mode: 'insensitive', contains: filter } },
                },
              },
            ],
          },
        },
      ],
    };
  }

  const kudos = await getFilteredKudos(userId, sortOptions, textFilter);
  const recentKudos = await getRecentKudos();
  return json({ users, kudos, recentKudos });
};

export default function Home() {
  const { users, kudos, recentKudos } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <Outlet />
      <div className='h-full flex'>
        <UserPanel users={users} />
        <div className='flex-1 flex flex-col'>
          <SearchBar />
          <div className='flex-1 flex'>
            <div className='w-full p-10 flex flex-col gap-y-4'>
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
              ))}
            </div>
            <RecentPanel kudos={recentKudos} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
