import { useState } from 'react';
import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Layout } from '~/components/Layout';
import { Form, useActionData } from '@remix-run/react';
import { FormField } from '~/components/FormField';
import {
  validateEmail,
  validatePassword,
  validateName,
} from '~/utils/validators.server';
import { login, register } from '~/utils/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userInfo = Object.fromEntries(formData);
  console.log({ userInfo });
  const { email, password, firstName, lastName, _action: action } = userInfo;

  if (
    typeof action !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  if (
    action === 'register' &&
    (typeof firstName !== 'string' || typeof lastName !== 'string')
  ) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  const errors = {
    email: validateEmail(email as string),
    password: validatePassword(password as string),
    ...(action === 'register'
      ? {
          firstName: validateName((firstName as string) || ''),
          lastName: validateName((lastName as string) || ''),
        }
      : {}),
  };

  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
        form: action,
      },
      { status: 400 }
    );

  switch (action) {
    case 'login': {
      return await login({ email, password });
    }
    case 'register': {
      const userFirstName = firstName as string;
      const userLastName = lastName as string;
      return await register({
        email,
        password,
        firstName: userFirstName,
        lastName: userLastName,
      });
    }
    default:
      return json({ error: `Invalid Form Data` }, { status: 400 });
  }
}

export default function Login() {
  const [action, setAction] = useState('login');
  const data = useActionData<typeof action>();
  console.log('data:', data);

  return (
    <Layout>
      <div className='h-full justify-center items-center flex flex-col gap-y-4'>
        <button
          onClick={() => setAction(action == 'login' ? 'register' : 'login')}
          className='absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1'
        >
          {action === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
        <h2 className='text-5xl font-extrabold text-yellow-300'>
          Welcome to Kudos!
        </h2>
        <p className='font-semibold text-slate-300'>
          {action === 'login'
            ? 'Log In To Give Some Praise!'
            : 'Sign Up To Get Started!'}
        </p>

        <Form method='post' className='rounded-2xl bg-gray-200 p-6 w-96'>
          <FormField
            htmlFor='email'
            label='Email'
            placeholder='username@kudos.com'
          />
          <FormField
            htmlFor='password'
            type='password'
            label='Password'
            placeholder='secret password'
          />
          {action === 'register' && (
            <>
              <FormField
                htmlFor='firstName'
                label='First Name'
                placeholder='First Name'
              />
              <FormField
                htmlFor='lastName'
                label='Last Name'
                placeholder='Last Name'
              />
            </>
          )}
          <div className='w-full text-center'>
            <button
              type='submit'
              name='_action'
              value={action}
              className='rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1'
            >
              {action === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </Form>
      </div>
    </Layout>
  );
}
