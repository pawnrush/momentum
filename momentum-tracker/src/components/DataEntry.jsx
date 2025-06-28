import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Calendar, Clock, Save, Play, StopCircle, RotateCcw, AlertCircle } from 'lucide-react'

const DataEntry = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    observerName: '',
    dateOfObservation: '',
    timeOfObservation: '',
    settingEvents: [],
    antecedents: '',
    targetBehaviors: [],
    replacementBehaviors: [],
    consequences: [],
    frequency: 0,
    duration: 0,
    intensity: [3],
    behaviorMetrics: {
      frequency: 0,
      duration: 0,
      independentBreaksLogged: 0,
      reinforcerName: '',
      reinforcerFrequency: 0,
      reinforcerDuration: 0,
      reinforcerMethod: ''
    },
    hypothesesObservations: {
      behaviorFunction: '',
      selectHypothesizedFunction: '',
      selectMethod: '',
      additionalNotes: ''
    },
    behaviorDuration: 0, // New state for behavior duration
    latency: 0, // New state for latency
  })

  const [timerRunning, setTimerRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [stopTime, setStopTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerIntervalRef = useRef(null)

  const settingEventOptions = [
    'Lack of sleep', 'Stress/fatigue', 'Medication change', 'Recent break',
    'Peer interaction', 'Adult interaction', 'Environmental disruption'
  ]

  const targetBehaviorOptions = [
    'Elopement', 'Aggression', 'Self-injurious behavior', 'Disruption',
    'Defiance/noncompliance', 'Tantrum/crying', 'Stereotypy/self-stimming behavior',
    'Vocal/verbal disruption including yelling', 'Other'
  ]

  const replacementBehaviorOptions = [
    'Used coping strategy', 'Verbalized need appropriately', 'Used AAC/visual supports',
    'Followed directions', 'Requested break appropriately', 'Stayed in designated area',
    'Completed work area tasks', 'Walked away from conflict'
  ]

  const consequenceOptions = [
    'Task / Demand Modification', 'Redirection/prompting', 'Breaks or Movement',
    'Verbal de-escalation', 'Access to Preferred Items', 'Proximity to Preferred Person',
    'Self-Interaction', 'Verbal interaction/praise', 'Sensory input provided',
    'Offered coping strategy (e.g., breathing, counting)', 'Physical restraint used',
    'Followed BIP', 'Staff provided additional support', 'Environmental modification',
    'Peer support provided', 'Visual cues provided', 'Schedule adjustment'
  ]

  const handleCheckboxChange = (category, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const startTimer = () => {
    if (!timerRunning) {
      const now = Date.now()
      setStartTime(now)
      setStopTime(null)
      setElapsedTime(0)
      setTimerRunning(true)
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - now)
      }, 100)
    }
  }

  const stopTimer = () => {
    if (timerRunning) {
      clearInterval(timerIntervalRef.current)
      const now = Date.now()
      setStopTime(now)
      setTimerRunning(false)
      const duration = (now - startTime) / 1000 // duration in seconds
      setFormData(prev => ({ ...prev, behaviorDuration: duration }))

      // Calculate latency if a previous behavior was recorded
      // For simplicity, let's assume latency is from the last behavior's stop time to this behavior's start time
      // This would require fetching the last behavior's stop time from the backend
      // For now, let's just set latency to 0 or implement a placeholder
      setFormData(prev => ({ ...prev, latency: 0 })) // Placeholder for latency
    }
  }

  const resetTimer = () => {
    clearInterval(timerIntervalRef.current)
    setTimerRunning(false)
    setStartTime(null)
    setStopTime(null)
    setElapsedTime(0)
    setFormData(prev => ({ ...prev, behaviorDuration: 0, latency: 0 }))
  }

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingSeconds = seconds % 60
    const remainingMinutes = minutes % 60

    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your backend
    // Include behaviorDuration and latency in the data sent to backend
    try {
      const response = await fetch('http://localhost:5000/api/behavior-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          behaviorDuration: formData.behaviorDuration,
          latency: formData.latency,
          // Map frontend field names to backend model names if different
          studentId: 1, // Placeholder for now, will be dynamic
          observerId: 'observer123', // Placeholder for now
          observerName: formData.observerName,
          behavior: formData.targetBehaviors.join(', '),
          measurementType: 'Duration', // Assuming duration is measured with timer
          duration: formData.behaviorDuration, // Use the timed duration
          antecedent: formData.antecedents,
          consequence: formData.consequences.join(', '),
          settingEvents: formData.settingEvents,
          targetBehaviors: formData.targetBehaviors,
          replacementBehaviors: formData.replacementBehaviors,
          consequences: formData.consequences,
          notes: formData.hypothesesObservations.additionalNotes,
        }),
      })

      if (response.ok) {
        alert('Behavior incident logged successfully!')
        // Optionally reset form or provide feedback
      } else {
        alert('Failed to log behavior incident.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred while logging the behavior incident.')
    }
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Data Entry</h1>
            <p className="text-gray-400">Log New Behavior Incident</p>
            <p className="text-sm text-gray-500">Record data for the target behavior incidents during the observed sessions</p>
          </div>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName" className="text-gray-300">Student Name</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleInputChange('studentName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Select Student"
                  />
                </div>
                <div>
                  <Label htmlFor="observerName" className="text-gray-300">Observer Name</Label>
                  <Input
                    id="observerName"
                    value={formData.observerName}
                    onChange={(e) => handleInputChange('observerName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Select Observer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfObservation" className="text-gray-300">Date of Observation</Label>
                  <Input
                    id="dateOfObservation"
                    type="date"
                    value={formData.dateOfObservation}
                    onChange={(e) => handleInputChange('dateOfObservation', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="timeOfObservation" className="text-gray-300">Time of Observation</Label>
                  <Input
                    id="timeOfObservation"
                    type="time"
                    value={formData.timeOfObservation}
                    onChange={(e) => handleInputChange('timeOfObservation', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context & Setting */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Context & Setting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300 mb-3 block">Setting Events (Optional)</Label>
                <p className="text-sm text-gray-400 mb-3">Select any relevant setting events that might influence behavior</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {settingEventOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.settingEvents.includes(option)}
                        onCheckedChange={(checked) => handleCheckboxChange('settingEvents', option, checked)}
                        className="border-slate-600"
                      />
                      <Label htmlFor={option} className="text-sm text-gray-300">{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ABC Data */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">ABC Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="antecedents" className="text-gray-300">Antecedents (A) (Optional)</Label>
                <p className="text-sm text-gray-400 mb-2">What happened immediately before the behavior? Select all that apply</p>
                <Textarea
                  id="antecedents"
                  value={formData.antecedents}
                  onChange={(e) => handleInputChange('antecedents', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Describe the antecedents in detail..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-gray-300 mb-3 block">Target Behaviors (B)</Label>
                <p className="text-sm text-gray-400 mb-3">Select the target behaviors observed. Describe any operational definitions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {targetBehaviorOptions.map((behavior) => (
                    <div key={behavior} className="flex items-center space-x-2">
                      <Checkbox
                        id={behavior}
                        checked={formData.targetBehaviors.includes(behavior)}
                        onCheckedChange={(checked) => handleCheckboxChange('targetBehaviors', behavior, checked)}
                        className="border-slate-600"
                      />
                      <Label htmlFor={behavior} className="text-sm text-gray-300">{behavior}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior Details */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Behavior Details (Operational Definition)</CardTitle>
              <p className="text-sm text-gray-400">Describe any additional details about the behavior</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Provide specific operational definition..."
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Replacement Behaviors */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Replacement Behaviors Attempted (Optional)</CardTitle>
              <p className="text-sm text-gray-400">Did any alternative goals the student attempted or used</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {replacementBehaviorOptions.map((behavior) => (
                  <div key={behavior} className="flex items-center space-x-2">
                    <Checkbox
                      id={behavior}
                      checked={formData.replacementBehaviors.includes(behavior)}
                      onCheckedChange={(checked) => handleCheckboxChange('replacementBehaviors', behavior, checked)}
                      className="border-slate-600"
                    />
                    <Label htmlFor={behavior} className="text-sm text-gray-300">{behavior}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consequences */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Consequences (C)</CardTitle>
              <p className="text-sm text-gray-400">What happened immediately after the behavior? Staff/environmental response</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {consequenceOptions.map((consequence) => (
                  <div key={consequence} className="flex items-center space-x-2">
                    <Checkbox
                      id={consequence}
                      checked={formData.consequences.includes(consequence)}
                      onCheckedChange={(checked) => handleCheckboxChange('consequences', consequence, checked)}
                      className="border-slate-600"
                    />
                    <Label htmlFor={consequence} className="text-sm text-gray-300">{consequence}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Behavior Metrics & Support */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Behavior Metrics & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Frequency</Label>
                  <Input
                    type="number"
                    value={formData.behaviorMetrics.frequency}
                    onChange={(e) => handleNestedInputChange('behaviorMetrics', 'frequency', parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Duration</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button type="button" onClick={startTimer} disabled={timerRunning} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button type="button" onClick={stopTimer} disabled={!timerRunning} className="bg-red-600 hover:bg-red-700">
                      <StopCircle className="w-4 h-4" />
                    </Button>
                    <Button type="button" onClick={resetTimer} className="bg-gray-600 hover:bg-gray-700">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <div className="text-lg font-mono">{formatTime(elapsedTime)}</div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Recorded Duration: {formData.behaviorDuration.toFixed(2)} seconds</p>
                  <p className="text-sm text-gray-400">Latency: {formData.latency.toFixed(2)} seconds</p>
                </div>
                <div>
                  <Label className="text-gray-300">Intensity (1=Mild, 5=Severe)</Label>
                  <div className="mt-2">
                    <Slider
                      value={formData.intensity}
                      onValueChange={(value) => handleInputChange('intensity', value)}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Independent Breaks Logged</Label>
                  <Input
                    type="number"
                    value={formData.behaviorMetrics.independentBreaksLogged}
                    onChange={(e) => handleNestedInputChange('behaviorMetrics', 'independentBreaksLogged', parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Reinforcer Name</Label>
                  <Input
                    type="text"
                    value={formData.behaviorMetrics.reinforcerName}
                    onChange={(e) => handleNestedInputChange('behaviorMetrics', 'reinforcerName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Select reinforcer..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Frequency of Reinforcer Delivery</Label>
                  <Input
                    type="number"
                    value={formData.behaviorMetrics.reinforcerFrequency}
                    onChange={(e) => handleNestedInputChange('behaviorMetrics', 'reinforcerFrequency', parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Total Duration of Reinforcer Access (in seconds or mins)</Label>
                  <Input
                    type="number"
                    value={formData.behaviorMetrics.reinforcerDuration}
                    onChange={(e) => handleNestedInputChange('behaviorMetrics', 'reinforcerDuration', parseInt(e.target.value))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Method of Delivery (Optional)</Label>
                <Select
                  value={formData.behaviorMetrics.reinforcerMethod}
                  onValueChange={(value) => handleNestedInputChange('behaviorMetrics', 'reinforcerMethod', value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verbal">Verbal</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="token">Token Economy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Reinforcer or Note (Optional)</Label>
                <Textarea
                  value={formData.behaviorMetrics.reinforcerNote}
                  onChange={(e) => handleNestedInputChange('behaviorMetrics', 'reinforcerNote', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., used after unprompted compliance."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hypothesis & Observation */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Hypothesis & Observation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Behavior Function Hypothesis (Optional)</Label>
                <Select
                  value={formData.hypothesesObservations.behaviorFunction}
                  onValueChange={(value) => handleNestedInputChange('hypothesesObservations', 'behaviorFunction', value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select hypothesized function..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attention">Attention</SelectItem>
                    <SelectItem value="escape">Escape</SelectItem>
                    <SelectItem value="tangible">Access to Tangible</SelectItem>
                    <SelectItem value="sensory">Sensory/Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Additional Notes</Label>
                <Textarea
                  value={formData.hypothesesObservations.additionalNotes}
                  onChange={(e) => handleNestedInputChange('hypothesesObservations', 'additionalNotes', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Any other notes pertinent to analysis"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DataEntry


