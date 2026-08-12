import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, Heart, HandHeart, Infinity as InfinityIcon, MessageCircle, Play, Send, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const reflections = [
  { icon: Heart, label: 'Kind Word', color: 'bg-blue-50 text-blue-700 border-blue-100', copy: 'For the words that changed someone’s day.' },
  { icon: HandHeart, label: 'Helping Hand', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', copy: 'For showing up when it mattered most.' },
  { icon: Sparkles, label: 'Shared Moment', color: 'bg-violet-50 text-violet-700 border-violet-100', copy: 'For the memories worth holding onto.' },
];

export default function LandingPage(): JSX.Element {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdfb] text-[#1d1b20]">
      <nav className="relative z-40 flex h-[76px] w-full items-center justify-between px-5 sm:px-8">
        <Link href="/" className="no-underline"><Logo size={34} wordmarkClassName="brand-gradient-text" /></Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/en/login" className="rounded-full px-4 py-2.5 text-sm font-bold text-[#49454f] no-underline transition hover:bg-black/[0.04]">Sign in</Link>
          <Link href="/en/signup" className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-bold text-white no-underline shadow-[0_8px_24px_rgba(190,91,142,0.24)] transition hover:-translate-y-0.5">Sign up</Link>
        </div>
      </nav>

      <section className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:gap-16 lg:pb-24 lg:pt-12">
        <div className="pointer-events-none absolute left-[-20rem] top-[-10rem] h-[38rem] w-[38rem] rounded-full bg-violet-300/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-16rem] top-[3rem] h-[34rem] w-[34rem] rounded-full bg-orange-200/30 blur-[110px]" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e9dce5] bg-white/80 px-3.5 py-2 text-xs font-extrabold text-[#8f3f6c] shadow-sm backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> Kindness finally has a streak</div>
          <h1 className="m-0 font-display text-[clamp(3.2rem,7.4vw,6.8rem)] font-black leading-[0.9] tracking-[-0.065em] text-[#201c22]">Make good<br /><span className="brand-gradient-text">impossible</span><br />to overlook.</h1>
          <p className="mb-0 mt-7 max-w-xl text-lg font-medium leading-8 text-[#625d66] sm:text-xl">Merror turns real acts of kindness into reflections people can keep, share, and build on—so doing good feels as rewarding as it should.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/en/signup" className="brand-gradient-bg group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-extrabold text-white no-underline shadow-[0_16px_38px_rgba(109,91,255,0.2)] transition hover:-translate-y-1">Start your good streak <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#ded8df] bg-white px-6 py-4 text-[15px] font-extrabold text-[#403b43] no-underline transition hover:border-[#c7bec8]"><Play className="h-4 w-4 fill-current" /> See how it works</a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#77717a]"><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Free to reflect</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Human-verified impact</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Lumens never expire</span></div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[530px] lg:justify-self-end">
          <div className="absolute -left-8 top-24 hidden rotate-[-8deg] rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-[0_20px_50px_rgba(36,25,39,.12)] backdrop-blur sm:block"><p className="m-0 text-[10px] font-black uppercase tracking-[.14em] text-[#99919a]">Impact unlocked</p><p className="m-0 mt-1 flex items-center gap-2 text-sm font-black"><Trophy className="h-4 w-4 text-amber-500" /> Beacon level</p></div>
          <div className="absolute -right-5 bottom-24 z-20 hidden rotate-[6deg] rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-[0_20px_50px_rgba(36,25,39,.12)] backdrop-blur sm:block"><p className="m-0 flex items-center gap-2 text-sm font-black"><Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> Reflection received</p><p className="m-0 mt-1 text-xs font-semibold text-[#807780]">Your good deed mattered.</p></div>
          <div className="relative mx-auto w-[min(100%,365px)] rounded-[3rem] border-[8px] border-[#262229] bg-[#262229] p-1.5 shadow-[0_38px_90px_rgba(49,33,52,.24)]">
            <div className="absolute left-1/2 top-3 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-[#262229]" />
            <div className="overflow-hidden rounded-[2.35rem] bg-[#f8f6f7]">
              <div className="flex items-center justify-between bg-white px-5 pb-3 pt-10"><Logo size={25} /><div className="flex gap-2"><div className="h-7 w-7 rounded-full bg-[#f1edf1]" /><div className="h-7 w-7 rounded-full bg-[#f1edf1]" /></div></div>
              <div className="p-3"><div className="overflow-hidden rounded-[1.35rem] border border-[#e7e0e6] bg-white shadow-sm">
                <div className="flex items-center gap-2 px-3 py-3"><div className="brand-gradient-bg grid h-8 w-8 place-items-center rounded-full text-[10px] font-black text-white">MJ</div><div><p className="m-0 text-xs font-black">Maya reflected on Jordan</p><p className="m-0 text-[9px] font-semibold text-[#99919a]">A moment worth remembering</p></div></div>
                <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(145deg,#473a78_0%,#bc638e_48%,#ff9d72_100%)]"><div className="absolute -left-10 top-20 h-40 w-40 rounded-full bg-white/20 blur-2xl" /><div className="absolute bottom-6 right-[-2rem] h-44 w-44 rounded-full bg-orange-100/25 blur-2xl" /><div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-black/20 p-4 text-white backdrop-blur-md"><Sparkles className="mb-2 h-5 w-5" /><p className="m-0 text-lg font-black leading-6">“You stayed late to help everyone finish. That changed the whole night.”</p></div></div>
                <div className="flex items-center gap-4 px-4 py-3 text-[#342f36]"><Heart className="h-5 w-5 fill-rose-500 text-rose-500" /><MessageCircle className="h-5 w-5" /><Send className="h-5 w-5" /><span className="ml-auto rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black text-violet-700">SHARED MOMENT</span></div>
                <div className="px-4 pb-4"><p className="m-0 text-xs font-black">24 people felt this</p><p className="m-0 mt-1 text-[10px] font-medium text-[#827a83]">Jordan approved this reflection · +1 lumen</p></div>
              </div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#eee8ed] bg-white/80 py-8 backdrop-blur"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 text-center sm:flex-row sm:text-left"><p className="m-0 max-w-xl font-display text-xl font-black tracking-tight sm:text-2xl">Not points for popularity. <span className="text-[#8b818b]">Proof that you mattered.</span></p><div className="flex items-center gap-7"><div><p className="m-0 text-2xl font-black">1</p><p className="m-0 text-[10px] font-bold uppercase tracking-wider text-[#8b838c]">approved act</p></div><ChevronRight className="h-5 w-5 text-[#bbb2bc]" /><div><p className="m-0 text-2xl font-black brand-gradient-text">1 lumen</p><p className="m-0 text-[10px] font-bold uppercase tracking-wider text-[#8b838c]">lasting impact</p></div></div></div></section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center"><p className="mb-3 text-xs font-black uppercase tracking-[.2em] text-[#a34e7b]">The kindness loop</p><h2 className="m-0 font-display text-4xl font-black tracking-[-.04em] sm:text-6xl">See good. Name it.<br />Watch it multiply.</h2><p className="mx-auto mb-0 mt-5 max-w-2xl text-lg leading-8 text-[#716a73]">Social apps count attention. Merror counts the moments that make people and communities better.</p></div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">{[
          { n: '01', icon: Heart, title: 'Notice the good', copy: 'Capture a kind word, helping hand, shared memory, or act of community care.' },
          { n: '02', icon: ShieldCheck, title: 'Make it real', copy: 'The person receiving it approves the reflection, keeping recognition human and meaningful.' },
          { n: '03', icon: Trophy, title: 'Let impact grow', copy: 'Approved reflections earn lumens and build a lasting record of the good you put into the world.' },
        ].map(({ n, icon: Icon, title, copy }) => <div key={n} className="group rounded-[2rem] border border-[#e9e2e8] bg-white p-7 shadow-[0_10px_35px_rgba(50,35,52,.05)] transition hover:-translate-y-1.5"><div className="flex items-center justify-between"><div className="brand-gradient-bg grid h-12 w-12 place-items-center rounded-2xl text-white"><Icon className="h-5 w-5" /></div><span className="font-display text-3xl font-black text-[#ede7ec]">{n}</span></div><h3 className="mb-0 mt-8 text-xl font-black">{title}</h3><p className="mb-0 mt-3 text-sm leading-6 text-[#777078]">{copy}</p></div>)}</div>
      </section>

      <section className="relative overflow-hidden bg-[#242127] py-24 text-white lg:py-32"><div className="pointer-events-none absolute -left-40 top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-violet-500/25 blur-[120px]" /><div className="pointer-events-none absolute -right-40 bottom-[-12rem] h-[30rem] w-[30rem] rounded-full bg-rose-400/20 blur-[120px]" /><div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2"><div><p className="mb-3 text-xs font-black uppercase tracking-[.2em] text-[#efa1c2]">Every kind of good counts</p><h2 className="m-0 font-display text-4xl font-black tracking-[-.04em] sm:text-6xl">Small moments.<br />Visible momentum.</h2><p className="mb-0 mt-5 max-w-xl text-lg leading-8 text-white/65">Recognition changes what a community pays attention to. Make generosity, courage, care, and contribution the things people want to collect.</p><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-bold"><Users className="mr-2 inline h-3.5 w-3.5" />Friends</span><span className="rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-bold"><Trophy className="mr-2 inline h-3.5 w-3.5" />Levels</span><span className="rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-bold"><InfinityIcon className="mr-2 inline h-3.5 w-3.5" />Lasting history</span></div></div><div className="grid gap-3">{reflections.map(({ icon: Icon, label, copy, color }) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur"><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${color}`}><Icon className="h-5 w-5" /></div><div><p className="m-0 text-sm font-black">{label}</p><p className="m-0 mt-0.5 text-sm text-white/55">{copy}</p></div><ChevronRight className="ml-auto h-4 w-4 text-white/30" /></div>)}</div></div></section>

      <section className="px-5 py-24 sm:px-8 lg:py-32"><div className="brand-gradient-bg relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-6 py-16 text-center text-white shadow-[0_30px_80px_rgba(109,91,255,.22)] sm:px-12 sm:py-20"><div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" /><Sparkles className="relative mx-auto h-7 w-7" /><h2 className="relative m-0 mt-5 font-display text-4xl font-black tracking-[-.04em] sm:text-6xl">What good will<br />you start?</h2><p className="relative mx-auto mb-0 mt-5 max-w-xl text-base leading-7 text-white/80">One genuine reflection can change someone’s day. A community of them can change what everyone values.</p><Link href="/en/signup" className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-[#714a82] no-underline shadow-xl transition hover:-translate-y-1">Create your free account <ArrowRight className="h-4 w-4" /></Link></div></section>

      <footer className="flex w-full flex-col items-center justify-between gap-5 border-t border-[#eee8ed] px-5 py-8 sm:flex-row sm:px-8"><Logo size={28} wordmarkClassName="brand-gradient-text" /><p className="m-0 text-xs font-semibold text-[#8b848d]">A reflection of the good in people.</p><div className="flex gap-5 text-xs font-bold"><Link href="/en/privacy" className="text-[#716b73] no-underline hover:text-accent">Privacy</Link><Link href="/en/terms" className="text-[#716b73] no-underline hover:text-accent">Terms</Link><Link href="/en/support" className="text-[#716b73] no-underline hover:text-accent">Support</Link></div></footer>
    </main>
  );
}
