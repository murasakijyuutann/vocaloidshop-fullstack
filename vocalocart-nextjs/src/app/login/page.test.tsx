// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { SignInResponse } from 'next-auth/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import messages from '../../../messages/en.json'
import LoginPage from './page'

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('next-auth/react', () => ({ signIn: mocks.signIn }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}))
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }))

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

function submitLogin() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LoginPage />
    </NextIntlClientProvider>
  )
  fireEvent.change(screen.getByPlaceholderText(messages.Login.emailPlaceholder), {
    target: { value: 'admin@example.com' },
  })
  fireEvent.change(screen.getByPlaceholderText('••••••••'), {
    target: { value: 'wrong-password' },
  })
  fireEvent.click(screen.getByRole('button', { name: messages.Login.signIn }))
}

describe('login sign-in result', () => {
  it.each([
    // e0b4bc8 regression: HTTP success does not mean authentication succeeded.
    { error: 'CredentialsSignin', code: 'credentials', ok: true, status: 200, url: null },
    { error: 'CredentialsSignin', code: 'credentials', ok: false, status: 401, url: null },
    undefined,
  ])('stops loading and shows an error without navigating for %j', async result => {
    let finish!: (value: SignInResponse | undefined) => void
    mocks.signIn.mockReturnValue(new Promise(resolve => { finish = resolve }))

    submitLogin()
    expect(mocks.signIn).toHaveBeenCalledExactlyOnceWith('credentials', {
      email: 'admin@example.com', password: 'wrong-password', redirect: false,
    })
    expect(screen.getByRole<HTMLButtonElement>('button', {
      name: messages.Login.signingIn,
    }).disabled).toBe(true)

    await act(async () => { finish(result) })

    expect(screen.getByRole<HTMLButtonElement>('button', {
      name: messages.Login.signIn,
    }).disabled).toBe(false)
    expect(screen.queryByText(messages.Login.signingIn)).toBeNull()
    expect(screen.getByText(messages.Login.invalidCredentials)).toBeTruthy()
    expect(mocks.error).toHaveBeenCalledExactlyOnceWith(messages.Login.invalidCredentials)
    expect(mocks.success).not.toHaveBeenCalled()
    expect(mocks.push).not.toHaveBeenCalled()
    expect(mocks.refresh).not.toHaveBeenCalled()
  })

  it('still navigates after a successful sign-in', async () => {
    mocks.signIn.mockResolvedValue({ error: undefined, ok: true, status: 200, url: '/' })
    submitLogin()
    await waitFor(() => expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/'))

    expect(mocks.success).toHaveBeenCalledExactlyOnceWith(messages.Login.welcomeBackToast)
    expect(mocks.error).not.toHaveBeenCalled()
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/')
    expect(mocks.refresh).toHaveBeenCalledOnce()
    expect(screen.getByRole<HTMLButtonElement>('button', {
      name: messages.Login.signIn,
    }).disabled).toBe(false)
  })
})
