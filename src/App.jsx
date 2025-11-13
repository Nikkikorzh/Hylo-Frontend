import React, { useEffect, useState } from 'react';
import axios from 'axios';

/* -------------------------------------------------
   LOCAL ICONS
   ------------------------------------------------- */
const ICONS = {
  xsol: '/images/xsol.svg',
  hyusd: '/images/hyusd.svg',
  pt: '/images/xsol.svg',
  hylosolplus: '/images/hyloSOLplus.svg',
  hylosol: '/images/hyloSOL.svg',
  shyusd: '/images/stakedhyusd.svg',
};

/* -------------------------------------------------
   UTILITIES
   ------------------------------------------------- */
function formatNum(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 6 });
}
function SafePercent(v) {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  return isFinite(n) ? `${n.toFixed(3)}%` : '—';
}
function buildRatesFromData(data = {}) {
  const toNum = x => (x == null ? null : (isNaN(Number(x)) ? null : Number(x)));
  return {
    // Exponent
    exponent_xSOL_1: toNum(data.exponent_xSOL_1),
    exponent_PT_xSOL_1: toNum(data.exponent_PT_xSOL_1),
    exponent_xSOL_2: toNum(data.exponent_xSOL_2),
    exponent_PT_xSOL_2: toNum(data.exponent_PT_xSOL_2),
    exponent_hyUSD: toNum(data.exponent_hyUSD),
    exponent_PT_hyUSD: toNum(data.exponent_PT_hyUSD),
    exponent_hylosolplus: toNum(data.exponent_hylosolplus),
    exponent_hylosol: toNum(data.exponent_hylosol),
    exponent_sHYUSD: toNum(data.exponent_sHYUSD),

    // RateX
    ratex_xSOL: toNum(data.ratex_xSOL),
    ratex_PT_xSOL: toNum(data.ratex_PT_xSOL),
    ratex_hyUSD: toNum(data.ratex_hyUSD),
    ratex_PT_hyUSD: toNum(data.ratex_PT_hyUSD),
    ratex_hylosolplus: toNum(data.ratex_hylosolplus),
    ratex_PT_hylosolplus: toNum(data.ratex_PT_hylosolplus),
    ratex_hylosol: toNum(data.ratex_hylosol),
    ratex_PT_hylosol: toNum(data.ratex_PT_hylosol),
    ratex_sHYUSD: toNum(data.ratex_sHYUSD),
    ratex_PT_sHYUSD: toNum(data.ratex_PT_sHYUSD),

    // Loopscale — только APY
    loopscale_hyusd_one: toNum(data.loopscale_hyusd_one),
    loopscale_xsOL_one: toNum(data.loopscale_xsOL_one),
    loopscale_hyusd_15dec25: toNum(data.loopscale_hyusd_15dec25),
    loopscale_shYUSD_18nov25: toNum(data.loopscale_shYUSD_18nov25),
    loopscale_shYUSD_hyusd: toNum(data.loopscale_shYUSD_hyusd),
    loopscale_shYUSD_2601: toNum(data.loopscale_shYUSD_2601),

    fetched_at: data.fetched_at ?? null,
  };
}

