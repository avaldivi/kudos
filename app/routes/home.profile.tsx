import { useState } from 'react';
import {
  LoaderFunction,
  ActionFunction,
  redirect,
  json,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Department } from '@prisma/client';
import { Modal } from '~/components/Modal';
import { FormField } from '~/components/FormField';
import { SelectBox } from '~/components/SelectBox';
import { ImageUploader } from '~/components/ImageUploader';
import { departments } from '~/utils/constants';
import { getUser, requireUserId } from '~/utils/auth.server';
import { validateName } from '~/utils/validators.server';
import { updateUser } from '~/utils/user.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const userId = await requireUserId(request);
  let firstName = form.get('firstName');
  let lastName = form.get('lastName');
  let department = form.get('department');

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof department !== 'string'
  ) {
    return json({ error: `Invalid Form Data` }, { status: 400 });
  }

  const errors = {
    firstName: validateName(firstName),
    lastName: validateName(lastName),
    department: validateName(department),
  };

  if (Object.values(errors).some(Boolean))
    return json(
      { errors, fields: { department, firstName, lastName } },
      { status: 400 }
    );

  await updateUser(userId, {
    firstName,
    lastName,
    department: department as Department,
  });

  return redirect('/home');
};

export default function ProfileSettings() {
  const { user } = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName,
    lastName: user?.profile?.lastName,
    department: user?.profile?.department || 'MARKETING',
    profilePicture: user?.profile?.profilePicture || '',
  });

  const handleFileUpload = async (file: File) => {
    let inputFormData = new FormData();
    inputFormData.append('profile-pic', file);
    const response = await fetch('/avatar', {
      method: 'POST',
      body: inputFormData,
    });
    const { imageUrl } = await response.json();
    setFormData({
      ...formData,
      profilePicture: imageUrl,
    });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  return (
    <Modal isOpen={true} className='w-1/3'>
      <div className='p-3'>
        <h2 className='text-4xl font-semibold text-blue-600 text-center mb-4'>
          <div className='flex'>
            <div className='w-1/3'>
              <ImageUploader
                onChange={handleFileUpload}
                imageUrl={formData.profilePicture || ''}
              />
            </div>
            <div className='flex-1'>
              <form method='post' encType='multipart/form-data'>
                <FormField
                  placeholder='First Name'
                  htmlFor='firstName'
                  label='First Name'
                  value={formData.firstName}
                  onChange={(e) => handleInputChange(e, 'firstName')}
                />
                <FormField
                  placeholder='Last Name'
                  htmlFor='lastName'
                  label='Last Name'
                  value={formData.lastName}
                  onChange={(e) => handleInputChange(e, 'lastName')}
                />
                <SelectBox
                  className='w-full rounded-xl px-3 py-2 text-gray-400'
                  id='department'
                  label='Department'
                  name='department'
                  options={departments}
                  value={formData.department}
                  onChange={(e) => handleInputChange(e, 'department')}
                />
                <div className='w-full text-right mt-4'>
                  <button className='rounded-xl bg-yellow-300 font-semibold text-blue-600 px-16 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1'>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </h2>
      </div>
    </Modal>
  );
}
