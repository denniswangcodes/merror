import { LegalPage } from '@/components/LegalPage';

export default function Terms({ params }: { params: { locale: string } }) {
  return <LegalPage locale={params.locale} title="Terms of Service" intro="Effective August 10, 2026. Merror is operated by Fayde LLC. By using Merror, you agree to these terms and the Community Guidelines.">
    <section><h2>Your account</h2><p>Provide accurate information, protect your credentials, and use only accounts you are authorized to control. You are responsible for activity performed through your account.</p></section>
    <section><h2>Your content</h2><p>You retain ownership of content you submit and grant Merror the limited permission needed to host, display, moderate, and operate it according to your visibility choices.</p></section>
    <section><h2>Prohibited conduct</h2><p>Do not abuse others, manipulate lumens, scrape personal information, disrupt the service, upload unlawful content, or violate another person’s privacy or intellectual-property rights.</p></section>
    <section><h2>Moderation and availability</h2><p>We may limit reach, remove content, or suspend accounts to protect users and the integrity of the service. Alpha features may change, and the service is provided without a guarantee of uninterrupted availability.</p></section>
  </LegalPage>;
}
