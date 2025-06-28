import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Cell, PieChart, Pie
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, Filter } from 'lucide-react'

const Dashboard = ({ currentUser }) => {
  const [selectedStudent] = useState('Alex Johnson')
  
  // Sample data based on the screenshots
  const targetBehaviorData = [
    { day: 'Mon', frequency: 2 },
    { day: 'Tue', frequency: 1 },
    { day: 'Wed', frequency: 3 },
    { day: 'Thu', frequency: 2 },
    { day: 'Fri', frequency: 4 },
    { day: 'Sat', frequency: 1 },
    { day: 'Sun', frequency: 2 }
  ]

  const incidentScatterData = [
    { time: 8, intensity: 2 }, { time: 9, intensity: 3 }, { time: 10, intensity: 1 },
    { time: 11, intensity: 4 }, { time: 12, intensity: 2 }, { time: 13, intensity: 3 },
    { time: 14, intensity: 5 }, { time: 15, intensity: 2 }, { time: 16, intensity: 1 }
  ]

  const hourlyIncidentData = [
    { hour: '8AM', incidents: 2 },
    { hour: '9AM', incidents: 4 },
    { hour: '10AM', incidents: 6 },
    { hour: '11AM', incidents: 7 },
    { hour: '12PM', incidents: 5 },
    { hour: '1PM', incidents: 4 },
    { hour: '2PM', incidents: 6 },
    { hour: '3PM', incidents: 3 },
    { hour: '4PM', incidents: 2 }
  ]

  const intensityData = [
    { level: '1 (Low)', count: 3 },
    { level: '2', count: 8 },
    { level: '3', count: 5 },
    { level: '4', count: 4 },
    { level: '5 (High)', count: 2 }
  ]

  const reinforcerData = [
    { type: 'Verbal Praise', frequency: 15 },
    { type: 'Token', frequency: 12 },
    { type: 'Break Time', frequency: 8 },
    { type: 'Preferred Activity', frequency: 6 }
  ]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent's Space</h1>
          <p className="text-gray-600">Welcome, {currentUser.name}!</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Date Filters
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Goal Incidents (This Month)</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Down 12 incidents</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students Monitored</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-500">Current caseload</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Intensity Alerts</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-500">Requires close monitoring</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Behavioral Insights for {selectedStudent}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hypothesized Functions */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Hypothesized Functions</h4>
              <p className="text-sm text-gray-600 mb-3">Distribution of different behavior functions</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Escape/Avoidance</span>
                  <Badge variant="secondary">14</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Attention</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Access/Tangible</span>
                  <Badge variant="secondary">5</Badge>
                </div>
              </div>
            </div>

            {/* Common Antecedents */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Common Antecedents</h4>
              <p className="text-sm text-gray-600 mb-3">Most frequent triggers for target behaviors</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Transition/preferred task</span>
                  <Badge variant="secondary">9</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Demands/task</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Change in routine</span>
                  <Badge variant="secondary">6</Badge>
                </div>
              </div>
            </div>

            {/* Common Consequences */}
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Common Consequences</h4>
              <p className="text-sm text-gray-600 mb-3">Most frequent responses to target behaviors</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Redirection/prompting</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Preferred break provided</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Task modified/discontinued</span>
                  <Badge variant="secondary">6</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replacement Behaviors & Positive Interventions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Replacement Behaviors & Positive Interventions</CardTitle>
          <p className="text-sm text-gray-600">Track positive behaviors and intervention strategies</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Logged Replacement Behaviors:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Appropriate help-seeking behavior</li>
                <li>• Followed directions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Common Positive Interventions:</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Preferred break provided</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Task modified/discontinued/simplified</span>
                  <Badge variant="secondary">6</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Offered coping strategy (e.g., breathing, counting)</span>
                  <Badge variant="secondary">4</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Visualizations for {selectedStudent}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Behavior Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Behavior Frequency - {selectedStudent}</CardTitle>
              <p className="text-sm text-gray-600">Weekly view of target behavior incidents</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={targetBehaviorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="frequency" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2">Trending down by 1.2% this week</p>
              <p className="text-xs text-gray-500">Showing data for the last 30 days</p>
            </CardContent>
          </Card>

          {/* Incident Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Incident Scatter Plot - {selectedStudent}</CardTitle>
              <p className="text-sm text-gray-600">View patterns of incidents by time and intensity (1-5 scale)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart data={incidentScatterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" domain={[8, 16]} type="number" />
                  <YAxis dataKey="intensity" domain={[1, 5]} />
                  <Tooltip />
                  <Scatter dataKey="intensity" fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Incident Distribution by Hour */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Incident Distribution by Hour - {selectedStudent}</CardTitle>
              <p className="text-sm text-gray-600">A visual of when incidents occurred at different hours of the school day for Alex Johnson</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyIncidentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="incidents" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Target Behavior Intensity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Behavior Intensity Distribution - {selectedStudent}</CardTitle>
              <p className="text-sm text-gray-600">Distribution of recorded intensity levels for target behaviors for Alex Johnson</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={intensityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Target Behavior Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Target Behavior Heatmap - {selectedStudent}</CardTitle>
            <p className="text-sm text-gray-600">Heatmap showing target behavior frequency across different days and times. Darker cells indicate more incidents.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center font-medium p-2">{day}</div>
              ))}
              {Array.from({length: 35}, (_, i) => (
                <div key={i} className={`h-8 rounded ${
                  Math.random() > 0.7 ? 'bg-blue-500' : 
                  Math.random() > 0.5 ? 'bg-blue-300' : 
                  Math.random() > 0.3 ? 'bg-blue-100' : 'bg-gray-100'
                }`}></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reinforcer Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reinforcer Insights for {selectedStudent}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reinforcer Usage Frequency */}
              <div>
                <h4 className="font-semibold mb-3">Reinforcer Usage Frequency - {selectedStudent}</h4>
                <p className="text-sm text-gray-600 mb-3">How often each reinforcer was delivered for Alex Johnson</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={reinforcerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Average Reinforcer Duration */}
              <div>
                <h4 className="font-semibold mb-3">Average Reinforcer Duration - {selectedStudent}</h4>
                <p className="text-sm text-gray-600 mb-3">Daily average duration (in seconds) of reinforcer access for Alex Johnson</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { day: 'Mon', duration: 45 },
                    { day: 'Tue', duration: 38 },
                    { day: 'Wed', duration: 52 },
                    { day: 'Thu', duration: 41 },
                    { day: 'Fri', duration: 47 },
                    { day: 'Sat', duration: 35 },
                    { day: 'Sun', duration: 40 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="duration" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 mt-2">Trending up by 5.7% this week</p>
                <p className="text-xs text-gray-500">Showing data for the last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

