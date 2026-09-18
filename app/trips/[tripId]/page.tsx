import TripItineraryPage from "../page";

interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function DynamicTripPage({ params }: PageProps) {
  const { tripId } = await params;
  return <TripItineraryPage tripId={tripId} />;
}
