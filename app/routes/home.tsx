import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Outlet } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { Layout } from '~/components/Layout';
import { UserPanel } from '~/components/UserPanel';
import { getOtherUsers } from '~/utils/user.server';

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);
  console.log('users', users);
  return json({ users });
};

export default function Home() {
  const { users } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <Outlet />
      <div className='h-full flex'>
        <UserPanel users={users} />
      </div>
    </Layout>
  );
}
