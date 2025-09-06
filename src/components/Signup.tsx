// src/components/Signup.tsx

import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignupProps {
  onBack: () => void
  onNavigate: (screen: string) => void
}

const Signup = ({ onBack, onNavigate }: SignupProps) => {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { toast } = useToast()

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid Phone Number", description: "Please enter a 10-digit phone number.", variant: "destructive" })
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`, // Assuming Indian phone numbers
    })
    if (error) {
      toast({ title: "Error sending OTP", description: error.message, variant: "destructive" })
    } else {
      setOtpSent(true)
      toast({ title: "OTP Sent!", description: "Check your phone for the verification code." })
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms",
    })
    if (error) {
      toast({ title: "Error verifying OTP", description: error.message, variant: "destructive" })
    } else if (data.session) {
      onNavigate('dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-orange-light to-background">
      <div className="flex items-center p-4 max-w-md mx-auto">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Citizen Signup / Login</h1>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <Card className="shadow-lg border-civic-saffron/20">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Nagar Rakshak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                  />
                </div>
                <Button onClick={handleSendOtp} disabled={loading} className="w-full" variant="civic">
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    placeholder="Enter the 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <Button onClick={handleVerifyOtp} disabled={loading} className="w-full" variant="civic">
                  <LogIn className="h-4 w-4 mr-2" />
                  {loading ? "Verifying..." : "Verify & Proceed"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Signup