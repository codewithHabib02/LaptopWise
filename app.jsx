
import React, { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
  Cpu,
  Gauge,
  History,
  Home,
  Info,
  Laptop,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  XCircle,
  Scale
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import options from './data/options.json';

const API = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

/* =========================
   CURRENCY FORMATTER — USD
========================= */

const money = (v) =>
  Number.isFinite(Number(v))
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(v))
    : '—';

/* =========================
   API REQUEST HELPER
========================= */

async function request(path, init) {
  let res;

  try {
    res = await fetch(`${API}${path}`, init);
  } catch {
    throw new Error(
      'Cannot reach the API. Check that the backend is running and VITE_API_BASE_URL is correct.'
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || data.message || `Request failed (${res.status}).`
    );
  }

  return data;
}

/* =========================
   EMPTY FORM
========================= */

const emptyForm = {
  Company: '',
  TypeName: '',
  Inches: '15.6',
  ScreenResolution: '',
  Cpu: '',
  Ram: '',
  Memory: '',
  Gpu: ''
};

const fields = [
  ['Company', 'Laptop brand'],
  ['TypeName', 'Device type'],
  ['Inches', 'Screen size (inches)'],
  ['ScreenResolution', 'Screen resolution'],
  ['Cpu', 'Processor'],
  ['Ram', 'RAM'],
  ['Memory', 'Storage'],
  ['Gpu', 'Graphics card']
];

/* =========================
   APPLICATION LAYOUT
========================= */

function Shell({ children }) {
  const links = [
    { to: '/', label: 'Overview', icon: Home, end: true },
    { to: '/predict', label: 'Predict price', icon: Sparkles },
    { to: '/compare', label: 'Compare laptops', icon: Scale },
    { to: '/dashboard', label: 'Analytics', icon: BarChart3 },
    { to: '/about', label: 'About project', icon: Info }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Laptop size={23} />
          </div>

          <div>
            <b>LaptopWise</b>
            <small>LAPTOP PRICE PREDICTION</small>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>

        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <b>Price estimates</b>
            <small>Explore laptop values with confidence.</small>
          </div>
        </div>

        <div className="side-foot">
          LAPTOPWISE <span>·</span> v1.0
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="crumb">
            LAPTOPWISE WORKSPACE <span>/</span>{' '}
            <b>Price intelligence</b>
          </div>

          <div className="status-pill">
            <i /> Prediction service
          </div>
        </header>

        <div className="page-content">{children}</div>

        <footer>
          Built with machine learning <span>·</span> Prices are estimates, not
          retail quotes.
        </footer>
      </main>
    </div>
  );
}

/* =========================
   PAGE HEADING
========================= */

function Heading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action}
    </div>
  );
}

/* =========================
   OVERVIEW PAGE
========================= */

