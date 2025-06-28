from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(20))
    campus_id = db.Column(db.String(50))
    iep_status = db.Column(db.Boolean, default=False)
    target_behaviors = db.Column(db.Text)  # JSON string
    assigned_staff = db.Column(db.Text)    # JSON string
    parent_ids = db.Column(db.Text)        # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with behavior logs
    behavior_logs = db.relationship('BehaviorLog', backref='student', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'grade': self.grade,
            'campusId': self.campus_id,
            'iepStatus': self.iep_status,
            'targetBehaviors': json.loads(self.target_behaviors) if self.target_behaviors else [],
            'assignedStaff': json.loads(self.assigned_staff) if self.assigned_staff else [],
            'parentIds': json.loads(self.parent_ids) if self.parent_ids else [],
            'createdAt': self.created_at.isoformat()
        }

class BehaviorLog(db.Model):
    __tablename__ = 'behavior_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    observer_id = db.Column(db.String(100), nullable=False)
    observer_name = db.Column(db.String(200))
    behavior = db.Column(db.String(200), nullable=False)
    measurement_type = db.Column(db.String(50))
    frequency = db.Column(db.Integer, default=0)
    duration = db.Column(db.Integer, default=0)  # in seconds
    intensity = db.Column(db.Integer, default=1)  # 1-5 scale
    antecedent = db.Column(db.Text)
    consequence = db.Column(db.Text)
    setting = db.Column(db.String(200))
    setting_events = db.Column(db.Text)  # JSON string
    target_behaviors = db.Column(db.Text)  # JSON string
    replacement_behaviors = db.Column(db.Text)  # JSON string
    consequences = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'observerId': self.observer_id,
            'observerName': self.observer_name,
            'behavior': self.behavior,
            'measurementType': self.measurement_type,
            'frequency': self.frequency,
            'duration': self.duration,
            'intensity': self.intensity,
            'antecedent': self.antecedent,
            'consequence': self.consequence,
            'setting': self.setting,
            'settingEvents': json.loads(self.setting_events) if self.setting_events else [],
            'targetBehaviors': json.loads(self.target_behaviors) if self.target_behaviors else [],
            'replacementBehaviors': json.loads(self.replacement_behaviors) if self.replacement_behaviors else [],
            'consequences': json.loads(self.consequences) if self.consequences else [],
            'timestamp': self.timestamp.isoformat(),
            'sessionId': self.session_id,
            'notes': self.notes
        }

class Settings(db.Model):
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True)
    behaviors = db.Column(db.Text)      # JSON string
    antecedents = db.Column(db.Text)    # JSON string
    consequences = db.Column(db.Text)   # JSON string
    settings_list = db.Column(db.Text)  # JSON string
    measurement_types = db.Column(db.Text)  # JSON string
    campuses = db.Column(db.Text)       # JSON string
    intervals = db.Column(db.Text)      # JSON string
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'behaviors': json.loads(self.behaviors) if self.behaviors else [],
            'antecedents': json.loads(self.antecedents) if self.antecedents else [],
            'consequences': json.loads(self.consequences) if self.consequences else [],
            'settings': json.loads(self.settings_list) if self.settings_list else [],
            'measurementTypes': json.loads(self.measurement_types) if self.measurement_types else [],
            'campuses': json.loads(self.campuses) if self.campuses else [],
            'intervals': json.loads(self.intervals) if self.intervals else {},
            'updatedAt': self.updated_at.isoformat()
        }

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    display_name = db.Column(db.String(200))
    role = db.Column(db.String(50), default='teacher')  # admin, teacher, para, parent, bcba
    permissions = db.Column(db.Text)    # JSON string
    campus_ids = db.Column(db.Text)     # JSON string
    student_ids = db.Column(db.Text)    # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'displayName': self.display_name,
            'role': self.role,
            'permissions': json.loads(self.permissions) if self.permissions else [],
            'campusIds': json.loads(self.campus_ids) if self.campus_ids else [],
            'studentIds': json.loads(self.student_ids) if self.student_ids else [],
            'createdAt': self.created_at.isoformat(),
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }

