import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Outlet } from '@remix-run/react';
import { Kudo as IKudo, Profile } from '@prisma/client';
import { requireUserId } from '~/utils/auth.server';
import { Layout } from '~/components/Layout';
import { UserPanel } from '~/components/UserPanel';
import { Kudo } from '~/components/Kudo';
import { getOtherUsers } from '~/utils/user.server';
import { getFilteredKudos } from '~/utils/kudos.server';

interface KudoWithProfile extends IKudo {
  author: {
    profile: Profile;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);
  const kudos = await getFilteredKudos(userId, {}, {});
  return json({ users, kudos });
};

export default function Home() {
  const { users, kudos } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <Outlet />
      <div className='h-full flex'>
        <UserPanel users={users} />
        <div className='flex-1 flex flex-col'>
          {/* Search Bar Goes Here */}
          <div className='flex-1 flex'>
            <div className='w-full p-10 flex flex-col gap-y-4'>
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
              ))}
            </div>
            {/* Recent Kudos Goes Here */}
          </div>
        </div>
      </div>
    </Layout>
  );
}
