import { useState, useEffect } from 'react'
import Head from 'next/head'

const SERVICES = [
  { id:'pv', icon:'☀', name:'Photovoltaik', nameEn:'Solar & PV', color:'#F59E0B',
    subs:['Installation','Wartung & Service','Reinigung','Speichersysteme','Netzanschluss'],
    desc:'PV-Anlagen, Speicher & Wartung', priceFrom:'ab 150€', count:42 },
  { id:'waerme', icon:'◉', name:'Wärmepumpe', nameEn:'Heat Pumps', color:'#10B981',
    subs:['Installation','Wartung','Reparatur','Inspektion','Hydraul. Abgleich'],
    desc:'Heizung & Wärmepumpen', priceFrom:'ab 200€', count:28 },
  { id:'dach', icon:'◧', name:'Dacharbeiten', nameEn:'Roofing', color:'#8B5CF6',
    subs:['Dachabdichtung','Dämmung','Beschichtung','Reparatur','Dachbegrünung'],
    desc:'Dach, Dämmung & Abdichtung', priceFrom:'ab 180€', count:35 },
  { id:'reinigung', icon:'◎', name:'Reinigung', nameEn:'Cleaning', color:'#EC4899',
    subs:['Gebäudereinigung','Industriereinigung','Glasreinigung','Unterhaltsreinigung'],
    desc:'Professionelle Reinigung', priceFrom:'ab 80€', count:61 },
  { id:'garten', icon:'❋', name:'Garten & Grün', nameEn:'Landscaping', color:'#22C55E',
    subs:['Rasenpflege','Baumschnitt','Anlagenpflege','Neugestaltung','Bewässerung'],
    desc:'Garten & Außenanlagen', priceFrom:'ab 90€', count:19 },
  { id:'bau', icon:'◫', name:'Bauarbeiten', nameEn:'Construction', color:'#F97316',
    subs:['Innenausbau','Außenarbeiten','Renovierung','Sanierung','Estrich & Böden'],
    desc:'Bau, Renovierung & Sanierung', priceFrom:'ab 120€', count:47 },
]

const REGIONS = [
  'Augsburg','München','Ingolstadt','Ulm','Kempten',
  'Landsberg am Lech','Aichach','Friedberg','Memmingen',
  'Kaufbeuren','Neu-Ulm','Günzburg','Dillingen','Donauwörth','Nürnberg'
]

const PARTNERS = [
  { id:1, name:'SolarTech Bayern GmbH', services:['pv','waerme'], regions:['Augsburg','München','Friedberg','Aichach'], rating:4.9, jobs:134, verified:true, response:'< 1h', av:'ST', color:'#F59E0B' },
  { id:2, name:'Dach & Bau Müller', services:['dach','bau'], regions:['Augsburg','Landsberg am Lech','Aichach'], rating:4.8, jobs:89, verified:true, response:'< 2h', av:'DM', color:'#8B5CF6' },
  { id:3, name:'CleanPro Südbayern', services:['reinigung'], regions:['München','Augsburg','Ingolstadt'], rating:4.7, jobs:210, verified:true, response:'< 1h', av:'CP', color:'#EC4899' },
  { id:4, name:'GreenSpace GmbH', services:['garten'], regions:['Augsburg','Ulm','Kempten'], rating:4.9, jobs:67, verified:true, response:'< 3h', av:'GS', color:'#22C55E' },
  { id:5, name:'Energiehaus Allgäu', services:['pv','waerme','dach'], regions:['Kempten','Memmingen','Kaufbeuren'], rating:5.0, jobs:43, verified:true, response:'< 2h', av:'EA', color:'#06B6D4' },
  { id:6, name:'Bauwerk Schwaben', services:['bau','dach'], regions:['Ulm','Neu-Ulm','Günzburg'], rating:4.6, jobs:156, verified:false, response:'< 4h', av:'BW', color:'#F97316' },
  { id:7, name:'AlpenSolar AG', services:['pv'], regions:['München','Ingolstadt','Augsburg'], rating:4.8, jobs:201, verified:true, response:'< 1h', av:'AS', color:'#F59E0B' },
]

