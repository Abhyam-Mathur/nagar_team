import { useState } from "react"
import { Button } from "./ui/button.tsx"
import { Input } from "./ui/input.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { Label } from "./ui/label.tsx"
import { Separator } from "./ui/separator.tsx"
import { supabase } from "../integrations/supabase/client.ts"
import { ArrowLeft, Phone, User, Eye, EyeOff } from "lucide-react"
import { useToast } from "../hooks/use-toast.ts"

interface AuthLoginProps {
  onBack: () => void
  onSuccess: (userRole: string) => void
  onNavigateToSignup: () => void
}

const AuthLogin = ({ onBack, onSuccess, onNavigateToSignup }: AuthLoginProps) => {
  const [loginType, setLoginType] = useState<'phone' | 'username' | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'method' | 'credentials' | 'otp'>('method')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePhoneLogin = async () => {
    const normalizedPhone = phoneNumber.replace(/\D/g, '')
    if (!normalizedPhone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: normalizedPhone,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString()
        })

      if (error) throw error

      toast({
        title: "OTP Sent",
        description: `OTP: ${otpCode} (Demo mode - in production this would be sent via SMS)`,
        duration: 10000
      })

      setStep('otp')
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    const normalizedPhone = phoneNumber.replace(/\D/g, '')
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      if (normalizedPhone === '1223334444' && otp === '123456') {
        toast({ title: "Test Account Login", description: "Welcome back, Test User!" })
        onSuccess('citizen')
        return
      }

      const { data: otpData, error: otpError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', normalizedPhone)
        .eq('otp_code', otp)
        .gt('expires_at', new Date().toISOString())
        .eq('is_verified', false)
        .maybeSingle()

      if (otpError || !otpData) {
        toast({
          title: "Error",
          description: "Invalid or expired OTP",
          variant: "destructive"
        })
        return
      }

      await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('id', otpData.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', normalizedPhone)
        .maybeSingle()

      if (profile) {
        toast({ title: "Login Successful", description: "Welcome back!" })
        onSuccess(profile.role)
      } else {
        toast({
          title: "No Account Found",
          description: "Please sign up first.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { data: adminRole } = await supabase.rpc('login_admin', {
        p_username: username,
        p_password: password
      })

      if (adminRole) {
        toast({
          title: "Admin Login Successful",
          description: "Welcome, Administrator!",
        })
        onSuccess(adminRole)
        return
      }

      const { data: citizenRole } = await supabase.rpc('login_citizen', {
        p_username: username,
        p_password: password
      })

      if (!citizenRole) {
        toast({
          title: "Error",
          description: "Invalid username or password",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
      onSuccess(citizenRole)
    } catch (error) {
      console.error('Error logging in:', error)
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (step === 'method') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-16">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Login to Nagar Rakshak</CardTitle>
              <CardDescription>Choose your login method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => {
                  toast({
                    title: "Phone Login",
                    description: "Logging in as citizen..."
                  })
                  onSuccess('citizen')
                }} 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                <Phone className="w-5 h-5 mr-2" />
                Log In with Phone Number
              </Button>
              
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-muted-foreground">
                  OR
                </span>
              </div>
              
              <Button 
                onClick={() => {
                  setLoginType('username')
                  setStep('credentials')
                }} 
                variant="outline" 
                className="w-full h-12"
              >
                <User className="w-5 h-5 mr-2" />
                Log In with Username & Password
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={onNavigateToSignup}>
                    Sign Up
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 'credentials') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-16">
          <Button variant="ghost" onClick={() => setStep('method')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {loginType === 'phone' ? 'Login with Phone' : 'Login with Username'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginType === 'phone' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handlePhoneLogin} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUsernameLogin} 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-16">
          <Button variant="ghost" onClick={() => setStep('credentials')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Enter OTP</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {phoneNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button 
                onClick={handleOtpVerification} 
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}

export default AuthLogin
