from flask import Blueprint, request, jsonify
from src.models.behavioral_data import db, Student, BehaviorLog, Settings, User
from datetime import datetime, timedelta
import json

behavioral_bp = Blueprint('behavioral', __name__)

# Student routes
@behavioral_bp.route('/students', methods=['GET'])
def get_students():
    """Get all students or filter by campus"""
    campus_id = request.args.get('campusId')
    
    if campus_id:
        students = Student.query.filter_by(campus_id=campus_id).all()
    else:
        students = Student.query.all()
    
    return jsonify([student.to_dict() for student in students])

@behavioral_bp.route('/students', methods=['POST'])
def create_student():
    """Create a new student"""
    data = request.get_json()
    
    student = Student(
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        grade=data.get('grade'),
        campus_id=data.get('campusId'),
        iep_status=data.get('iepStatus', False),
        target_behaviors=json.dumps(data.get('targetBehaviors', [])),
        assigned_staff=json.dumps(data.get('assignedStaff', [])),
        parent_ids=json.dumps(data.get('parentIds', []))
    )
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify(student.to_dict()), 201

@behavioral_bp.route('/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """Get a specific student"""
    student = Student.query.get_or_404(student_id)
    return jsonify(student.to_dict())

# Behavior log routes
@behavioral_bp.route('/behavior-logs', methods=['GET'])
def get_behavior_logs():
    """Get behavior logs with optional filters"""
    student_id = request.args.get('studentId')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    query = BehaviorLog.query
    
    if student_id:
        query = query.filter_by(student_id=student_id)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.filter(BehaviorLog.timestamp >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.filter(BehaviorLog.timestamp <= end_dt)
    
    logs = query.order_by(BehaviorLog.timestamp.desc()).all()
    return jsonify([log.to_dict() for log in logs])

@behavioral_bp.route('/behavior-logs', methods=['POST'])
def create_behavior_log():
    """Create a new behavior log entry"""
    data = request.get_json()
    
    behavior_log = BehaviorLog(
        student_id=data.get('studentId'),
        observer_id=data.get('observerId'),
        observer_name=data.get('observerName'),
        behavior=data.get('behavior'),
        measurement_type=data.get('measurementType'),
        frequency=data.get('frequency', 0),
        duration=data.get('duration', 0),
        intensity=data.get('intensity', 1),
        antecedent=data.get('antecedent'),
        consequence=data.get('consequence'),
        setting=data.get('setting'),
        setting_events=json.dumps(data.get('settingEvents', [])),
        target_behaviors=json.dumps(data.get('targetBehaviors', [])),
        replacement_behaviors=json.dumps(data.get('replacementBehaviors', [])),
        consequences=json.dumps(data.get('consequences', [])),
        session_id=data.get('sessionId'),
        notes=data.get('notes')
    )
    
    db.session.add(behavior_log)
    db.session.commit()
    
    return jsonify(behavior_log.to_dict()), 201

@behavioral_bp.route('/behavior-logs/<int:log_id>', methods=['PUT'])
def update_behavior_log(log_id):
    """Update a behavior log entry"""
    behavior_log = BehaviorLog.query.get_or_404(log_id)
    data = request.get_json()
    
    # Update fields
    for field in ['behavior', 'measurement_type', 'frequency', 'duration', 'intensity',
                  'antecedent', 'consequence', 'setting', 'notes']:
        if field in data:
            setattr(behavior_log, field, data[field])
    
    # Update JSON fields
    json_fields = ['setting_events', 'target_behaviors', 'replacement_behaviors', 'consequences']
    for field in json_fields:
        camel_case = ''.join(word.capitalize() if i > 0 else word for i, word in enumerate(field.split('_')))
        if camel_case in data:
            setattr(behavior_log, field, json.dumps(data[camel_case]))
    
    db.session.commit()
    return jsonify(behavior_log.to_dict())

@behavioral_bp.route('/behavior-logs/<int:log_id>', methods=['DELETE'])
def delete_behavior_log(log_id):
    """Delete a behavior log entry"""
    behavior_log = BehaviorLog.query.get_or_404(log_id)
    db.session.delete(behavior_log)
    db.session.commit()
    return '', 204

# Analytics routes
@behavioral_bp.route('/analytics/dashboard/<int:student_id>', methods=['GET'])
def get_dashboard_analytics(student_id):
    """Get dashboard analytics for a specific student"""
    # Get date range (default to last 30 days)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    # Get behavior logs for the student
    logs = BehaviorLog.query.filter(
        BehaviorLog.student_id == student_id,
        BehaviorLog.timestamp >= start_date,
        BehaviorLog.timestamp <= end_date
    ).all()
    
    # Calculate analytics
    total_incidents = len(logs)
    
    # Behavior frequency by day
    daily_frequency = {}
    for log in logs:
        day = log.timestamp.strftime('%Y-%m-%d')
        daily_frequency[day] = daily_frequency.get(day, 0) + (log.frequency or 1)
    
    # Most common antecedents
    antecedents = {}
    for log in logs:
        if log.setting_events:
            events = json.loads(log.setting_events)
            for event in events:
                antecedents[event] = antecedents.get(event, 0) + 1
    
    # Most common behaviors
    behaviors = {}
    for log in logs:
        if log.target_behaviors:
            target_behaviors = json.loads(log.target_behaviors)
            for behavior in target_behaviors:
                behaviors[behavior] = behaviors.get(behavior, 0) + 1
    
    # Intensity distribution
    intensity_dist = {}
    for log in logs:
        intensity = log.intensity or 1
        intensity_dist[intensity] = intensity_dist.get(intensity, 0) + 1
    
    return jsonify({
        'studentId': student_id,
        'totalIncidents': total_incidents,
        'dateRange': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat()
        },
        'dailyFrequency': daily_frequency,
        'commonAntecedents': antecedents,
        'commonBehaviors': behaviors,
        'intensityDistribution': intensity_dist,
        'logs': [log.to_dict() for log in logs[-10:]]  # Last 10 logs
    })

# Settings routes
@behavioral_bp.route('/settings', methods=['GET'])
def get_settings():
    """Get application settings"""
    settings = Settings.query.first()
    if not settings:
        # Create default settings
        default_settings = Settings(
            behaviors=json.dumps([
                'Elopement', 'Aggression', 'Self-injurious behavior', 'Disruption',
                'Defiance/noncompliance', 'Tantrum/crying', 'Stereotypy/self-stimming behavior',
                'Vocal/verbal disruption including yelling', 'Other'
            ]),
            antecedents=json.dumps([
                'Lack of sleep', 'Stress/fatigue', 'Medication change', 'Recent break',
                'Peer interaction', 'Adult interaction', 'Environmental disruption'
            ]),
            consequences=json.dumps([
                'Task / Demand Modification', 'Redirection/prompting', 'Breaks or Movement',
                'Verbal de-escalation', 'Access to Preferred Items', 'Proximity to Preferred Person',
                'Self-Interaction', 'Verbal interaction/praise', 'Sensory input provided',
                'Offered coping strategy (e.g., breathing, counting)', 'Physical restraint used',
                'Followed BIP'
            ]),
            measurement_types=json.dumps(['Frequency', 'Duration', 'Intensity', 'Interval']),
            campuses=json.dumps(['Main Campus', 'Elementary', 'Middle School', 'High School'])
        )
        db.session.add(default_settings)
        db.session.commit()
        settings = default_settings
    
    return jsonify(settings.to_dict())

@behavioral_bp.route('/settings', methods=['PUT'])
def update_settings():
    """Update application settings"""
    settings = Settings.query.first()
    if not settings:
        settings = Settings()
        db.session.add(settings)
    
    data = request.get_json()
    
    # Update settings fields
    json_fields = ['behaviors', 'antecedents', 'consequences', 'settings', 
                   'measurementTypes', 'campuses', 'intervals']
    
    for field in json_fields:
        if field in data:
            snake_case = ''.join(['_' + c.lower() if c.isupper() else c for c in field]).lstrip('_')
            if snake_case == 'settings':
                snake_case = 'settings_list'
            elif snake_case == 'measurement_types':
                snake_case = 'measurement_types'
            setattr(settings, snake_case, json.dumps(data[field]))
    
    settings.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(settings.to_dict())

# Health check route
@behavioral_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'momentum-tracker-api'
    })