/* -------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------- */
export default function App() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [principal, setPrincipal] = useState(1000);
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState('APY');
  const [cpd, setCpd] = useState(365);
  const [result, setResult] = useState(null);

  const [isMd, setIsMd] = useState(window.innerWidth >= 768);

  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMd(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchApy(force = false) {
    setLoading(true);
    try {
      const url = force ? '/api/apy?force=1' : '/api/apy';
      const res = await axios.get(url);
      if (!res.data.ok) {
        alert('API error: ' + (res.data.error || 'Unknown'));
        return;
      }
      setRates(buildRatesFromData(res.data.data || {}));
    } catch (e) {
      console.error('Failed to fetch APY:', e);
      alert('Failed to fetch APY: ' + e.message);
      setRates(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApy();
    const interval = setInterval(() => fetchApy(false), 900000);
    return () => clearInterval(interval);
  }, []);

  async function compute(rate) {
    const r = Number(rate);
    if (!isFinite(r)) { alert('Invalid rate'); return; }
    setCalcLoading(true);
    try {
      const res = await axios.post('/api/calc', {
        principal: Number(principal),
        rate: r,
        rateType: mode,
        days: Number(days),
        compoundingPerYear: Number(cpd),
      });
      if (!res.data.ok) {
        alert('Calculation failed: ' + (res.data.error || 'Unknown'));
        return;
      }
      setResult(res.data);
    } catch (e) {
      alert('Calculation failed: ' + e.message);
    } finally {
      setCalcLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      color: '#e0e0ff',
      fontFamily: '"Inter", sans-serif',
      padding: '24px 16px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* HEADER */}
        <header style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, monospace',
            fontSize: isMd ? '2.25rem' : '1.875rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: '#1a1a2e',
            background: 'linear-gradient(90deg, #00ff88, #a855f7)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            lineHeight: 1.2,
          }}>
            Hylo Simulator
          </h1>
          <p style={{ color: '#a0a0d0', fontSize: '1.1rem', marginTop: 8 }}>
            Live Fixed APY for PT-xSOL, PT-hyUSD, hyloSOL+, hyloSOL & sHYUSD
          </p>
        </header>

        {/* NOTE */}
        <div style={{
          textAlign: 'center',
          margin: '32px auto',
          padding: '14px 20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.9rem',
          color: '#a0a0d0',
          maxWidth: 800,
        }}>
          <p style={{ margin: '6px 0' }}>
            <strong>Note:</strong> Data is updated every minute. <strong>May slightly differ from real-time values on the site.</strong>
          </p>
          <p style={{ margin: '6px 0' }}>
            If a rate shows <code style={{ color: '#ff6b6b' }}>—</code> — click <strong>Force Refresh</strong> or reload the page.
          </p>
        </div>

        {/* Live APY Cards */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: '1.5rem',
            margin: '0 0 20px',
            color: '#ffffff',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Live APY
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '1.2rem' }}>Loading APY data...</div>
            </div>
          )}

          {!loading && rates && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20
            }}>

              {/* ============================== xSOL ============================== */}
              <APYCard title="Pool 1 (xsol-26Nov25-1)" apy={rates.exponent_PT_xSOL_1} label="PT-xSOL Fixed APY" icon={ICONS.xsol} link="https://www.exponent.finance/liquidity/xsol-26Nov25-1" color="purple" calcLabel="Pool 1: PT-xSOL" rate={rates.exponent_PT_xSOL_1} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Pool 2 (xsol-26Nov25)" apy={rates.exponent_PT_xSOL_2} label="PT-xSOL Fixed APY" icon={ICONS.xsol} link="https://www.exponent.finance/liquidity/xsol-26Nov25" color="purple" calcLabel="Pool 2: PT-xSOL" rate={rates.exponent_PT_xSOL_2} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X xSOL" apy={rates.ratex_xSOL} label="Variable APY" icon={ICONS.xsol} link="https://app.rate-x.io/points?symbol=xSOL-2511" color="purple" calcLabel="Rate-X: xSOL" rate={rates.ratex_xSOL} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X PT-xSOL" apy={rates.ratex_PT_xSOL} label="Fixed APY" icon={ICONS.pt} link="https://app.rate-x.io/points?symbol=xSOL-2511" color="purple" calcLabel="Rate-X: PT-xSOL" rate={rates.ratex_PT_xSOL} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Loopscale xSOL ONE" apy={rates.loopscale_xsOL_one} label="xSOL ONE APY" icon={ICONS.xsol} link="https://app.loopscale.com/vault/xsol_one" color="purple" calcLabel="Loopscale xSOL ONE" rate={rates.loopscale_xsOL_one} onCalc={compute} calcLoading={calcLoading} />

              {/* ============================== hyUSD ============================== */}
              <APYCard title="hyUSD (15Dec25)" apy={rates.exponent_PT_hyUSD} label="PT-hyUSD Fixed APY" icon={ICONS.hyusd} link="https://www.exponent.finance/liquidity/hyusd-15Dec25" color="green" calcLabel="hyUSD: PT-hyUSD" rate={rates.exponent_PT_hyUSD} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X hyUSD" apy={rates.ratex_hyUSD} label="Variable APY" icon={ICONS.hyusd} link="https://app.rate-x.io/points?symbol=hyUSD-2601" color="green" calcLabel="Rate-X: hyUSD" rate={rates.ratex_hyUSD} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X PT-hyUSD" apy={rates.ratex_PT_hyUSD} label="Fixed APY" icon={ICONS.hyusd} link="https://app.rate-x.io/points?symbol=hyUSD-2601" color="green" calcLabel="Rate-X: PT-hyUSD" rate={rates.ratex_PT_hyUSD} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Loopscale hyUSD ONE" apy={rates.loopscale_hyusd_one} label="hyUSD ONE APY" icon={ICONS.hyusd} link="https://app.loopscale.com/vault/hyusd_one" color="green" calcLabel="Loopscale hyUSD ONE" rate={rates.loopscale_hyusd_one} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Loopscale hyUSD 15dec25" apy={rates.loopscale_hyusd_15dec25} label="hyUSD 15dec25 APY" icon={ICONS.hyusd} link="https://app.loopscale.com/loops/hyusd-15dec25-hyusd

