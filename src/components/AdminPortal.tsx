import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"
import { Textarea } from "./ui/textarea.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { ArrowLeft, BarChart3, MapPin, Users, Clock, CheckCircle, AlertTriangle, Filter, User } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "../integrations/supabase/client.ts"
import { useToast } from "../hooks/use-toast.ts"

interface AdminPortalProps {
  onBack: () => void
}

const AdminPortal = ({ onBack }: AdminPortalProps) => {
  const [complaints, setComplaints] = useState<any[]>([])
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [workerName, setWorkerName] = useState("")
  const [workerContact, setWorkerContact] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchComplaints()
    fetchStats()
    
    const channel = supabase
      .channel('admin-complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchComplaints()
        fetchStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setComplaints(data || [])
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast({ title: "Error fetching complaints", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('status')

      if (error) throw error
      
      const stats = data?.reduce((acc, complaint) => {
        const status = complaint.status?.toLowerCase()
        if (status === 'registered') acc.pending++
        else if (status === 'assigned' || status === 'in-progress') acc.inProgress++
        else if (status === 'resolved') acc.resolved++
        acc.total++
        return acc
      }, { pending: 0, inProgress: 0, resolved: 0, total: 0 }) || { pending: 0, inProgress: 0, resolved: 0, total: 0 }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleAssignWorker = async () => {
    if (!selectedComplaint || !workerName || !workerContact || !newStatus) {
      toast({ title: "Please fill all fields", variant: "destructive" })
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('complaints')
        .update({ 
          status: newStatus as any,
          assigned_to: workerName 
        })
        .eq('id', selectedComplaint.id)

      if (updateError) throw updateError

      const { error: statusError } = await supabase
        .from('complaint_status_updates')
        .insert({
          complaint_id: selectedComplaint.id,
          status: newStatus as any,
          assigned_to: workerName,
          assigned_contact: workerContact,
          note: statusNote
        })

      if (statusError) throw statusError

      toast({ 
        title: "Worker Assigned Successfully",
        description: `${workerName} has been assigned to complaint ${selectedComplaint.complaint_code}`
      })
      
      setAssignDialogOpen(false)
      // Reset form state
      setWorkerName("")
      setWorkerContact("")
      setStatusNote("")
      setNewStatus("")
      setSelectedComplaint(null)

    } catch (error) {
      console.error('Error assigning worker:', error)
      toast({ title: "Error assigning worker", variant: "destructive" })
    }
  }

  const openAssignDialog = (complaint: any) => {
    setSelectedComplaint(complaint)
    setNewStatus(complaint.status || "")
    setWorkerName(complaint.assigned_to || "")
    setAssignDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'registered': return 'bg-civic-saffron/20 text-civic-saffron'
      case 'assigned': return 'bg-civic-blue/20 text-civic-blue'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700'
      case 'resolved': return 'bg-civic-green/20 text-civic-green'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-civic-blue/10 to-background">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-civic-blue/20">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Municipal Corporation Portal</p>
              </div>
            </div>
            <Badge className="bg-civic-blue text-white">
              Government Official
            </Badge>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-civic-saffron/20">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-civic-saffron mx-auto mb-2" />
                <p className="text-2xl font-bold text-civic-saffron">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>

            <Card className="border-civic-green/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-civic-green mx-auto mb-2" />
                <p className="text-2xl font-bold text-civic-green">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </CardContent>
            </Card>

            <Card className="border-civic-blue/20">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-civic-blue mx-auto mb-2" />
                <p className="text-2xl font-bold text-civic-blue">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Complaints</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-civic-saffron/20">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-civic-saffron mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Live Complaint Map</h3>
                <p className="text-sm text-muted-foreground">View complaints on GIS map</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-civic-green/20">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-civic-green mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">Performance metrics</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-civic-blue/20">
              <CardContent className="p-6 text-center">
                <Filter className="h-12 w-12 text-civic-blue mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Advanced Filters</h3>
                <p className="text-sm text-muted-foreground">Filter by type, location</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Complaints */}
          <Card className="border-civic-saffron/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Complaints</span>
                <Button variant="outline" size="sm" className="border-civic-saffron text-civic-saffron">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading complaints...</div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No complaints found</div>
                ) : (
                  complaints.map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{complaint.issue_type || 'General Issue'}</h4>
                          <Badge variant="outline" className="text-xs">{complaint.complaint_code}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {complaint.city}, {complaint.state}
                          </span>
                          <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          {complaint.assigned_to && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {complaint.assigned_to}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAssignDialog(complaint)}
                          disabled={complaint.status === 'Resolved'}
                        >
                          Assign Worker
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Worker to Complaint</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In-Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="worker-name">Worker Name</Label>
                <Input 
                  id="worker-name"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="Enter worker name"
                />
              </div>
              
              <div>
                <Label htmlFor="worker-contact">Worker Contact Number</Label>
                <Input 
                  id="worker-contact"
                  value={workerContact}
                  onChange={(e) => setWorkerContact(e.target.value)}
                  placeholder="Enter contact number"
                  type="tel"
                />
              </div>
              
              <div>
                <Label htmlFor="status-note">Note (Optional)</Label>
                <Textarea 
                  id="status-note"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add any additional notes"
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleAssignWorker}
                className="w-full bg-civic-green hover:bg-civic-green/90"
              >
                Assign Worker
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminPortal

