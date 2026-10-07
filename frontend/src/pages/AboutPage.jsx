import React from 'react';
import {
  Shield,
  Cpu,
  Layers,
  FileCode,
  Database,
  ExternalLink,
  HelpCircle,
  Server,
  Zap,
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export function AboutPage() {
  const swaggerUrl = `${API_BASE_URL}/docs`;

  return (
    <div className="about-page-container">
      {/* Overview Card */}
      <section className="about-hero-card">
        <div className="about-hero-badge">
          <Shield className="w-4 h-4 text-cyan-400 mr-1.5" />
          <span>Academic Project Overview</span>
        </div>
        <h1 className="about-title">About CampusShield</h1>
        <p className="about-lead">
          CampusShield is a student-focused cybersecurity assistant designed to help college students identify phishing, fraud, and deceptive digital communications targeting academic communities.
        </p>
        <p className="about-body">
          College students frequently encounter deceptive messages disguised as urgent placement verifications, fee payment deadlines, internship stipends, and department portal alerts. CampusShield pairs trained machine learning with an observable signal risk engine to provide fast, explainable risk assessments.
        </p>
      </section>

      {/* Technical Architecture Pipeline */}
      <section className="about-pipeline-section">
        <h2 className="section-title flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Technical Architecture & Pipeline
        </h2>
        <p className="section-subtitle">
          How suspicious messages flow from raw input to explainable risk predictions:
        </p>

        <div className="pipeline-flow-container">
          {/* Step 1 */}
          <div className="pipeline-step-card">
            <div className="step-num">01</div>
            <div className="step-content">
              <h3 className="step-title">Data Ingestion</h3>
              <p className="step-desc">
                Combined training using public phishing corpora (CEAS, Enron, Nazario) and the curated <strong>CampusShield campus-oriented dataset</strong> reflecting university-specific scenarios.
              </p>
            </div>
          </div>

          <div className="pipeline-arrow">↓</div>

          {/* Step 2 */}
          <div className="pipeline-step-card">
            <div className="step-num">02</div>
            <div className="step-content">
              <h3 className="step-title">TF-IDF Vectorization</h3>
              <p className="step-desc">
                Transforms subject and body text into numerical n-gram frequency matrices via <code>campusshield_tfidf_vectorizer.pkl</code>.
              </p>
            </div>
          </div>

          <div className="pipeline-arrow">↓</div>

          {/* Step 3 */}
          <div className="pipeline-step-card">
            <div className="step-num">03</div>
            <div className="step-content">
              <h3 className="step-title">Logistic Regression ML Classifier</h3>
              <p className="step-desc">
                Evaluates linguistic likelihood of phishing, computing a raw statistical phishing probability (0.0 to 1.0).
              </p>
            </div>
          </div>

          <div className="pipeline-arrow">↓</div>

          {/* Step 4 */}
          <div className="pipeline-step-card">
            <div className="step-num">04</div>
            <div className="step-content">
              <h3 className="step-title">Explainable Risk Engine</h3>
              <p className="step-desc">
                Combines ML probability with observable message indicators:
                urgency patterns (+8), payment requests (+10), external forms (+7), personal email domains (+5), and external URLs (+3).
              </p>
            </div>
          </div>

          <div className="pipeline-arrow">↓</div>

          {/* Step 5 */}
          <div className="pipeline-step-card">
            <div className="step-num">05</div>
            <div className="step-content">
              <h3 className="step-title">FastAPI Backend Service</h3>
              <p className="step-desc">
                High-performance Python API endpoint exposing <code>POST /analyze</code> with CORS protection, validation, and structured JSON output.
              </p>
            </div>
          </div>

          <div className="pipeline-arrow">↓</div>

          {/* Step 6 */}
          <div className="pipeline-step-card step-highlight">
            <div className="step-num">06</div>
            <div className="step-content">
              <h3 className="step-title">React Client Application</h3>
              <p className="step-desc">
                Modern responsive interface rendering visual risk gauges, explainable flag lists, and clear safety guidance with local privacy storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Cards */}
      <section className="tech-stack-section">
        <h2 className="section-title flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Technology Stack
        </h2>

        <div className="tech-cards-grid">
          <div className="tech-card">
            <div className="tech-card-header">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3>Frontend</h3>
            </div>
            <ul className="tech-card-list">
              <li><strong>Framework:</strong> React 19 + Vite</li>
              <li><strong>Architecture:</strong> Component-based SPA</li>
              <li><strong>Styling:</strong> Modern CSS & Cybersecurity Design System</li>
              <li><strong>Icons:</strong> Lucide React</li>
              <li><strong>Storage:</strong> Client-side LocalStorage</li>
            </ul>
          </div>

          <div className="tech-card">
            <div className="tech-card-header">
              <Server className="w-5 h-5 text-blue-400" />
              <h3>Backend API</h3>
            </div>
            <ul className="tech-card-list">
              <li><strong>Framework:</strong> FastAPI (Python 3)</li>
              <li><strong>ASGI Server:</strong> Uvicorn</li>
              <li><strong>Validation:</strong> Pydantic</li>
              <li><strong>CORS:</strong> Development origin whitelist</li>
              <li><strong>Docs:</strong> OpenAPI 3.0 / Swagger UI</li>
            </ul>
          </div>

          <div className="tech-card">
            <div className="tech-card-header">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3>Machine Learning & Data</h3>
            </div>
            <ul className="tech-card-list">
              <li><strong>Model:</strong> Logistic Regression Classifier</li>
              <li><strong>NLP:</strong> Scikit-Learn TF-IDF Vectorizer</li>
              <li><strong>Serialization:</strong> Joblib (.pkl)</li>
              <li><strong>Datasets:</strong> Public corpora + Campus-oriented dataset</li>
              <li><strong>Explainability:</strong> Multi-signal rule engine</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Dataset & Academic Scope Note */}
      <section className="academic-note-card">
        <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <h4 className="text-base font-semibold text-slate-200 mb-1">Dataset & Verification Notice</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            The dataset used in this project includes public benchmarks supplemented by a curated <strong>CampusShield campus-oriented dataset</strong> synthesized from common university-themed fraud templates. It does not represent an official university administrative log. CampusShield provides probabilistic risk assessments and should be used alongside critical thinking.
          </p>
        </div>
      </section>

      {/* Developer API Documentation Link */}
      <section className="api-docs-banner">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            Developer API Access
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Directly test the REST API or review schema definitions via FastAPI Swagger.
          </p>
        </div>

        <a
          href={swaggerUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="btn btn-primary text-xs"
        >
          <span>Open Swagger Docs</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
        </a>
      </section>
    </div>
  );
}