" color="green" calcLabel="Loopscale hyUSD" rate={rates.loopscale_hyusd_15dec25} onCalc={compute} calcLoading={calcLoading} />

              {/* ============================== sHYUSD ============================== */}
              <APYCard title="sHYUSD (18Nov25)" apy={rates.exponent_sHYUSD} label="sHYUSD Fixed APY" icon={ICONS.shyusd} link="https://www.exponent.finance/liquidity/shyusd-18Nov25" color="teal" calcLabel="sHYUSD" rate={rates.exponent_sHYUSD} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X sHYUSD" apy={rates.ratex_sHYUSD} label="Variable APY" icon={ICONS.shyusd} link="https://app.rate-x.io/points?symbol=sHYUSD-2601" color="teal" calcLabel="Rate-X: sHYUSD" rate={rates.ratex_sHYUSD} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X PT-sHYUSD" apy={rates.ratex_PT_sHYUSD} label="Fixed APY" icon={ICONS.shyusd} link="https://app.rate-x.io/points?symbol=sHYUSD-2601" color="teal" calcLabel="Rate-X: PT-sHYUSD" rate={rates.ratex_PT_sHYUSD} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Loopscale sHYUSD 18nov25" apy={rates.loopscale_shYUSD_18nov25} label="sHYUSD 18nov25 APY" icon={ICONS.shyusd} link="https://app.loopscale.com/loops/shyusd-18nov25-hyusd

" color="teal" calcLabel="Loopscale sHYUSD" rate={rates.loopscale_shYUSD_18nov25} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Loopscale sHYUSD" apy={rates.loopscale_shYUSD_hyusd} label="sHYUSD/hyUSD APY" icon={ICONS.shyusd} link="https://app.loopscale.com/loops/shyusd-hyusd

" color="teal" calcLabel="Loopscale sHYUSD" rate={rates.loopscale_shYUSD_hyusd} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Loopscale sHYUSD 2601" apy={rates.loopscale_shYUSD_2601} label="sHYUSD 2601 APY" icon={ICONS.shyusd} link="https://app.loopscale.com/loops/shyusd-2601-hyusd

