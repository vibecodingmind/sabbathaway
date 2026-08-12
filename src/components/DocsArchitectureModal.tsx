import React, { useState } from 'react';
import { 
  FileText, 
  Database, 
  Layers, 
  ShieldCheck, 
  Server, 
  Code2, 
  BookOpen, 
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DocsArchitectureModal: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<'SRS' | 'ARCH' | 'DB_ERD' | 'API_OPENAPI' | 'SECURITY'>('SRS');

  return (
    <div id="docs-architecture-container" className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Enterprise Software Architecture & SRS Documentation
          </div>
          <h1 className="text-3xl font-extrabold font-display">
            AdventistStay System Architecture & Specs
          </h1>
          <p className="text-slate-300 text-xs leading-relaxed">
            Complete technical specification covering clean architecture, Prisma database schema, OpenAPI specs, RBAC matrix, and security protocols.
          </p>

          {/* Doc Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4 text-xs font-bold">
            {[
              { id: 'SRS', label: '1. SRS Requirements', icon: FileText },
              { id: 'ARCH', label: '2. System Architecture', icon: Layers },
              { id: 'DB_ERD', label: '3. Database ERD & Schema', icon: Database },
              { id: 'API_OPENAPI', label: '4. REST API Specs', icon: Code2 },
              { id: 'SECURITY', label: '5. Security & DevOps', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDocTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                    activeDocTab === tab.id 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doc Body Viewer Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6 text-slate-800 dark:text-slate-200 text-xs">
        
        {activeDocTab === 'SRS' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Software Requirements Specification (SRS)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm">1. Platform Mission & Scope</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  AdventistStay is a non-commercial global Christian hospitality network. The platform provides verified Seventh-day Adventist travelers with temporary accommodation freely offered by fellow members for worship, mission service, education, conferences, medical care, or family tourism.
                </p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  Strict Rule: Zero accommodation charges or payment processing between hosts and guests.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm">2. Core Functional Modules</h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                  <li>Global SDA Church Directory & Service Schedule</li>
                  <li>Pastor Endorsement & Member Verification Workflow</li>
                  <li>Stay Request & Non-Commercial Booking Engine</li>
                  <li>In-App Real-time Messaging with Hospitality Templates</li>
                  <li>Interactive Global Map with Radius Filtering</li>
                  <li>Conference Administrator Audit & Verification Portal</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeDocTab === 'ARCH' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              System Architecture & Component Diagram
            </h2>

            <div className="p-6 rounded-2xl bg-slate-950 text-slate-200 font-mono space-y-4">
              <div className="text-amber-400 font-bold">CLIENT LAYER (Vite + React 19 + Tailwind CSS)</div>
              <div className="pl-4 border-l-2 border-amber-500/40 space-y-1">
                <p>├── Header, SearchHero, InteractiveMap, ListingCards</p>
                <p>├── AppContext (Global State, RBAC Switcher, i18n Translations)</p>
                <p>└── Modals (ListingDetails, StayRequestModal, VerificationCenter)</p>
              </div>

              <div className="text-emerald-400 font-bold">SERVER LAYER (Express + Node.js)</div>
              <div className="pl-4 border-l-2 border-emerald-500/40 space-y-1">
                <p>├── Express REST Router (/api/listings, /api/churches, /api/stays)</p>
                <p>├── OpenAPI 3.0 Documentation Specification Endpoint (/api/docs/openapi)</p>
                <p>└── Verification & Audit Engine</p>
              </div>
            </div>
          </div>
        )}

        {activeDocTab === 'DB_ERD' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              Normalized Database Schema (Prisma PostgreSQL)
            </h2>

            <div className="p-6 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`// Prisma Database Schema for AdventistStay

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  GUEST
  HOST
  PASTOR
  CONFERENCE_ADMIN
  GLOBAL_ADMIN
}

enum VerificationTier {
  UNVERIFIED
  MEMBER_SUBMITTED
  PASTOR_VERIFIED
  CONFERENCE_VERIFIED
}

model User {
  id               String           @id @default(uuid())
  email            String           @unique
  name             String
  role             UserRole         @default(GUEST)
  verificationTier VerificationTier @default(UNVERIFIED)
  homeChurchName   String
  conferenceName   String
  pastorName       String
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  listings         Listing[]
  stayRequests     StayRequest[]
}

model Listing {
  id               String           @id @default(uuid())
  hostId           String
  host             User             @relation(fields: [hostId], references: [id])
  title            String
  description      String
  city             String
  country          String
  nearestChurch    String
  distanceMiles    Float
  maxGuests        Int
  vegetarianOnly   Boolean          @default(true)
  createdAt        DateTime         @default(now())
}`}
            </div>
          </div>
        )}

        {activeDocTab === 'API_OPENAPI' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-600" />
              OpenAPI 3.0 REST API Specification
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Live OpenAPI Endpoint</p>
                <p className="text-slate-500">Accessible at <code>GET /api/docs/openapi</code></p>
              </div>
              <a 
                href="/api/docs/openapi" 
                target="_blank" 
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs"
              >
                Inspect Raw JSON
              </a>
            </div>
          </div>
        )}

        {activeDocTab === 'SECURITY' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Security Architecture & Role-Based Access Control (RBAC)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
                    <th className="p-3 border">Role</th>
                    <th className="p-3 border">Search Stays</th>
                    <th className="p-3 border">Request Stay</th>
                    <th className="p-3 border">Host Listing</th>
                    <th className="p-3 border">Pastor Endorse</th>
                    <th className="p-3 border">Conference Audit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border font-bold">Guest</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-rose-500 font-bold">✕ Denied</td>
                    <td className="p-3 border text-rose-500 font-bold">✕ Denied</td>
                    <td className="p-3 border text-rose-500 font-bold">✕ Denied</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-bold">Host</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-rose-500 font-bold">✕ Denied</td>
                    <td className="p-3 border text-rose-500 font-bold">✕ Denied</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-bold">Pastor / Admin</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                    <td className="p-3 border text-emerald-600 font-bold">✓ Allowed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
