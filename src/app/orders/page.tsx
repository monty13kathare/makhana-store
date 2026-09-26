import ProfilePage from "../profile/page";

export const metadata = {
  title: "My Orders & Profile",
  description: "Track live shipments, view past receipts, and manage account.",
};

export default function OrdersRoute() {
  return <ProfilePage />;
}