" color="teal" calcLabel="Loopscale sHYUSD" rate={rates.loopscale_shYUSD_2601} onCalc={compute} calcLoading={calcLoading} />

              {/* ============================== hyloSOL+ ============================== */}
              <APYCard title="hyloSOL+ (15Dec25)" apy={rates.exponent_hylosolplus} label="PT-hyloSOL+ Fixed APY" icon={ICONS.hylosolplus} link="https://www.exponent.finance/liquidity/hylosolplus-15Dec25" color="orange" calcLabel="hyloSOL+: PT" rate={rates.exponent_hylosolplus} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X hyloSOL+" apy={rates.ratex_hylosolplus} label="Variable APY" icon={ICONS.hylosolplus} link="https://app.rate-x.io/points?symbol=hyloSOL%252B-2511" color="orange" calcLabel="Rate-X: hyloSOL+" rate={rates.ratex_hylosolplus} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X PT-hyloSOL+" apy={rates.ratex_PT_hylosolplus} label="Fixed APY" icon={ICONS.hylosolplus} link="https://app.rate-x.io/points?symbol=hyloSOL%252B-2511" color="orange" calcLabel="Rate-X: PT-hyloSOL+" rate={rates.ratex_PT_hylosolplus} onCalc={compute} calcLoading={calcLoading} />

              {/* ============================== hyloSOL ============================== */}
              <APYCard title="hyloSOL (10Dec25)" apy={rates.exponent_hylosol} label="PT-hyloSOL Fixed APY" icon={ICONS.hylosol} link="https://www.exponent.finance/liquidity/hylosol-10Dec25" color="violet" calcLabel="hyloSOL: PT" rate={rates.exponent_hylosol} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X hyloSOL" apy={rates.ratex_hylosol} label="Variable APY" icon={ICONS.hylosol} link="https://app.rate-x.io/points?symbol=hyloSOL-2511" color="violet" calcLabel="Rate-X: hyloSOL" rate={rates.ratex_hylosol} onCalc={compute} calcLoading={calcLoading} />
              <APYCard title="Rate-X PT-hyloSOL" apy={rates.ratex_PT_hylosol} label="Fixed APY" icon={ICONS.hylosol} link="https://app.rate-x.io/points?symbol=hyloSOL-2511" color="violet" calcLabel="Rate-X: PT-hyloSOL" rate={rates.ratex_PT_hylosol} onCalc={compute} calcLoading={calcLoading} />

            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => fetchApy(false)} style={refreshBtnStyle(false)} disabled={loading}>Refresh</button>
            <button onClick={() => fetchApy(true)} style={refreshBtnStyle(true)} disabled={loading}>Force Refresh</button>
          </div>

          {rates?.fetched_at && (
            <div style={{ textAlign: 'center', marginTop: 16, color: '#777', fontSize: '0.9rem' }}>
              Updated: {new Date(rates.fetched_at).toLocaleTimeString()}
            </div>
          )}
        </section>

        {/* Profit Calculator */}
        <section style={{
          background: 'rgba(20, 20, 40, 0.6)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          padding: 20,
          border: '1px solid rgba(100, 100, 255, 0.2)',
          maxWidth: 600,
          margin: '0 auto 32px'
        }}>
          <h2 style={{ color: '#ffffff', margin: '0 0 16px', fontSize: '1.4rem', textAlign: 'center' }}>
            Profit Calculator {calcLoading && '(Calculating...)'}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 16,
          }}>
            <InputField label="Principal ($)" value={principal} onChange={setPrincipal} disabled={calcLoading} />
            <InputField label="Days" value={days} onChange={setDays} disabled={calcLoading} />
            <SelectField label="Rate Type" value={mode} onChange={setMode} options={['APY (recommended)', 'APR']} disabled={calcLoading} />
            <InputField label="Comp./year" value={cpd} onChange={setCpd} disabled={calcLoading} />
          </div>

          {result && (
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid #00ff88',
              borderRadius: 12,
              padding: 14,
              fontFamily: 'monospace',
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#00ff88', fontWeight: 600, marginBottom: 4 }}>Result</div>
              <div>Principal: <strong>${formatNum(result.principal)}</strong></div>
              <div>Final: <strong>${formatNum(result.final)}</strong></div>
              <div style={{ color: '#00ff88', marginTop: 4 }}>Profit: <strong>${formatNum(result.profit)}</strong></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   APY CARD
   ------------------------------------------------- */
const APYCard = ({ title, apy, label, icon, link, color, calcLabel, rate, onCalc, calcLoading }) => {
  const isRateX = title.startsWith('Rate-X');
  const isLoopscale = title.includes('Loopscale');
  const viewText = isRateX ? 'Rate-X' : isLoopscale ? 'Loopscale' : 'Exponent';

  const colorConfig = {
    purple: { bgGradient: 'linear-gradient(135deg, #a855f715, #9933cc10)', borderColor: '#a855f7', calcBtnBg: 'linear-gradient(45deg, #a855f7, #7e3bc7)', textColor: '#a855f7' },
    green: { bgGradient: 'linear-gradient(135deg, #00ff8815, #00cc6610)', borderColor: '#00ff88', calcBtnBg: 'linear-gradient(45deg, #00ff88, #00cc66)', textColor: '#00ff88' },
    orange: { bgGradient: 'linear-gradient(135deg, #ff6b3515, #ff8c0010)', borderColor: '#ff6b35', calcBtnBg: 'linear-gradient(45deg, #ff6b35, #ff8c00)', textColor: '#ff6b35' },
    violet: { bgGradient: 'linear-gradient(135deg, #c026d315, #a21caf10)', borderColor: '#c026d3', calcBtnBg: 'linear-gradient(45deg, #c026d3, #a21caf)', textColor: '#c026d3' },
    teal: { bgGradient: 'linear-gradient(135deg, #10b98115, #05966910)', borderColor: '#10b981', calcBtnBg: 'linear-gradient(45deg, #10b981, #059669)', textColor: '#10b981' },
  };

  const config = colorConfig[color] || colorConfig.purple;

  return (
    <div style={{
      background: config.bgGradient,
      border: `1px solid ${config.borderColor}40`,
      borderRadius: 16,
      padding: 20,
      textAlign: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)',
    }}>
      <img
        src={icon}
        alt={title}
        onError={(e) => { e.target.src = '/images/hyusd.svg'; }}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          marginBottom: 12,
          border: `2px solid ${config.borderColor}`
        }}
      />

      <div style={{ fontSize: '0.95rem', color: '#cccccc', marginBottom: 8, fontWeight: 500 }}>
        {title}
      </div>

      <div style={{
        fontSize: '2.2rem',
        fontWeight: 800,
        background: `linear-gradient(90deg, ${config.textColor}, #ffffff)`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '8px 0',
      }}>
        {SafePercent(apy)}
      </div>

      <div style={{ fontSize: '0.85rem', color: '#a0a0d0', fontWeight: 500, marginBottom: 12 }}>
        {label}
      </div>

      <button
        onClick={() => onCalc(rate)}
        disabled={rate === null || calcLoading}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 12,
          border: 'none',
          background: rate === null || calcLoading ? 'rgba(100,100,100,0.3)' : config.calcBtnBg,
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: (rate === null || calcLoading) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: (rate === null || calcLoading) ? 0.5 : 1,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {calcLoading ? 'Calculating...' : `Calculate ${calcLabel}`}
      </button>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          fontSize: '0.7rem',
          color: '#999',
          textDecoration: 'underline',
          textDecorationColor: '#666',
          marginTop: 8,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.target.style.color = '#ccc'; e.target.style.textDecorationColor = '#999'; }}
        onMouseLeave={e => { e.target.style.color = '#999'; e.target.style.textDecorationColor = '#666'; }}
      >
        View on {viewText}
      </a>
    </div>
  );
};

/* -------------------------------------------------
   INPUT FIELDS
   ------------------------------------------------- */
const refreshBtnStyle = (force) => ({
  background: force ? 'linear-gradient(45deg, #a855f7, #7e3bc7)' : 'rgba(0, 255, 136, 0.2)',
  color: force ? '#ffffff' : '#00ff88',
  border: force ? 'none' : '1px solid #00ff88',
  padding: '10px 20px',
  borderRadius: 8,
  fontWeight: 600,
  cursor: 'pointer',
  margin: '0 8px',
  transition: 'all 0.2s',
});

const InputField = ({ label, value, onChange, disabled = false }) => (
  <div style={{ width: '100%' }}>
    <label style={{
      display: 'block',
      marginBottom: 4,
      color: '#cccccc',
      fontSize: '0.85rem',
      fontWeight: 500
    }}>
      {label}
    </label>
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid rgba(100, 100, 255, 0.4)',
        background: disabled ? 'rgba(30, 30, 60, 0.8)' : 'rgba(30, 30, 60, 0.6)',
        color: '#ffffff',
        fontSize: '0.95rem',
        outline: 'none',
        boxSizing: 'border-box'
      }}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled = false }) => (
  <div style={{ width: '100%' }}>
    <label style={{
      display: 'block',
      marginBottom: 4,
      color: '#cccccc',
      fontSize: '0.85rem',
      fontWeight: 500
    }}>
      {label}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid rgba(100, 100, 255, 0.4)',
        background: disabled ? 'rgba(30, 30, 60, 0.8)' : 'rgba(30, 30, 60, 0.6)',
        color: '#ffffff',
        fontSize: '0.95rem',
        outline: 'none',
        boxSizing: 'border-box'
      }}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
