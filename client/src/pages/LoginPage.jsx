import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../lib/validations'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ROLE_LABELS } from '@/lib/constants'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Shield, Crown, User } from 'lucide-react'

const testAccounts = [
  { email: 'admin@test.com', password: 'Password#123', role: ROLE_LABELS.admin, icon: Shield },
  { email: 'owner@test.com', password: 'Password#123', role: ROLE_LABELS.owner, icon: Crown },
  { email: 'user@test.com', password: 'Password#123', role: ROLE_LABELS.user, icon: User },
]

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const doLogin = async (email, password) => {
    setLoading(true)
    setServerError('')
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}`)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (data) => doLogin(data.email, data.password)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Branding */}
        <div className="text-center space-y-1">
          <div className="flex justify-center">
            <img
              src="/icon.webp"
              alt="Meeting Room"
              className="h-12 w-12"
            />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Meeting Room</h1>
          <p className="text-sm text-slate-500">Booking Management System</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-base">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    className="pr-10"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login */}
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm">Test Accounts</CardTitle>
            <CardDescription className="text-xs">
              Password: Password#123
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Separator className="mb-3" />
            {testAccounts.map((account) => {
              const Icon = account.icon
              return (
                <Button
                  key={account.email}
                  variant="outline"
                  className="w-full justify-between h-9"
                  onClick={() => doLogin(account.email, account.password)}
                  disabled={loading}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={14} />
                    {account.role}
                  </span>
                  <span className="text-xs text-slate-400">{account.email}</span>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
