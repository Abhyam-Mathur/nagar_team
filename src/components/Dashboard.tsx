import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Phone, BarChart3, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface DashboardProps {
  onBack: () => void
  onNavigate: (screen: string) => void
}

const Dashboard = ({ onBack, onNavigate }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-civic-orange-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-civic-saffron/20">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Citizen Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, Nagar Rakshak!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-civic-saffron/20">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-civic-green mx-auto mb-2" />
              <p className="text-2xl font-bold text-civic-green">12</p>
              <p className="text-xs text-muted-foreground">Issues Resolved</p>
            </CardContent>
          </Card>
          
          <Card className="border-civic-green/20">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-civic-saffron mx-auto mb-2" />
              <p className="text-2xl font-bold text-civic-saffron">3</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <Card 
            className="border-2 border-civic-saffron/20 hover:border-civic-saffron/40 transition-colors cursor-pointer transform hover:scale-[1.02] duration-200"
            onClick={() => onNavigate('complaint')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-civic-saffron to-civic-green p-4 rounded-full shadow-civic">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Register New Complaint</h3>
                  <p className="text-sm text-muted-foreground">Report civic issues in your area</p>
                  <Badge variant="outline" className="mt-2 border-civic-saffron text-civic-saffron">
                    Quick Submit
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-civic-green/20 hover:border-civic-green/40 transition-colors cursor-pointer transform hover:scale-[1.02] duration-200"
            onClick={() => onNavigate('tracking')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-civic-green p-4 rounded-full shadow-success">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Track Complaint Status</h3>
                  <p className="text-sm text-muted-foreground">Monitor your reports progress</p>
                  <Badge variant="outline" className="mt-2 border-civic-green text-civic-green">
                    Real-time Updates
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-civic-blue/20 hover:border-civic-blue/40 transition-colors cursor-pointer transform hover:scale-[1.02] duration-200"
            onClick={() => onNavigate('helpline')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-civic-blue p-4 rounded-full">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Emergency Helplines</h3>
                  <p className="text-sm text-muted-foreground">Important contact numbers</p>
                  <Badge variant="outline" className="mt-2 border-civic-blue text-civic-blue">
                    24/7 Available
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-civic-saffron/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-civic-saffron" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-civic-green/5 rounded-lg">
              <div>
                <p className="font-medium">Street Light Fixed</p>
                <p className="text-sm text-muted-foreground">NGR123456 • 2 hours ago</p>
              </div>
              <Badge variant="outline" className="border-civic-green text-civic-green">Resolved</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-civic-saffron/5 rounded-lg">
              <div>
                <p className="font-medium">Pothole Report</p>
                <p className="text-sm text-muted-foreground">NGR123457 • 1 day ago</p>
              </div>
              <Badge variant="outline" className="border-civic-saffron text-civic-saffron">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Appreciation Section */}
        <Card className="bg-gradient-to-r from-civic-saffron/10 to-civic-green/10 border-civic-saffron/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-civic-saffron mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">Community Impact</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your reports have helped improve 5 civic issues this month!
            </p>
            <Badge className="bg-gradient-to-r from-civic-saffron to-civic-green text-white">
              🏆 Active Citizen Badge
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard