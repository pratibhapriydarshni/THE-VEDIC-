import ConsultationRoom from '@/components/consultation-room';
export default async function Consultation({params}:{params:Promise<{bookingId:string}>}){const {bookingId}=await params;return <ConsultationRoom bookingId={bookingId} accessToken="CLIENT_SESSION_REQUIRED"/>}