export default function Home() {
  const [locale, setLocale] = useState('de')
  const [view, setView] = useState('home')
  const [selSvc, setSelSvc] = useState(null)
  const [selRegion, setSelRegion] = useState('')
  const [selSub, setSelSub] = useState('')
  const [matches, setMatches] = useState([])
  const [selPartner, setSelPartner] = useState(null)
  const [bStep, setBStep] = useState(1)
  const [bData, setBData] = useState({ name:'', email:'', phone:'', date:'', notes:'' })
  const [aiQ, setAiQ] = useState('')
  const [aiRes, setAiRes] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [portal, setPortal] = useState('public')
  const [loaded, setLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [adminTab, setAdminTab] = useState('overview')

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const reset = () => {
    setView('home'); setMatches([]); setSelSvc(null); setSelRegion('')
    setSelSub(''); setBStep(1); setAiRes(null); setAiQ('')
  }

  const doSearch = () => {
    if (!selSvc || !selRegion) return
    const m = PARTNERS.filter(p => p.services.includes(selSvc.id) && p.regions.includes(selRegion))
    setMatches(m)
    setView('results')
  }

  const doAi = async () => {
    if (!aiQ.trim()) return
    setAiLoading(true); setAiRes(null)
    try {
      const res = await fetch('/api/ai-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQ })
      })
      const data = await res.json()
      setAiRes(data)
      const svc = SERVICES.find(s => s.id === data.service_id)
      if (svc) setSelSvc(svc)
      if (data.region && REGIONS.includes(data.region)) setSelRegion(data.region)
    } catch(e) {
      setAiRes({ error: true, summary: 'Analyse fehlgeschlagen.' })
    }
    setAiLoading(false)
  }

  const S = {
    grad: { background: 'linear-gradient(135deg, #06B6D4, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, backdropFilter: 'blur(20px)' },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#F1F5F9', outline: 'none', fontFamily: 'inherit' },
    label: { fontSize: 10, color: '#94A3B8', fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' },
  }

  const PBtn = ({ children, onClick, disabled, full, variant='primary', style={} }) => {
    const [hov, setHov] = useState(false)
    const v = {
      primary: { background: hov ? 'linear-gradient(135deg,#0891B2,#2563EB)' : 'linear-gradient(135deg,#06B6D4,#3B82F6)', color:'#000', border:'none', boxShadow: hov ? '0 0 24px rgba(6,182,212,0.5)' : '0 4px 16px rgba(6,182,212,0.3)' },
      ghost: { background: 'transparent', color:'#06B6D4', border:'1px solid rgba(6,182,212,0.4)', boxShadow: hov ? '0 0 12px rgba(6,182,212,0.2)' : 'none' },
      subtle: { background: hov ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', color:'#94A3B8', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'none' },
      success: { background: hov ? '#059669' : '#10B981', color:'#000', border:'none', boxShadow: hov ? '0 0 20px rgba(16,185,129,0.4)' : '0 4px 16px rgba(16,185,129,0.3)' },
    }
    return (
      <button
        onClick={onClick} disabled={disabled}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ ...v[variant], padding:'11px 22px', borderRadius:10, fontWeight:700, cursor:disabled?'not-allowed':'pointer', fontSize:14, opacity:disabled?0.4:1, width:full?'100%':'auto', transition:'all 0.2s', ...style }}
      >{children}</button>
    )
  }

  return (
    <>
      <Head>
        <title>Werkr — AI Trade Platform Germany</title>
        <meta name="description" content="KI-gestütztes Matching zwischen Auftraggebern und verifizierten Fachbetrieben" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#05080F', color: '#F1F5F9' }}>

        {/* NAV */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 300,
          background: scrolled ? 'rgba(5,8,16,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.3s ease',
        }}>
          <div onClick={reset} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#06B6D4,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(6,182,212,0.5)', animation:'glow 3s ease-in-out infinite' }}>
              <span style={{ color:'#000', fontSize:15, fontWeight:900 }}>W</span>
            </div>
            <div>
              <div style={{ ...S.grad, fontSize:18, fontWeight:900, letterSpacing:2, lineHeight:1 }}>werkr</div>
              <div style={{ fontSize:8, color:'#475569', letterSpacing:3, textTransform:'uppercase' }}>AI Trade Platform</div>
            </div>
          </div>

          <div style={{ display:'flex', gap:4, alignItems:'center', flexWrap:'wrap' }}>
            {portal === 'public' && (
              <>
                {[['home', locale==='de'?'Dienste':'Services'], ['ai', 'AI Search']].map(([v,l]) => (
                  <button key={v} onClick={() => setView(v)} style={{ background:'transparent', color:view===v?'#06B6D4':'#94A3B8', border:'none', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:view===v?700:400, borderBottom:view===v?'2px solid #06B6D4':'2px solid transparent', transition:'all 0.2s' }}>{l}</button>
                ))}
              </>
            )}
            <div style={{ width:1, height:20, background:'rgba(255,255,255,0.08)', margin:'0 6px' }} />
            {[['public', 'Public'], ['partner', 'Partner'], ['admin', 'Admin']].map(([p,l]) => (
              <button key={p} onClick={() => { setPortal(p); setView('home'); reset() }} style={{ background:portal===p?'rgba(6,182,212,0.12)':'transparent', color:portal===p?'#06B6D4':'#475569', border:`1px solid ${portal===p?'rgba(6,182,212,0.3)':'rgba(255,255,255,0.08)'}`, padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700, transition:'all 0.2s' }}>{l}</button>
            ))}
            <div style={{ width:1, height:20, background:'rgba(255,255,255,0.08)', margin:'0 6px' }} />
            <button onClick={() => setLocale(locale==='de'?'en':'de')} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', color:'#94A3B8', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:12 }}>
              {locale==='de'?'EN':'DE'} 🌐
            </button>
          </div>
        </nav>

        {/* PUBLIC PORTAL */}
        {portal === 'public' && (
          <>
            {/* HOME */}
            {view === 'home' && (
              <div>
                {/* Hero */}
                <div style={{ position:'relative', minHeight:'88vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px 60px', overflow:'hidden' }}>
                  {/* Animated BG */}
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'60%', background:'radial-gradient(circle,rgba(6,182,212,0.13) 0%,transparent 70%)', animation:'pulse 8s ease-in-out infinite' }} />
                    <div style={{ position:'absolute', top:'30%', right:'-10%', width:'50%', height:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.10) 0%,transparent 70%)', animation:'pulse 10s ease-in-out infinite 2s' }} />
                    <div style={{ position:'absolute', bottom:'-10%', left:'30%', width:'40%', height:'40%', background:'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)', animation:'pulse 12s ease-in-out infinite 4s' }} />
                    <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize:'36px 36px' }} />
                  </div>

                  <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:760, opacity:loaded?1:0, transform:loaded?'none':'translateY(30px)', transition:'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.25)', borderRadius:30, padding:'6px 16px', marginBottom:24 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#06B6D4', boxShadow:'0 0 8px #06B6D4', display:'inline-block' }} />
                      <span style={{ fontSize:11, color:'#06B6D4', letterSpacing:2.5, fontWeight:700, textTransform:'uppercase' }}>KI-gestützte Handwerksplattform</span>
                    </div>

                    <h1 style={{ fontSize:'clamp(32px,6vw,60px)', fontWeight:900, lineHeight:1.07, margin:'0 0 20px', letterSpacing:-1.5 }}>
                      <span style={{ color:'#F1F5F9' }}>Der smarte Weg, </span>
                      <span style={{ ...S.grad }}>Fachbetriebe zu finden.</span>
                    </h1>

                    <p style={{ fontSize:18, color:'#94A3B8', maxWidth:520, margin:'0 auto 48px', lineHeight:1.7 }}>
                      KI-gestütztes Matching zwischen Auftraggebern und verifizierten Fachbetrieben — regional, automatisch, sofort.
                    </p>

                    {/* Search */}
                    <div style={{ ...S.card, padding:24, maxWidth:620, margin:'0 auto' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                        <div>
                          <label style={S.label}>{locale==='de'?'Leistung':'Service'}</label>
                          <select value={selSvc?.id||''} onChange={e => setSelSvc(SERVICES.find(s => s.id===e.target.value)||null)} style={{ ...S.input, cursor:'pointer' }}>
                            <option value="">Wählen...</option>
                            {SERVICES.map(s => <option key={s.id} value={s.id}>{s.icon} {locale==='de'?s.name:s.nameEn}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={S.label}>Region</label>
                          <select value={selRegion} onChange={e => setSelRegion(e.target.value)} style={{ ...S.input, cursor:'pointer' }}>
                            <option value="">Wählen...</option>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                      <PBtn onClick={doSearch} disabled={!selSvc||!selRegion} full style={{ padding:14, fontSize:15 }}>
                        {locale==='de'?'Fachbetriebe finden →':'Find companies →'}
                      </PBtn>
                      <div style={{ textAlign:'center', marginTop:12, fontSize:12, color:'#475569' }}>
                        oder <button onClick={() => setView('ai')} style={{ background:'none', border:'none', color:'#06B6D4', cursor:'pointer', fontSize:12, fontWeight:700 }}>KI-Suche nutzen ✦</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.08)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'24px' }}>
                  <div style={{ maxWidth:800, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
                    {[{n:'232+',l:'Fachbetriebe'},{n:'15',l:'Regionen Bayern'},{n:'1.400+',l:'Aufträge'},{n:'4.9★',l:'Ø Bewertung'}].map((s,i) => (
                      <div key={i} style={{ textAlign:'center', borderRight:i<3?'1px solid rgba(255,255,255,0.08)':'none', padding:'12px 0' }}>
                        <div style={{ ...S.grad, fontSize:26, fontWeight:900 }}>{s.n}</div>
                        <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Grid */}
                <div style={{ maxWidth:960, margin:'0 auto', padding:'72px 24px 80px' }}>
                  <div style={{ textAlign:'center', marginBottom:48 }}>
                    <h2 style={{ fontSize:34, fontWeight:900, color:'#F1F5F9', margin:'0 0 12px', letterSpacing:-0.5 }}>Alle Services auf einen Blick</h2>
                    <p style={{ fontSize:15, color:'#94A3B8' }}>Wählen Sie Ihre gewünschte Leistungskategorie</p>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                    {SERVICES.map((s,i) => (
                      <div key={s.id} onClick={() => setSelSvc(selSvc?.id===s.id?null:s)} style={{ ...S.card, padding:22, cursor:'pointer', borderColor:selSvc?.id===s.id?s.color+'66':'rgba(255,255,255,0.08)', background:selSvc?.id===s.id?`${s.color}0A`:'rgba(255,255,255,0.04)', transition:'all 0.2s', opacity:loaded?1:0, transitionDelay:`${i*60}ms` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                          <div style={{ width:48, height:48, borderRadius:13, background:`${s.color}18`, border:`1px solid ${s.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:s.color }}>{s.icon}</div>
                          <span style={{ fontSize:10, fontWeight:700, color:s.color, background:`${s.color}18`, border:`1px solid ${s.color}33`, borderRadius:20, padding:'3px 10px', height:'fit-content' }}>{s.count} Betriebe</span>
                        </div>
                        <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{locale==='de'?s.name:s.nameEn}</div>
                        <div style={{ fontSize:12, color:'#94A3B8', marginBottom:12, lineHeight:1.5 }}>{s.desc}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:s.color }}>{s.priceFrom}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESULTS */}
            {view === 'results' && (
              <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px 60px' }}>
                <button onClick={() => setView('home')} style={{ background:'none', border:'none', color:'#06B6D4', cursor:'pointer', fontSize:13, fontWeight:700, marginBottom:22, padding:0 }}>← Zurück</button>
                <h2 style={{ fontSize:26, fontWeight:900, margin:'0 0 6px', letterSpacing:-0.5 }}>
                  {locale==='de'?selSvc?.name:selSvc?.nameEn} <span style={{ color:'#06B6D4' }}>·</span> {selRegion}
                </h2>
                <p style={{ fontSize:13, color:'#94A3B8', margin:'0 0 22px' }}>{matches.length} Fachbetriebe gefunden</p>

                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                  {['', ...(selSvc?.subs||[])].map(sub => (
                    <button key={sub||'all'} onClick={() => setSelSub(sub)} style={{ background:selSub===sub?'rgba(6,182,212,0.12)':'transparent', color:selSub===sub?'#06B6D4':'#94A3B8', border:`1px solid ${selSub===sub?'rgba(6,182,212,0.4)':'rgba(255,255,255,0.08)'}`, padding:'5px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600, transition:'all 0.15s' }}>
                      {sub||(locale==='de'?'Alle':'All')}
                    </button>
                  ))}
                </div>

                {matches.length === 0 ? (
                  <div style={{ ...S.card, textAlign:'center', padding:'60px 24px' }}>
                    <div style={{ fontSize:40, marginBottom:16 }}>◌</div>
                    <div style={{ fontSize:15, color:'#94A3B8' }}>Keine Betriebe gefunden</div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {matches.map((p,i) => (
                      <div key={p.id} style={{ ...S.card, padding:'20px 24px' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <div style={{ width:46, height:46, borderRadius:'50%', background:`${p.color}22`, border:`2px solid ${p.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:p.color, flexShrink:0 }}>{p.av}</div>
                            <div>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                                <span style={{ fontSize:14, fontWeight:700 }}>{p.name}</span>
                                {p.verified && <span style={{ fontSize:10, fontWeight:700, color:'#10B981', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:20, padding:'2px 8px' }}>✓ Verifiziert</span>}
                                {i===0 && <span style={{ fontSize:10, fontWeight:700, color:'#F59E0B', background:'rgba(245,158,11,0.12)', borderRadius:20, padding:'2px 8px' }}>⭐ Top</span>}
                              </div>
                              <div style={{ marginBottom:5 }}>
                                <span style={{ color:'#F59E0B', fontSize:12 }}>{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5-Math.floor(p.rating))}</span>
                                <span style={{ color:'#94A3B8', fontSize:11, marginLeft:4 }}>{p.rating}</span>
                              </div>
                              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {p.regions.slice(0,3).map(r => (
                                  <span key={r} style={{ fontSize:10, color:r===selRegion?'#06B6D4':'#475569', background:r===selRegion?'rgba(6,182,212,0.1)':'rgba(255,255,255,0.03)', border:`1px solid ${r===selRegion?'rgba(6,182,212,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:4, padding:'1px 7px' }}>📍 {r}</span>
                                ))}
                                <span style={{ fontSize:11, color:'#475569' }}>⚡ {p.response}</span>
                                <span style={{ fontSize:11, color:'#475569' }}>{p.jobs} Aufträge</span>
                              </div>
                            </div>
                          </div>
                          <PBtn onClick={() => { setSelPartner(p); setView('booking'); setBStep(1) }}>Anfrage →</PBtn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BOOKING */}
            {view === 'booking' && selPartner && (
              <div style={{ maxWidth:560, margin:'0 auto', padding:'32px 24px 60px' }}>
                <button onClick={() => setView('results')} style={{ background:'none', border:'none', color:'#06B6D4', cursor:'pointer', fontSize:13, fontWeight:700, marginBottom:22, padding:0 }}>← Zurück</button>

                <div style={{ ...S.card, padding:'14px 20px', display:'flex', alignItems:'center', marginBottom:22 }}>
                  {['Auftrag','Kontakt','Bestätigung'].map((s,i) => (
                    <div key={i} style={{ flex:1, display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:26, height:26, borderRadius:'50%', background:bStep>i+1?'#10B981':bStep===i+1?'linear-gradient(135deg,#06B6D4,#3B82F6)':'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:bStep>=i+1?'#000':'#555', flexShrink:0, transition:'all 0.3s' }}>{bStep>i+1?'✓':i+1}</div>
                      <span style={{ fontSize:12, fontWeight:bStep===i+1?700:400, color:bStep===i+1?'#06B6D4':'#475569' }}>{s}</span>
                      {i<2 && <div style={{ flex:1, height:1, background:bStep>i+1?'rgba(6,182,212,0.5)':'rgba(255,255,255,0.08)', margin:'0 4px' }} />}
                    </div>
                  ))}
                </div>

                <div style={{ ...S.card, padding:24 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:16, marginBottom:16, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:`${selPartner.color}22`, border:`2px solid ${selPartner.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:selPartner.color }}>{selPartner.av}</div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700 }}>{selPartner.name}</div>
                      <span style={{ color:'#F59E0B', fontSize:12 }}>{'★'.repeat(Math.floor(selPartner.rating))}</span>
                      <span style={{ color:'#94A3B8', fontSize:11, marginLeft:4 }}>{selPartner.rating}</span>
                    </div>
                  </div>

                  {bStep === 1 && (
                    <div>
                      <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 16px' }}>Auftragsdetails</h3>
                      <div style={{ marginBottom:14 }}>
                        <label style={S.label}>Leistung</label>
                        <select value={selSub} onChange={e => setSelSub(e.target.value)} style={S.input}>
                          <option value="">{selSvc?.name} — allgemein</option>
                          {selSvc?.subs.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom:14 }}>
                        <label style={S.label}>Region</label>
                        <input value={selRegion} readOnly style={{ ...S.input, opacity:0.6 }} />
                      </div>
                      <div style={{ marginBottom:14 }}>
                        <label style={S.label}>Wunschtermin</label>
                        <input type="date" value={bData.date} onChange={e => setBData({...bData,date:e.target.value})} style={S.input} />
                      </div>
                      <PBtn onClick={() => setBStep(2)} full>Weiter →</PBtn>
                    </div>
                  )}

                  {bStep === 2 && (
                    <div>
                      <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 16px' }}>Kontaktdaten</h3>
                      {[['name','Name','Max Mustermann'],['email','E-Mail','info@firma.de'],['phone','Telefon','+49 821 ...']].map(([k,l,p]) => (
                        <div key={k} style={{ marginBottom:12 }}>
                          <label style={S.label}>{l}</label>
                          <input placeholder={p} value={bData[k]} onChange={e => setBData({...bData,[k]:e.target.value})} style={S.input} />
                        </div>
                      ))}
                      <div style={{ marginBottom:14 }}>
                        <label style={S.label}>Anmerkungen</label>
                        <textarea rows={3} value={bData.notes} onChange={e => setBData({...bData,notes:e.target.value})} placeholder="Beschreibung..." style={{ ...S.input, resize:'vertical' }} />
                      </div>
                      <div style={{ display:'flex', gap:10 }}>
                        <PBtn variant="subtle" onClick={() => setBStep(1)} style={{ flex:1 }}>←</PBtn>
                        <PBtn onClick={() => setBStep(3)} style={{ flex:3 }}>Anfrage absenden ✓</PBtn>
                      </div>
                    </div>
                  )}

                  {bStep === 3 && (
                    <div style={{ textAlign:'center', padding:'16px 0' }}>
                      <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(16,185,129,0.15)', border:'2px solid rgba(16,185,129,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 18px', boxShadow:'0 0 24px rgba(16,185,129,0.3)' }}>✓</div>
                      <h3 style={{ fontSize:19, fontWeight:800, color:'#10B981', margin:'0 0 8px' }}>Anfrage erfolgreich!</h3>
                      <p style={{ fontSize:13, color:'#94A3B8', marginBottom:20, lineHeight:1.6 }}>Sie erhalten innerhalb von 2 Stunden eine Rückmeldung von <strong style={{ color:'#F1F5F9' }}>{selPartner.name}</strong>.</p>
                      <PBtn variant="subtle" onClick={reset}>Neue Anfrage starten</PBtn>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI */}
            {view === 'ai' && (
              <div style={{ maxWidth:660, margin:'0 auto', padding:'40px 24px 60px' }}>
                <div style={{ textAlign:'center', marginBottom:32 }}>
                  <h2 style={{ fontSize:28, fontWeight:900, margin:'0 0 10px', letterSpacing:-0.5 }}>KI-Anfragenanalyse</h2>
                  <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.7 }}>Beschreibe deinen Bedarf — KI erkennt automatisch Kategorie, Region und Priorität.</p>
                </div>
                <div style={{ ...S.card, padding:24 }}>
                  <textarea rows={4} value={aiQ} onChange={e => setAiQ(e.target.value)} placeholder="z.B. Wir haben 3 PV-Anlagen in München die dringend gewartet werden müssen..." style={{ ...S.input, resize:'vertical', marginBottom:10, lineHeight:1.6 }} />
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                    {['PV Wartung München dringend','Dachsanierung Augsburg','Wärmepumpe Kempten','Büroreinigung wöchentlich'].map(q => (
                      <button key={q} onClick={() => setAiQ(q)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94A3B8', padding:'4px 12px', borderRadius:20, cursor:'pointer', fontSize:11 }}>{q}</button>
                    ))}
                  </div>
                  <PBtn onClick={doAi} disabled={!aiQ.trim()||aiLoading} full style={{ padding:14, fontSize:15 }}>
                    {aiLoading ? 'Analysiere...' : 'KI-Analyse starten ✦'}
                  </PBtn>

                  {aiRes && !aiRes.error && (
                    <div style={{ marginTop:18, background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.25)', borderRadius:12, padding:18 }}>
                      <div style={{ fontSize:10, color:'#06B6D4', fontWeight:700, letterSpacing:2, marginBottom:14, textTransform:'uppercase' }}>✦ Analyse Ergebnis</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                        {[['Kategorie',aiRes.service_name],['Unterkategorie',aiRes.subcategory],['Region',aiRes.region||'Nicht erkannt'],['Dringlichkeit',aiRes.urgency==='urgent'?'🔴 Dringend':'🟢 Normal'],['Preisbereich',aiRes.price_range]].map(([k,v]) => (
                          <div key={k} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'9px 11px' }}>
                            <div style={{ fontSize:9, color:'#475569', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:3 }}>{k}</div>
                            <div style={{ fontSize:13, fontWeight:600 }}>{v||'—'}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:8, padding:11, marginBottom:14 }}>
                        <div style={{ fontSize:13, color:'#06B6D4', fontWeight:600, lineHeight:1.5 }}>{aiRes.summary}</div>
                      </div>
                      <PBtn onClick={() => setView('home')} full>Passende Betriebe finden →</PBtn>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* PARTNER PORTAL */}
        {portal === 'partner' && (
          <div style={{ background:'#030C08', minHeight:'80vh' }}>
            <div style={{ position:'relative', overflow:'hidden', padding:'70px 24px 60px', textAlign:'center' }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 50% 0%,rgba(16,185,129,0.15) 0%,transparent 60%)' }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <h1 style={{ fontSize:42, fontWeight:900, margin:'0 0 14px', letterSpacing:-1 }}>Partner werden</h1>
                <p style={{ fontSize:17, color:'#94A3B8', maxWidth:460, margin:'0 auto 40px', lineHeight:1.7 }}>Erhalten Sie KI-vermittelte Aufträge direkt in Ihrer Region. Kein Fixbetrag — nur 10% Provision.</p>
              </div>
            </div>
            <div style={{ maxWidth:840, margin:'0 auto', padding:'0 24px 60px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:40 }}>
                {[{i:'📬',t:'Mehr Aufträge',d:'KI vermittelt passende Anfragen direkt in Ihre Region'},{i:'⚡',t:'Echtzeit-Vergabe',d:'Anfragen kommen sofort — Sie entscheiden in Sekunden'},{i:'🛡',t:'Verifiziert & Sicher',d:'Nur geprüfte Betriebe auf der Plattform'},{i:'💶',t:'Faire Provision',d:'Nur 10% pro Auftrag — keine monatlichen Fixkosten'}].map(({i,t,d}) => (
                  <div key={t} style={{ ...S.card, padding:22 }}>
                    <div style={{ fontSize:28, marginBottom:12 }}>{i}</div>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>{t}</div>
                    <div style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6 }}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, maxWidth:540, margin:'0 auto', padding:28 }}>
                <h3 style={{ fontSize:17, fontWeight:800, margin:'0 0 20px' }}>Jetzt registrieren</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div><label style={S.label}>Firmenname</label><input placeholder="Musterfirma GmbH" style={S.input}/></div>
                  <div><label style={S.label}>Ansprechpartner</label><input placeholder="Max Mustermann" style={S.input}/></div>
                </div>
                <div style={{ marginTop:10 }}><label style={S.label}>E-Mail</label><input placeholder="info@firma.de" style={S.input}/></div>
                <div style={{ marginTop:12 }}><label style={S.label}>Telefon</label><input placeholder="+49 821 ..." style={S.input}/></div>
                <div style={{ marginTop:12 }}>
                  <label style={S.label}>Hauptleistung</label>
                  <select style={S.input}>
                    <option>Wählen...</option>
                    {SERVICES.map(s => <option key={s.id}>{s.icon} {s.name}</option>)}
                  </select>
                </div>
                <button style={{ width:'100%', padding:13, marginTop:16, background:'linear-gradient(135deg,#10B981,#059669)', border:'none', borderRadius:10, color:'#000', fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 16px rgba(16,185,129,0.3)' }}>
                  Partner-Anfrage senden →
                </button>
                <p style={{ fontSize:11, color:'#475569', textAlign:'center', marginTop:12 }}>✓ Kostenlos · Nur 10% Provision · Keine Bindung</p>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN PORTAL */}
        {portal === 'admin' && (
          <div style={{ display:'flex', minHeight:'calc(100vh - 64px)' }}>
            <div style={{ width:210, background:'rgba(255,255,255,0.02)', borderRight:'1px solid rgba(255,255,255,0.08)', padding:'20px 0', flexShrink:0 }}>
              <div style={{ padding:'0 16px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:12 }}>
                <div style={{ fontSize:10, color:'#475569', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase' }}>WERKR ADMIN</div>
                <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>Mystral Global LLC</div>
              </div>
              {[{id:'overview',icon:'◈',l:'Übersicht'},{id:'partners',icon:'◧',l:'Partner'},{id:'revenue',icon:'◎',l:'Einnahmen'}].map(({id,icon,l}) => (
                <button key={id} onClick={() => setAdminTab(id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:adminTab===id?'rgba(6,182,212,0.1)':'transparent', color:adminTab===id?'#06B6D4':'#94A3B8', border:'none', borderRight:adminTab===id?'2px solid #06B6D4':'2px solid transparent', cursor:'pointer', fontSize:13, fontWeight:adminTab===id?700:400, textAlign:'left' }}>
                  <span>{icon}</span>{l}
                </button>
              ))}
            </div>
            <div style={{ flex:1, padding:28 }}>
              {adminTab === 'overview' && (
                <>
                  <h2 style={{ fontSize:22, fontWeight:900, margin:'0 0 22px', letterSpacing:-0.5 }}>Dashboard</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                    {[{l:'Aufträge',v:'1.428',c:'#06B6D4'},{l:'Partner',v:'47',c:'#10B981'},{l:'Umsatz',v:'18.420€',c:'#F59E0B'},{l:'Provision',v:'1.842€',c:'#8B5CF6'}].map(x => (
                      <div key={x.l} style={{ ...S.card, padding:18 }}>
                        <div style={{ fontSize:24, fontWeight:900, color:x.c, marginBottom:4 }}>{x.v}</div>
                        <div style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {adminTab === 'partners' && (
                <>
                  <h2 style={{ fontSize:22, fontWeight:900, margin:'0 0 22px', letterSpacing:-0.5 }}>Partner</h2>
                  {PARTNERS.map(p => (
                    <div key={p.id} style={{ ...S.card, padding:'16px 20px', marginBottom:10 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:44, height:44, borderRadius:'50%', background:`${p.color}22`, border:`2px solid ${p.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:p.color }}>{p.av}</div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{p.name}</div>
                            <span style={{ color:'#F59E0B', fontSize:12 }}>{'★'.repeat(Math.floor(p.rating))}</span>
                            <span style={{ fontSize:11, color:'#94A3B8', marginLeft:4 }}>{p.rating}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:18, fontWeight:900 }}>{p.jobs}</div>
                          <div style={{ fontSize:10, color:'#94A3B8' }}>Aufträge</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {adminTab === 'revenue' && (
                <>
                  <h2 style={{ fontSize:22, fontWeight:900, margin:'0 0 22px', letterSpacing:-0.5 }}>Einnahmen</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[{l:'Gesamt 2025',v:'87.340€'},{l:'Provision (10%)',v:'8.734€'},{l:'Partner aktiv',v:'47'},{l:'Ø Auftragswert',v:'612€'}].map(x => (
                      <div key={x.l} style={{ ...S.card, padding:20 }}>
                        <div style={{ ...S.grad, fontSize:26, fontWeight:900, marginBottom:6 }}>{x.v}</div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', padding:'18px 28px', display:'flex', justifyContent:'space-between', fontSize:11, color:'#475569', background:'rgba(255,255,255,0.01)' }}>
          <span>© 2025 <span style={{ ...S.grad, fontWeight:700 }}>werkr</span> · Mystral Global LLC</span>
          <span>DE · EN · Datenschutz · AGB · Impressum</span>
        </div>
      </div>
    </>
  )
}
