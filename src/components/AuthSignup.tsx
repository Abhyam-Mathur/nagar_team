import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx"
import { ArrowLeft, Phone } from "lucide-react"
import { useToast } from "../hooks/use-toast.ts"

interface AuthSignupProps {
  onBack: () => void
  onSuccess: (userRole: string) => void
}

const AuthSignup = ({ onBack, onSuccess }: AuthSignupProps) => {
  const { toast } = useToast()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-16">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join Nagar Rakshak as a citizen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => {
                toast({
                  title: "Account Created",
                  description: "Welcome to Nagar Rakshak!"
                })
                onSuccess('citizen')
              }} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Create Citizen Account
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our terms and conditions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuthSignup
