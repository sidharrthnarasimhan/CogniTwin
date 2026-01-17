'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  TrendingUp,
  Sparkles,
  Play,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  BarChart3,
  Lightbulb
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'
import { forecastingAPI, councilAPI, checkServicesHealth, type DummyDataResponse, type ForecastResponse, type CouncilSimulationResponse } from '@/lib/api-client'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function TestDataPage() {
  // Service health
  const [servicesHealth, setServicesHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Available profiles and scenarios
  const [profiles, setProfiles] = useState<any>(null)
  const [scenarios, setScenarios] = useState<any>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState<'generate' | 'forecast' | 'council'>('generate')

  // Data generation state
  const [selectedProfile, setSelectedProfile] = useState('startup_saas')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [daysBack, setDaysBack] = useState(90)
  const [seasonality, setSeasonality] = useState(true)
  const [trendChange, setTrendChange] = useState(false)
  const [generatedData, setGeneratedData] = useState<DummyDataResponse | null>(null)
  const [generating, setGenerating] = useState(false)

  // Forecast state
  const [forecastProfile, setForecastProfile] = useState('startup_saas')
  const [forecastMetric, setForecastMetric] = useState('revenue')
  const [historicalDays, setHistoricalDays] = useState(90)
  const [forecastDays, setForecastDays] = useState(30)
  const [useEnsemble, setUseEnsemble] = useState(true)
  const [forecastResult, setForecastResult] = useState<ForecastResponse | null>(null)
  const [forecasting, setForecasting] = useState(false)

  // Council simulation state
  const [councilPreset, setCouncilPreset] = useState('balanced_growth')
  const [scenarioName, setScenarioName] = useState('price_increase_moderate')
  const [enableDebate, setEnableDebate] = useState(true)
  const [councilResult, setCouncilResult] = useState<CouncilSimulationResponse | null>(null)
  const [simulating, setSimulating] = useState(false)

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [health, profilesData, scenariosData] = await Promise.all([
          checkServicesHealth(),
          forecastingAPI.getDummyProfiles(),
          forecastingAPI.getTestScenarios()
        ])
        setServicesHealth(health)
        setProfiles(profilesData)
        setScenarios(scenariosData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Generate dummy data
  const handleGenerateData = async () => {
    setGenerating(true)
    try {
      const data = await forecastingAPI.generateDummyData({
        profile: selectedProfile,
        metric: selectedMetric,
        days: daysBack,
        seasonality,
        trend_change: trendChange
      })
      setGeneratedData(data)
    } catch (error) {
      console.error('Error generating data:', error)
    } finally {
      setGenerating(false)
    }
  }

  // Run forecast
  const handleRunForecast = async () => {
    setForecasting(true)
    try {
      const result = await forecastingAPI.forecastWithDummyData({
        profile: forecastProfile,
        metric: forecastMetric,
        days_historical: historicalDays,
        days_forecast: forecastDays,
        use_ensemble: useEnsemble
      })
      setForecastResult(result)
    } catch (error) {
      console.error('Error running forecast:', error)
    } finally {
      setForecasting(false)
    }
  }

  // Run council simulation
  const handleRunCouncil = async () => {
    if (!scenarios?.scenarios[scenarioName]) {
      alert('Please select a valid scenario')
      return
    }

    setSimulating(true)
    try {
      const scenario = scenarios.scenarios[scenarioName]
      const result = await councilAPI.simulateScenario({
        presetId: councilPreset,
        scenarioName: scenario.name,
        metric: scenario.metric,
        assumptions: scenario.assumptions,
        debate: enableDebate
      })
      setCouncilResult(result)
    } catch (error) {
      console.error('Error running council:', error)
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading test data system...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Test Data & Simulation
          </h1>
          <p className="text-muted-foreground">
            Generate realistic dummy data, run ML forecasts, and simulate AI Council decisions - all without real business data!
          </p>
        </div>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-xl border flex items-center justify-between ${servicesHealth?.forecasting.status === 'healthy' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-semibold text-sm">Forecasting Service</div>
                <div className="text-xs text-muted-foreground">http://localhost:8001</div>
              </div>
            </div>
            {servicesHealth?.forecasting.status === 'healthy' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className={`p-4 rounded-xl border flex items-center justify-between ${servicesHealth?.council.status === 'healthy' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-semibold text-sm">LLM Council Service</div>
                <div className="text-xs text-muted-foreground">http://localhost:4000</div>
              </div>
            </div>
            {servicesHealth?.council.status === 'healthy' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: 'generate', label: 'Generate Data', icon: Database },
            { id: 'forecast', label: 'Run Forecast', icon: TrendingUp },
            { id: 'council', label: 'AI Council', icon: Sparkles }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'generate' && (
          <DataGenerationTab
            profiles={profiles}
            selectedProfile={selectedProfile}
            setSelectedProfile={setSelectedProfile}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            daysBack={daysBack}
            setDaysBack={setDaysBack}
            seasonality={seasonality}
            setSeasonality={setSeasonality}
            trendChange={trendChange}
            setTrendChange={setTrendChange}
            generating={generating}
            generatedData={generatedData}
            onGenerate={handleGenerateData}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastTab
            profiles={profiles}
            forecastProfile={forecastProfile}
            setForecastProfile={setForecastProfile}
            forecastMetric={forecastMetric}
            setForecastMetric={setForecastMetric}
            historicalDays={historicalDays}
            setHistoricalDays={setHistoricalDays}
            forecastDays={forecastDays}
            setForecastDays={setForecastDays}
            useEnsemble={useEnsemble}
            setUseEnsemble={setUseEnsemble}
            forecasting={forecasting}
            forecastResult={forecastResult}
            onRunForecast={handleRunForecast}
          />
        )}

        {activeTab === 'council' && (
          <CouncilTab
            scenarios={scenarios}
            councilPreset={councilPreset}
            setCouncilPreset={setCouncilPreset}
            scenarioName={scenarioName}
            setScenarioName={setScenarioName}
            enableDebate={enableDebate}
            setEnableDebate={setEnableDebate}
            simulating={simulating}
            councilResult={councilResult}
            onRunCouncil={handleRunCouncil}
          />
        )}
      </main>
    </div>
  )
}

// Tab Components (continued in next file due to length)
function DataGenerationTab({ profiles, selectedProfile, setSelectedProfile, selectedMetric, setSelectedMetric, daysBack, setDaysBack, seasonality, setSeasonality, trendChange, setTrendChange, generating, generatedData, onGenerate }: any) {
  const availableMetrics = profiles?.details[selectedProfile]?.metrics || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-6 bg-card border border-border rounded-xl">
          <h3 className="font-semibold mb-4">Configuration</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Profile</label>
              <select
                value={selectedProfile}
                onChange={(e) => {
                  setSelectedProfile(e.target.value)
                  setSelectedMetric(profiles?.details[e.target.value]?.metrics[0] || 'revenue')
                }}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm"
              >
                {profiles?.profiles.map((profile: string) => (
                  <option key={profile} value={profile}>
                    {profile.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Metric</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm"
              >
                {availableMetrics.map((metric: string) => (
                  <option key={metric} value={metric}>
                    {metric.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Days of History: {daysBack}</label>
              <input
                type="range"
                min="30"
                max="365"
                value={daysBack}
                onChange={(e) => setDaysBack(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Seasonality</label>
              <button
                onClick={() => setSeasonality(!seasonality)}
                className={`w-12 h-6 rounded-full transition-colors ${seasonality ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${seasonality ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Trend Change</label>
              <button
                onClick={() => setTrendChange(!trendChange)}
                className={`w-12 h-6 rounded-full transition-colors ${trendChange ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${trendChange ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={generating}
            className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2">
        {generatedData ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">First Value</div>
                  <div className="text-xl font-bold">${generatedData.summary.first_value.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Value</div>
                  <div className="text-xl font-bold">${generatedData.summary.last_value.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Growth</div>
                  <div className="text-xl font-bold text-green-500">+{generatedData.summary.growth.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Average</div>
                  <div className="text-xl font-bold">${generatedData.summary.avg_value.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold mb-4">Historical Data</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={generatedData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-card border border-border rounded-xl">
            <div className="text-center">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Configure settings and click "Generate Data" to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ForecastTab({ profiles, forecastProfile, setForecastProfile, forecastMetric, setForecastMetric, historicalDays, setHistoricalDays, forecastDays, setForecastDays, useEnsemble, setUseEnsemble, forecasting, forecastResult, onRunForecast }: any) {
  const availableMetrics = profiles?.details[forecastProfile]?.metrics || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-6 bg-card border border-border rounded-xl">
          <h3 className="font-semibold mb-4">Forecast Configuration</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Profile</label>
              <select
                value={forecastProfile}
                onChange={(e) => {
                  setForecastProfile(e.target.value)
                  setForecastMetric(profiles?.details[e.target.value]?.metrics[0] || 'revenue')
                }}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm"
              >
                {profiles?.profiles.map((profile: string) => (
                  <option key={profile} value={profile}>
                    {profile.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Metric</label>
              <select
                value={forecastMetric}
                onChange={(e) => setForecastMetric(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm"
              >
                {availableMetrics.map((metric: string) => (
                  <option key={metric} value={metric}>
                    {metric.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Historical Days: {historicalDays}</label>
              <input
                type="range"
                min="30"
                max="180"
                value={historicalDays}
                onChange={(e) => setHistoricalDays(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Forecast Days: {forecastDays}</label>
              <input
                type="range"
                min="7"
                max="90"
                value={forecastDays}
                onChange={(e) => setForecastDays(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Use Ensemble Model</label>
              <button
                onClick={() => setUseEnsemble(!useEnsemble)}
                className={`w-12 h-6 rounded-full transition-colors ${useEnsemble ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${useEnsemble ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={onRunForecast}
            disabled={forecasting}
            className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {forecasting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running Forecast...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Run Forecast
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2">
        {forecastResult ? (
          <div className="space-y-6">
            {/* Model Info */}
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold mb-4">Model Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Model Type</div>
                  <div className="text-lg font-bold">{forecastResult.training.model_type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Training Time</div>
                  <div className="text-lg font-bold">{forecastResult.training.duration_seconds.toFixed(2)}s</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Trend</div>
                  <div className="text-lg font-bold capitalize">{forecastResult.forecast.trend}</div>
                </div>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold mb-4">Forecast Predictions</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={forecastResult.forecast.predictions}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="forecast" stroke="#a855f7" fill="url(#colorForecast)" strokeWidth={2} />
                  <Area type="monotone" dataKey="lower_bound" stroke="#666" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="upper_bound" stroke="#666" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-card border border-border rounded-xl">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Configure settings and click "Run Forecast" to train ML models</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CouncilTab({ scenarios, councilPreset, setCouncilPreset, scenarioName, setScenarioName, enableDebate, setEnableDebate, simulating, councilResult, onRunCouncil }: any) {
  const councilPresets = ['balanced_growth', 'startup_aggressive', 'enterprise_conservative']
  const availableScenarios = scenarios?.scenarios ? Object.keys(scenarios.scenarios) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-6 bg-card border border-border rounded-xl">
          <h3 className="font-semibold mb-4">Council Configuration</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Council Preset</label>
              <select
                value={councilPreset}
                onChange={(e) => setCouncilPreset(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm"
              >
                {councilPresets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Scenario</label>
              <select
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-lg text-sm"
              >
                {availableScenarios.map((scenario: string) => (
                  <option key={scenario} value={scenario}>
                    {scenarios.scenarios[scenario].name}
                  </option>
                ))}
              </select>
            </div>

            {scenarioName && scenarios?.scenarios[scenarioName] && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-2">Scenario Details</div>
                <div className="text-sm mb-2">{scenarios.scenarios[scenarioName].description}</div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Expected: </span>
                  <span className="font-medium">{scenarios.scenarios[scenarioName].expected_outcome}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Debate Mode</label>
              <button
                onClick={() => setEnableDebate(!enableDebate)}
                className={`w-12 h-6 rounded-full transition-colors ${enableDebate ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enableDebate ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={onRunCouncil}
            disabled={simulating}
            className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Council
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2">
        {councilResult ? (
          <div className="space-y-6">
            {/* Final Decision */}
            <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Final Council Decision
              </h3>
              <div className="mb-3">
                <div className="text-2xl font-bold mb-2">{councilResult.finalDecision.outcome}</div>
                <div className="text-sm text-muted-foreground">{councilResult.finalDecision.reasoning}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Consensus:</span>
                <span className="text-lg font-bold text-primary">{(councilResult.finalDecision.consensus * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Agent Votes */}
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="font-semibold mb-4">Agent Votes</h3>
              <div className="space-y-3">
                {councilResult.agents.map((agent: any, i: number) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold capitalize">{agent.agent}</div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agent.decision === 'approve' ? 'bg-green-500/20 text-green-400' :
                        agent.decision === 'needs_modification' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {agent.decision}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{agent.rationale}</div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Confidence: </span>
                      <span className="font-medium">{(agent.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Debate (if enabled) */}
            {councilResult.debate && (
              <div className="p-6 bg-card border border-border rounded-xl">
                <h3 className="font-semibold mb-4">Debate Transcript</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {councilResult.debate.turns.map((turn: any, i: number) => (
                    <div key={i} className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-semibold text-sm capitalize mb-1">{turn.agent}</div>
                      <div className="text-sm text-muted-foreground">{turn.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-card border border-border rounded-xl">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Configure settings and click "Run AI Council" to see multi-agent decision</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