function HomePage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    request('/health')
      .then(setHealth)
      .catch((e) =>
        setHealth({
          status: 'offline',
          message: e.message
        })
      );
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow light">
            <Sparkles size={14} />
            SMARTER LAPTOP VALUATION
          </div>

          <h1>
            Know what a laptop
            <br />
            could be <em>worth.</em>
          </h1>

          <p>
            Explore estimated laptop prices in US dollars using hardware and
            display specifications.
          </p>

          <NavLink className="button button-light" to="/predict">
            Estimate a price <ArrowRight size={17} />
          </NavLink>

          <div className="hero-note">
            <ShieldCheck size={16} />
            Personalized specifications · Instant estimates
          </div>
        </div>

        <div className="hero-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          <div className="laptop-illustration">
            <div className="screen">
              <div className="screen-top">
                <i />
                <i />
                <i />
              </div>

              <div className="screen-glow">
                <Activity size={48} />
                <span>PRICE ESTIMATE</span>
                <b>$</b>
              </div>
            </div>

            <div className="keyboard">
              <div className="key-row" />
              <div className="key-row" />
              <div className="key-row" />
              <div className="trackpad" />
            </div>
          </div>

          <div className="float-card">
            <TrendingUp size={17} />

            <div>
              <small>Prediction output</small>
              <b>USD estimate</b>
            </div>
          </div>
        </div>
      </section>

      <div className="stat-grid home-stats">
        <div className="mini-stat">
          <div className="mini-icon">
            <Cpu size={18} />
          </div>

          <div>
            <b>8</b>
            <span>Specification inputs</span>
          </div>
        </div>

        <div className="mini-stat">
          <div className="mini-icon">
            <BadgeDollarSign size={18} />
          </div>

          <div>
            <b>USD ($)</b>
            <span>Display currency</span>
          </div>
        </div>

        <div className="mini-stat">
          <div className="mini-icon">
            <Scale size={18} />
          </div>

          <div>
            <b>Laptop comparison</b>
            <span>Compare estimated prices</span>
          </div>
        </div>

        <div className="mini-stat">
          <div className="mini-icon">
            <Activity size={18} />
          </div>

          <div>
            <b>
              {health?.model_loaded
                ? 'Connected'
                : health
                  ? 'Check setup'
                  : 'Checking…'}
            </b>

            <span>Model service status</span>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <div className="eyebrow">HOW IT WORKS</div>
          <h2>From specifications to estimate</h2>
        </div>

        <NavLink to="/about" className="text-link">
          Explore the project <ArrowRight size={15} />
        </NavLink>
      </div>

      <div className="steps-grid">
        {[
          {
            n: '01',
            title: 'Describe the laptop',
            text: 'Choose the brand, device type, display, CPU, RAM, storage and graphics.'
          },
          {
            n: '02',
            title: 'Generate an estimate',
            text: 'Your laptop specifications are processed by the existing trained model.'
          },
          {
            n: '03',
            title: 'Compare your options',
            text: 'Compare two laptops and review their estimated prices side by side.'
          }
        ].map((s) => (
          <div className="step-card" key={s.n}>
            <span>{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>

      <div className="panel about-main">
        <div className="about-hero-icon">
          <Scale size={26} />
        </div>

        <h2>Compare laptops before you decide</h2>

        <p>
          Enter the specifications of two laptops to compare their estimated
          prices using the same trained model.
        </p>

        <NavLink className="button button-primary" to="/compare">
          Compare laptops <ArrowRight size={17} />
        </NavLink>
      </div>

      {health?.status === 'offline' && (
        <div className="notice warning">
          <XCircle size={18} />
          {health.message}
        </div>
      )}
    </>
  );
}

/* =========================
   PREDICTION PAGE
========================= */

function PredictPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const change = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        ...form,
        Inches: Number(form.Inches)
      };

      const data = await request('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Heading
        eyebrow="PREDICTION STUDIO"
        title="Estimate a laptop price"
        description="Enter the laptop specifications to receive a price estimate."
      />

      <div className="predict-layout">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-title">
            <div className="panel-symbol">
              <Laptop size={20} />
            </div>

            <div>
              <h2>Laptop specifications</h2>
              <p>Enter the details of the laptop you want to evaluate.</p>
            </div>

            <span className="required-label">* Required</span>
          </div>

          <div className="form-grid">
            {fields.map(([key, label]) => (
              <label className="field" key={key}>
                <span>
                  {label} <b>*</b>
                </span>

                {key === 'Inches' ? (
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.1"
                    required
                    value={form[key]}
                    onChange={(e) => change(key, e.target.value)}
                  />
                ) : (
                  <select
                    required
                    value={form[key]}
                    onChange={(e) => change(key, e.target.value)}
                  >
                    <option value="">
                      Choose {label.toLowerCase()}
                    </option>

                    {(options[key] || []).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                )}

                <small>
                  {key === 'Inches'
                    ? 'Diagonal display size in inches.'
                    : key === 'Ram'
                      ? 'Choose the RAM capacity.'
                      : key === 'Memory'
                        ? 'Select the storage configuration.'
                        : 'Choose an available specification.'}
                </small>
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setForm(emptyForm);
                setResult(null);
                setError('');
              }}
            >
              Clear form
            </button>

            <button
              disabled={loading}
              className="button button-primary"
              type="submit"
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={17} />
                  Predicting…
                </>
              ) : (
                <>
                  Estimate price <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="notice error">
              <XCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </form>

        <aside className="info-rail">
          <div className="rail-card rail-dark">
            <div className="rail-icon">
              <Gauge size={20} />
            </div>

            <h3>Specification-based estimates</h3>

            <p>
              Provide the laptop details to receive an estimate from the
              existing trained model.
            </p>
          </div>

          <div className="rail-card">
            <h3>What you can evaluate</h3>

            <ul>
              {[
                'Brand and device type',
                'Display size and resolution',
                'CPU and RAM',
                'Storage and GPU'
              ].map((x) => (
                <li key={x}>
                  <CheckCircle2 size={15} />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="rail-note">
            <ShieldCheck size={17} />

            <span>
              Prices are estimates. Actual selling prices can vary by condition,
              market demand, availability, and other factors.
            </span>
          </div>
        </aside>
      </div>

      {result && (
        <section className="result-card">
          <div className="result-icon">
            <CheckCircle2 size={24} />
          </div>

          <div className="result-copy">
            <div className="eyebrow">PREDICTION COMPLETE</div>
            <h2>Estimated laptop price</h2>
            <p>Your price estimate is ready.</p>

            <div className="price-value">
              {money(result.predicted_price)}
            </div>

            <div className="result-meta">
              Reference ID: {result.id}
            </div>
          </div>

          <div className="result-actions">
            <NavLink className="button button-primary" to="/compare">
              Compare laptops <ArrowRight size={16} />
            </NavLink>

            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setResult(null);
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
            >
              New prediction
            </button>
          </div>

          <div className="spec-summary">
            {fields.map(([key, label]) => (
              <div key={key}>
                <small>{label}</small>

                <b>
                  {form[key]}
                  {key === 'Inches' ? ' in' : ''}
                </b>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* =========================
   LAPTOP COMPARISON PAGE
========================= */

function ComparisonForm({ title, number, form, setForm }) {
  const change = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  return (
    <div className="panel form-panel">
      <div className="panel-title">
        <div className="panel-symbol">
          <Laptop size={20} />
        </div>

        <div>
          <h2>{title}</h2>
          <p>Enter the specifications for laptop {number}.</p>
        </div>
      </div>

      <div className="form-grid">
        {fields.map(([key, label]) => (
          <label className="field" key={key}>
            <span>
              {label} <b>*</b>
            </span>

            {key === 'Inches' ? (
              <input
                type="number"
                min="1"
                max="30"
                step="0.1"
                required
                value={form[key]}
                onChange={(e) => change(key, e.target.value)}
              />
            ) : (
              <select
                required
                value={form[key]}
                onChange={(e) => change(key, e.target.value)}
              >
                <option value="">
                  Choose {label.toLowerCase()}
                </option>

                {(options[key] || []).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

function LaptopResultCard({ label, laptop, price, isWinner, tone }) {
  return (
    <article className={`comparison-product-card ${tone} ${isWinner ? 'is-lower-estimate' : ''}`}>
      <div className="product-card-topline">
        <span className="product-label">{label}</span>
        {isWinner && <span className="winner-badge"><Trophy size={14} /> Lower estimate</span>}
      </div>
      <div className="product-main-row">
        <div className="product-laptop-icon"><Laptop size={42} strokeWidth={1.6} /></div>
        <div className="product-price-block">
          <h3>{laptop.Company || 'Laptop brand'} {laptop.TypeName || ''}</h3>
          <strong>{money(price)}</strong>
          <span>Estimated price</span>
        </div>
      </div>
      <div className="product-quick-specs">
        <div><Cpu size={18} /><b>{laptop.Cpu || '—'}</b><small>Processor</small></div>
        <div><Activity size={18} /><b>{laptop.Ram || '—'}</b><small>RAM</small></div>
        <div><Laptop size={18} /><b>{laptop.Memory || '—'}</b><small>Storage</small></div>
        <div><BadgeDollarSign size={18} /><b>{laptop.Inches || '—'}{laptop.Inches ? '″' : ''}</b><small>Screen</small></div>
      </div>
      <div className="product-graphics"><span>Graphics</span><b>{laptop.Gpu || '—'}</b></div>
    </article>
  );
}

function ComparisonDetails({ laptopA, laptopB }) {
  const rows = [
    ['Processor', laptopA.Cpu, laptopB.Cpu],
    ['RAM', laptopA.Ram, laptopB.Ram],
    ['Storage', laptopA.Memory, laptopB.Memory],
    ['Screen size', `${laptopA.Inches} inches`, `${laptopB.Inches} inches`],
    ['Screen resolution', laptopA.ScreenResolution, laptopB.ScreenResolution],
    ['Graphics', laptopA.Gpu, laptopB.Gpu],
  ];

  return (
    <section className="comparison-details-card">
      <div className="comparison-details-heading">
        <div className="comparison-heading-icon small"><Scale size={20} /></div>
        <div><h3>Side-by-side specifications</h3><p>Review the differences at a glance.</p></div>
      </div>
      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead><tr><th>Feature</th><th>Laptop A · {laptopA.Company}</th><th>Laptop B · {laptopB.Company}</th></tr></thead>
          <tbody>{rows.map(([feature, a, b]) => <tr key={feature}><th scope="row">{feature}</th><td>{a || '—'}</td><td>{b || '—'}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

function ComparisonPage() {
  const [laptopA, setLaptopA] = useState({ ...emptyForm });
  const [laptopB, setLaptopB] = useState({ ...emptyForm });
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setResultA(null);
    setResultB(null);

    try {
      const payloadA = {
        ...laptopA,
        Inches: Number(laptopA.Inches)
      };

      const payloadB = {
        ...laptopB,
        Inches: Number(laptopB.Inches)
      };

      const [dataA, dataB] = await Promise.all([
        request('/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payloadA)
        }),
        request('/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payloadB)
        })
      ]);

      setResultA(dataA);
      setResultB(dataB);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearComparison = () => {
    setLaptopA({ ...emptyForm });
    setLaptopB({ ...emptyForm });
    setResultA(null);
    setResultB(null);
    setError('');
  };

  const priceA = Number(resultA?.predicted_price);
  const priceB = Number(resultB?.predicted_price);

  const validPrices =
    resultA &&
    resultB &&
    Number.isFinite(priceA) &&
    Number.isFinite(priceB);

  const winner =
    validPrices && priceA < priceB
      ? 'A'
      : validPrices && priceB < priceA
        ? 'B'
        : 'tie';

  return (
    <>
      <Heading
        eyebrow="LAPTOP COMPARISON"
        title="Compare two laptops"
        description="Enter two sets of laptop specifications and compare their estimated prices using your trained model."
      />

      <div className="notice info">
        <Scale size={20} />
        <span>
          Both laptops are evaluated separately using the same existing
          prediction model. No model retraining is required.
        </span>
      </div>

      <form onSubmit={submit}>
        <div className="comparison-grid">
          <ComparisonForm
            title="Laptop A"
            number="A"
            form={laptopA}
            setForm={setLaptopA}
          />

          <ComparisonForm
            title="Laptop B"
            number="B"
            form={laptopB}
            setForm={setLaptopB}
          />
        </div>

        <div className="form-actions comparison-actions">
          <button
            type="button"
            className="button button-outline"
            onClick={clearComparison}
          >
            Clear comparison
          </button>

          <button
            disabled={loading}
            className="button button-primary"
            type="submit"
          >
            {loading ? (
              <>
                <LoaderCircle className="spin" size={17} />
                Comparing…
              </>
            ) : (
              <>
                Compare prices <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="notice error">
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {validPrices && (
        <section className="comparison-results comparison-results-modern">
          <div className="comparison-section-heading">
            <div className="comparison-heading-icon">
              <Scale size={25} />
            </div>
            <div>
              <div className="eyebrow">YOUR RESULTS</div>
              <h2>Laptop comparison</h2>
              <p>Compare estimated prices and the specifications that matter.</p>
            </div>
          </div>

          <div className="comparison-product-grid">
            <LaptopResultCard
              label="Laptop A"
              laptop={laptopA}
              price={priceA}
              isWinner={winner === 'A'}
              tone="teal"
            />
            <LaptopResultCard
              label="Laptop B"
              laptop={laptopB}
              price={priceB}
              isWinner={winner === 'B'}
              tone="indigo"
            />
          </div>

          <ComparisonDetails laptopA={laptopA} laptopB={laptopB} />

          <div className="comparison-insights-grid">
            <div className="comparison-insight-card">
              <div className="comparison-insight-title">
                <span className="insight-icon teal-icon"><BadgeDollarSign size={20} /></span>
                <span>Price difference</span>
              </div>
              <strong className="insight-value">{money(Math.abs(priceA - priceB))}</strong>
              <p>{winner === 'tie' ? 'Both laptops have the same estimated price.' : `Laptop ${priceB > priceA ? 'B' : 'A'} has the lower estimate.`}</p>
            </div>

            <div className="comparison-insight-card">
              <div className="comparison-insight-title">
                <span className="insight-icon purple-icon"><Trophy size={20} /></span>
                <span>Lower estimate</span>
              </div>
              <strong className="insight-value">{winner === 'tie' ? 'Price tie' : `Laptop ${winner}`}</strong>
              <p>{winner === 'tie' ? 'Compare specifications to help decide.' : `${money(Math.min(priceA, priceB))} estimated price`}</p>
            </div>

            <div className="comparison-insight-card comparison-takeaways">
              <div className="comparison-insight-title">
                <span className="insight-icon green-icon"><Sparkles size={20} /></span>
                <span>Key takeaways</span>
              </div>
              <ul>
                <li><CheckCircle2 size={16} /> Laptop {laptopA.Ram && laptopB.Ram && Number.parseInt(laptopA.Ram) !== Number.parseInt(laptopB.Ram) ? (Number.parseInt(laptopA.Ram) > Number.parseInt(laptopB.Ram) ? 'A' : 'B') : 'A'} has the RAM configuration shown in the comparison table.</li>
                <li><CheckCircle2 size={16} /> {winner === 'tie' ? 'The model returned the same estimated price for both laptops.' : `Laptop ${winner} has the lower model-estimated price.`}</li>
                <li><CheckCircle2 size={16} /> Consider performance needs, condition, and your budget before choosing.</li>
              </ul>
            </div>
          </div>

          <div className="panel chart-panel comparison-chart-panel comparison-modern-chart">
            <div className="chart-heading">
              <div>
                <h2>Estimated price overview</h2>
                <p>Model predictions shown in USD</p>
              </div>
              <span className="chart-unit">USD ($)</span>
            </div>
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ laptop: 'Laptop A', price: priceA }, { laptop: 'Laptop B', price: priceB }]} barSize={58}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="laptop" />
                  <YAxis tickFormatter={(value) => `$${value}`} width={85} />
                  <Tooltip formatter={(value) => [money(value), 'Estimated price']} />
                  <Bar dataKey="price" name="Estimated price" fill="#168f83" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="comparison-disclaimer">
            <ShieldCheck size={18} />
            <p>The lower estimate does not automatically mean better performance or value. These are model-generated estimates, not live retail prices. Compare hardware, condition, and your intended use.</p>
          </div>
        </section>
      )}
    </>
  );
}

/* =========================
   ANALYTICS PAGE
========================= */

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">
        <Icon size={19} />
      </div>

      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');

    request('/stats')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Heading
        eyebrow="REAL-TIME OVERVIEW"
        title="Prediction analytics"
        description="Explore statistics from your saved laptop price predictions."
        action={
          <button className="button button-outline" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />

      {error && (
        <div className="notice error">
          <XCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-box">
          <LoaderCircle className="spin" size={22} />
          Loading saved analytics…
        </div>
      ) : (
        data && (
          <>
            <div className="stat-grid dashboard-stats">
              <Metric
                icon={History}
                label="Total predictions"
                value={data.total}
              />

              <Metric
                icon={BadgeDollarSign}
                label="Average estimate"
                value={data.average == null ? '—' : money(data.average)}
              />

              <Metric
                icon={TrendingUp}
                label="Lowest estimate"
                value={data.minimum == null ? '—' : money(data.minimum)}
              />

              <Metric
                icon={BarChart3}
                label="Highest estimate"
                value={data.maximum == null ? '—' : money(data.maximum)}
              />
            </div>

            {data.total === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <BarChart3 size={25} />
                </div>

                <h3>Your analytics will appear here</h3>

                <p>
                  Make your first prediction to populate the dashboard with
                  saved data.
                </p>

                <NavLink className="button button-primary" to="/predict">
                  Make a prediction <ArrowRight size={16} />
                </NavLink>
              </div>
            ) : (
              <div className="chart-grid">
                <div className="panel chart-panel">
                  <div className="chart-heading">
                    <div>
                      <h2>Prediction activity</h2>
                      <p>Number of saved predictions per day</p>
                    </div>
                  </div>

                  <div className="chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.activity}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11 }}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="count"
                          name="Predictions"
                          radius={[5, 5, 0, 0]}
                          fill="#258c82"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel chart-panel">
                  <div className="chart-heading">
                    <div>
                      <h2>Price distribution</h2>
                      <p>Saved estimates grouped into price bands</p>
                    </div>
                  </div>

                  <div className="chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.distribution}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="range"
                          tick={{ fontSize: 10 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11 }}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="count"
                          name="Predictions"
                          radius={[5, 5, 0, 0]}
                          fill="#6375c7"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}
    </>
  );
}

/* =========================
   ABOUT PAGE
========================= */

function AboutPage() {
  const benefits = [
    {
      icon: BadgeDollarSign,
      title: 'Laptop Price Estimation',
      description:
        'Get an estimated laptop price based on its hardware and display specifications.'
    },
    {
      icon: Cpu,
      title: 'Hardware Insights',
      description:
        'Explore laptop specifications, including processor, memory, storage, and graphics.'
    },
    {
      icon: Scale,
      title: 'Laptop Comparison',
      description:
        'Compare two laptops and review their estimated prices and hardware differences.'
    },
    {
      icon: BarChart3,
      title: 'Price Analytics',
      description:
        'Explore statistics and price trends based on saved predictions.'
    }
  ];

  return (
    <>
      <Heading
        eyebrow="ABOUT LAPTOPWISE"
        title="Make smarter laptop decisions"
        description="Explore estimated laptop values and hardware specifications through a simple pricing experience."
      />

      <div className="about-grid">
        <div className="panel about-main">
          <div className="about-hero-icon">
            <Laptop size={28} />
          </div>

          <h2>What is LaptopWise?</h2>

          <p>
            LaptopWise helps users estimate laptop prices using key hardware
            and display specifications. Enter a laptop's details to receive
            a price estimate displayed in US dollars.
          </p>

          <p>
            Whether you are comparing laptops, exploring different
            configurations, or researching a potential purchase, LaptopWise
            provides a convenient starting point for understanding estimated
            laptop values.
          </p>

          <h3>How it works</h3>

          <ol>
            <li>
              <strong>Enter specifications.</strong> Choose the laptop brand,
              device type, screen details, processor, RAM, storage, and
              graphics card.
            </li>

            <li>
              <strong>Get an estimate.</strong> The specifications are
              processed by the existing trained prediction model.
            </li>

            <li>
              <strong>Compare laptops.</strong> Compare the estimated prices
              and hardware specifications of two laptops.
            </li>
          </ol>
        </div>

        <div className="panel stack-panel">
          <h2>Why Choose LaptopWise?</h2>

          <p className="stack-description">
            Explore laptop prices and compare specifications in one place.
          </p>

          {benefits.map(({ icon: Icon, title, description }) => (
            <div className="stack-row" key={title}>
              <div className="mini-icon">
                <Icon size={19} />
              </div>

              <div>
                <b>{title}</b>
                <p>{description}</p>
              </div>
            </div>
          ))}

          <div className="notice info">
            <ShieldCheck size={20} />
            <span>
              Price estimates are not guaranteed selling prices. Actual values
              can vary based on laptop condition, market demand, availability,
              and other factors.
            </span>
          </div>
        </div>
      </div>

      <div className="panel about-main">
        <div className="about-hero-icon">
          <TrendingUp size={26} />
        </div>

        <h2>Make your next laptop decision with confidence</h2>

        <p>
          Explore different laptop configurations, generate price estimates,
          and compare two laptops side by side. LaptopWise is designed to
          make laptop price estimation simple and accessible.
        </p>

        <NavLink className="button button-primary" to="/compare">
          Compare laptops <ArrowRight size={17} />
        </NavLink>
      </div>
    </>
  );
}

/* =========================
   MAIN APP
========================= */

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Shell>
  );
}
