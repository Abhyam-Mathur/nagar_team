import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LatLngExpression } from 'leaflet';

const ComplaintMap = () => {
  const [complaints, setComplaints] = useState<Tables<'complaints'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaintLocations = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('complaints')
          .select('id, complaint_code, issue_type, status, gps_latitude, gps_longitude')
          .not('gps_latitude', 'is', null)
          .not('gps_longitude', 'is', null);

        if (error) throw error;
        setComplaints(data || []);
      } catch (error) {
        console.error("Error fetching complaint locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintLocations();
  }, []);

  if (loading) {
    return <Skeleton className="h-[60vh] w-full rounded-md" />;
  }
  
  // Default center of the map (India)
  const defaultCenter: LatLngExpression = [20.5937, 78.9629];

  return (
    <MapContainer center={defaultCenter} zoom={5} style={{ height: '60vh', width: '100%', borderRadius: '0.5rem' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {complaints.map(complaint => {
        // Ensure both latitude and longitude are not null before rendering the marker
        if (complaint.gps_latitude && complaint.gps_longitude) {
          const position: LatLngExpression = [complaint.gps_latitude, complaint.gps_longitude];
          return (
            <Marker key={complaint.id} position={position}>
              <Popup>
                <div>
                  <h4 className="font-bold">{complaint.issue_type}</h4>
                  <p>ID: <Badge variant="outline">{complaint.complaint_code}</Badge></p>
                  <p>Status: <Badge>{complaint.status}</Badge></p>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null; // Don't render a marker if coordinates are missing
      })}
    </MapContainer>
  );
};

export default ComplaintMap;
