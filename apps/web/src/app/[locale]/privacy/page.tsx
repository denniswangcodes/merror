import { LegalPage } from '@/components/LegalPage';

export default function Privacy({ params }: { params: { locale: string } }) {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@merror.app';
  return <LegalPage locale={params.locale} title="Privacy Policy" intro="Effective August 10, 2026. This alpha policy explains the information Merror uses to provide the service.">
    <section><h2>Information we collect</h2><p>We process account details, profile information, friendships, reflections, uploaded image URLs, moderation reports, and basic technical records needed for security and reliability.</p></section>
    <section><h2>How we use it</h2><p>We use this information to authenticate you, deliver requested social features, calculate verified lumens, prevent abuse, respond to reports, and operate the service. We do not sell personal information or sell lumens.</p></section>
    <section><h2>Visibility and choices</h2><p>Public reflections can appear in the community feed. Private reflections remain outside the public feed. You can block users, report concerns, edit your profile, and permanently delete your account in the app.</p></section>
    <section><h2>Retention and deletion</h2><p>We retain information while your account is active and as needed for safety or legal obligations. Account deletion removes your account and associated user-generated content, except limited records we are legally required to preserve.</p></section>
    <section><h2>Contact</h2><p>Privacy questions and requests can be sent to <a href={`mailto:${support}`} className="text-accent">{support}</a>.</p></section>
  </LegalPage>;
}
