import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FileText, Download, Eye, Calendar } from 'lucide-react'

const Reports = () => {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [reportType, setReportType] = useState('')
  const [reportTypes, setReportTypes] = useState([])
  const [reportPreview, setReportPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch available students
    fetchStudents()
    // Fetch available report types
    fetchReportTypes()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchReportTypes = async () => {
    try {
      const response = await fetch('/api/available-reports')
      if (response.ok) {
        const data = await response.json()
        setReportTypes(data.reportTypes)
      }
    } catch (error) {
      console.error('Error fetching report types:', error)
    }
  }

  const generateReport = async () => {
    if (!selectedStudent || !reportType) {
      alert('Please select both a student and report type')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/generate-report?studentId=${selectedStudent}&reportType=${reportType}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `behavioral_report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report')
    } finally {
      setLoading(false)
    }
  }

  const previewReport = async () => {
    if (!selectedStudent || !reportType) {
      alert('Please select both a student and report type')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/report-preview?studentId=${selectedStudent}&reportType=${reportType}`)
      if (response.ok) {
        const data = await response.json()
        setReportPreview(data)
      } else {
        alert('Failed to generate report preview')
      }
    } catch (error) {
      console.error('Error generating report preview:', error)
      alert('Error generating report preview')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-gray-400">Generate behavioral reports for students</p>
          </div>
          <FileText className="w-8 h-8 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Generation Form */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Generate Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose report type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={previewReport} 
                  disabled={loading || !selectedStudent || !reportType}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={generateReport} 
                  disabled={loading || !selectedStudent || !reportType}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Types Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Report Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-slate-700 rounded-lg">
                  <h4 className="font-semibold text-white">Weekly Report</h4>
                  <p className="text-sm text-gray-400">Covers the last 7 days of behavioral data</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <h4 className="font-semibold text-white">9-Week Report</h4>
                  <p className="text-sm text-gray-400">Comprehensive report covering 9 weeks of data</p>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <h4 className="font-semibold text-white">Semester Report</h4>
                  <p className="text-sm text-gray-400">Full semester report (approximately 18 weeks)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        {reportPreview && (
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Report Preview - {reportPreview.student.firstName} {reportPreview.student.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400">Total Incidents</h4>
                  <p className="text-2xl font-bold text-white">{reportPreview.summary.totalIncidents}</p>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400">Total Duration</h4>
                  <p className="text-2xl font-bold text-white">{reportPreview.summary.totalDuration.toFixed(1)}s</p>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400">Avg Duration</h4>
                  <p className="text-2xl font-bold text-white">{reportPreview.summary.averageDuration.toFixed(1)}s</p>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400">Avg Intensity</h4>
                  <p className="text-2xl font-bold text-white">{reportPreview.summary.averageIntensity.toFixed(1)}/5</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Report Details</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <span className="font-medium">Report Type:</span> {reportPreview.reportType}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Date Range:</span> {formatDate(reportPreview.dateRange.start)} - {formatDate(reportPreview.dateRange.end)}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Student:</span> {reportPreview.student.firstName} {reportPreview.student.lastName}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Grade:</span> {reportPreview.student.grade || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Most Frequent Behaviors</h4>
                  <div className="space-y-2">
                    {Object.entries(reportPreview.behaviorFrequency)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([behavior, count]) => (
                        <div key={behavior} className="flex justify-between items-center p-2 bg-slate-700 rounded">
                          <span className="text-gray-300 text-sm">{behavior}</span>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {reportPreview.recentLogs.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Recent Incidents</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reportPreview.recentLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{log.behavior}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(log.timestamp).toLocaleDateString()} - Duration: {log.duration}s, Intensity: {log.intensity}/5
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Reports

