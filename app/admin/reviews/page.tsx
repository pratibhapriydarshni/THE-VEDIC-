export default function AdminReviewsPage() {
  return (
    <main style={{padding:24,fontFamily:'system-ui'}}>
      <h1>Private Reviews</h1>
      <p>Admin-only review management. Connect this screen to the canonical Supabase review API.</p>
      <ul>
        <li>Filter by rating and date</li>
        <li>View booking/customer context</li>
        <li>Archive or restore a review</li>
        <li>Keep customer reviews private</li>
      </ul>
    </main>
  );
}
