import { LegalPage } from '@/components/LegalPage';

export default function CommunityGuidelines({ params }: { params: { locale: string } }) {
  return <LegalPage locale={params.locale} title="Community Guidelines" intro="Merror exists to recognize genuine positive impact. These rules protect that purpose.">
    <section><h2>Be sincere and respectful</h2><p>Share truthful reflections about real interactions. Do not harass, shame, threaten, sexualize, impersonate, or expose another person’s private information.</p></section>
    <section><h2>Keep recognition authentic</h2><p>Do not trade, automate, purchase, or coordinate reflections to inflate lumen totals. Repeated or deceptive activity may be limited or removed.</p></section>
    <section><h2>Share only what you have permission to share</h2><p>Only upload words and images you created or have permission to use. Respect requests to keep a moment private.</p></section>
    <section><h2>Report concerns</h2><p>Use the report option on a reflection or profile. Blocking immediately prevents further interaction. We review credible safety reports and may remove content or suspend accounts.</p></section>
  </LegalPage>;
}
