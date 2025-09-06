import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Phone, Search, Shield, Zap, Droplets, Car, AlertTriangle } from "lucide-react"

interface HelplineNumbersProps {
  onBack: () => void
}

const HelplineNumbers = ({ onBack }: HelplineNumbersProps) => {
  const [searchTerm, setSearchTerm] = useState("")

  const helplines = [
    {
      category: "Emergency Services",
      icon: Shield,
      color: "text-red-600 bg-red-100",
      numbers: [
        { name: "Police Emergency", number: "100", description: "24/7 Police assistance" },
        { name: "Fire Brigade", number: "101", description: "Fire emergency & rescue" },
        { name: "Ambulance/Medical", number: "108", description: "Medical emergency services" },
        { name: "Disaster Management", number: "1070", description: "Natural disaster helpline" }
      ]
    },
    {
      category: "Municipal Services", 
      icon: Car,
      color: "text-civic-saffron bg-civic-saffron/10",
      numbers: [
        { name: "Municipal Corporation", number: "1533", description: "General civic complaints" },
        { name: "Water Supply", number: "1916", description: "Water related issues" },
        { name: "Electricity Board", number: "1912", description: "Power outage complaints" },
        { name: "Gas Emergency", number: "1906", description: "LPG/PNG gas leaks" }
      ]
    },
    {
      category: "Public Utilities",
      icon: Zap,
      color: "text-civic-green bg-civic-green/10", 
      numbers: [
        { name: "Railway Enquiry", number: "139", description: "Train schedules & bookings" },
        { name: "Road Transport", number: "1073", description: "Bus services & routes" },
        { name: "Tourist Helpline", number: "1363", description: "Tourism assistance" },
        { name: "Consumer Forum", number: "1800-11-4000", description: "Consumer complaints" }
      ]
    },
    {
      category: "Health & Social",
      icon: Droplets,
      color: "text-civic-blue bg-civic-blue/10",
      numbers: [
        { name: "Child Helpline", number: "1098", description: "Child safety & welfare" },
        { name: "Women Helpline", number: "181", description: "Women safety & support" },
        { name: "Senior Citizen", number: "14567", description: "Elderly care services" },
        { name: "Anti-Corruption", number: "1031", description: "Report corruption" }
      ]
    }
  ]

  const filteredHelplines = helplines.map(category => ({
    ...category,
    numbers: category.numbers.filter(
      helpline => 
        helpline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helpline.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helpline.number.includes(searchTerm)
    )
  })).filter(category => category.numbers.length > 0)

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-blue/10 to-background">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-civic-blue/20">
        <div className="flex items-center p-4 max-w-md mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Emergency Helplines</h1>
            <p className="text-sm text-muted-foreground">24/7 support services</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        {/* Search */}
        <Card className="border-civic-blue/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search helplines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Alert */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Emergency?</h3>
                <p className="text-sm text-red-700">Call 112 for immediate assistance</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleCall('112')}
              >
                Call 112
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Helpline Categories */}
        {filteredHelplines.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="border-civic-saffron/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${category.color}`}>
                  <category.icon className="h-5 w-5" />
                </div>
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.numbers.map((helpline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{helpline.name}</h4>
                    <p className="text-xs text-muted-foreground">{helpline.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {helpline.number}
                    </Badge>
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={() => handleCall(helpline.number)}
                      className="bg-civic-green hover:bg-civic-green/90"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* No Results */}
        {searchTerm && filteredHelplines.length === 0 && (
          <Card className="border-civic-saffron/20">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try searching with different keywords
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Footer */}
        <Card className="border-civic-saffron/20 bg-civic-saffron/5">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-civic-saffron mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Important Note</h3>
            <p className="text-sm text-muted-foreground">
              All emergency numbers are toll-free and available 24/7. 
              Keep this list handy for quick access.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HelplineNumbers