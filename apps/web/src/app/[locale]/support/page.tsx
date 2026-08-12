import { LegalPage } from '@/components/LegalPage';

export default function Support({ params }: { params: { locale: string } }) {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'contact@madebyfayde.com';
  return <LegalPage locale={params.locale} title="Support and Safety" intro="We want every interaction on Merror to feel safe, genuine, and understandable.">
    <section><h2>Safety concern</h2><p>Use Report on the relevant reflection or profile so the report contains the context needed for review. Block the account if you want to stop interaction immediately.</p></section>
    <section><h2>Account or privacy help</h2><p>Email <a href={`mailto:${support}`} className="text-accent">{support}</a>. Include your username, but never send your password.</p></section>
    <section><h2>Urgent danger</h2><p>Merror is not an emergency service. If someone may be in immediate danger, contact local emergency services or an appropriate trusted authority.</p></section>
  </LegalPage>;
}
