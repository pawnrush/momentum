from flask import Blueprint, request, send_file, jsonify
from fpdf import FPDF
from datetime import datetime, timedelta
from src.models.behavioral_data import db, Student, BehaviorLog
import io
import json

reports_bp = Blueprint("reports", __name__)

class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 15)
        self.cell(0, 10, "Momentum Tracker - Behavioral Report", 0, 1, "C")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", 0, 0, "C")

    def chapter_title(self, title):
        self.set_font("Arial", "B", 14)
        self.cell(0, 10, title, 0, 1, "L")
        self.ln(5)

    def section_title(self, title):
        self.set_font("Arial", "B", 12)
        self.cell(0, 8, title, 0, 1, "L")
        self.ln(3)

    def chapter_body(self, body):
        self.set_font("Arial", "", 10)
        self.multi_cell(0, 5, body)
        self.ln()

    def add_table_row(self, data, is_header=False):
        if is_header:
            self.set_font("Arial", "B", 9)
        else:
            self.set_font("Arial", "", 9)
        
        col_widths = [30, 40, 30, 30, 30, 30]  # Adjust column widths as needed
        for i, item in enumerate(data):
            if i < len(col_widths):
                self.cell(col_widths[i], 6, str(item)[:15], 1, 0, "C")
        self.ln()

@reports_bp.route("/generate-report", methods=["GET"])
def generate_report():
    student_id = request.args.get("studentId")
    report_type = request.args.get("reportType")  # weekly, 9-week, semester

    if not student_id or not report_type:
        return jsonify({"error": "Missing studentId or reportType"}), 400

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    end_date = datetime.utcnow()
    if report_type == "weekly":
        start_date = end_date - timedelta(weeks=1)
        title = f"Weekly Behavioral Report"
    elif report_type == "9-week":
        start_date = end_date - timedelta(weeks=9)
        title = f"9-Week Behavioral Report"
    elif report_type == "semester":
        start_date = end_date - timedelta(weeks=18)  # Approx 18 weeks in a semester
        title = f"Semester Behavioral Report"
    else:
        return jsonify({"error": "Invalid report type"}), 400

    logs = BehaviorLog.query.filter(
        BehaviorLog.student_id == student_id,
        BehaviorLog.timestamp >= start_date,
        BehaviorLog.timestamp <= end_date
    ).order_by(BehaviorLog.timestamp.asc()).all()

    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Report Header
    pdf.chapter_title(title)
    pdf.chapter_body(f"Student: {student.first_name} {student.last_name}")
    pdf.chapter_body(f"Grade: {student.grade or 'N/A'}")
    pdf.chapter_body(f"Campus ID: {student.campus_id or 'N/A'}")
    pdf.chapter_body(f"Report Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    pdf.chapter_body(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    pdf.ln(10)

    if not logs:
        pdf.section_title("Summary")
        pdf.chapter_body("No behavior incidents recorded for this period.")
    else:
        # Summary Statistics
        pdf.section_title("Summary Statistics")
        total_incidents = len(logs)
        total_duration = sum(log.duration for log in logs if log.duration)
        avg_duration = total_duration / total_incidents if total_incidents > 0 else 0
        avg_intensity = sum(log.intensity for log in logs if log.intensity) / total_incidents if total_incidents > 0 else 0
        
        pdf.chapter_body(f"Total Incidents: {total_incidents}")
        pdf.chapter_body(f"Total Duration: {total_duration:.2f} seconds")
        pdf.chapter_body(f"Average Duration: {avg_duration:.2f} seconds")
        pdf.chapter_body(f"Average Intensity: {avg_intensity:.1f}/5")
        pdf.ln(5)

        # Behavior Frequency Analysis
        behavior_counts = {}
        for log in logs:
            if log.behavior:
                behavior_counts[log.behavior] = behavior_counts.get(log.behavior, 0) + 1
        
        if behavior_counts:
            pdf.section_title("Most Frequent Behaviors")
            sorted_behaviors = sorted(behavior_counts.items(), key=lambda x: x[1], reverse=True)
            for behavior, count in sorted_behaviors[:5]:  # Top 5 behaviors
                pdf.chapter_body(f"• {behavior}: {count} incidents")
            pdf.ln(5)

        # Detailed Incident Log
        pdf.section_title("Detailed Incident Log")
        
        # Table header
        pdf.add_table_row(["Date", "Behavior", "Duration", "Intensity", "Antecedent", "Consequence"], is_header=True)
        
        for log in logs:
            date_str = log.timestamp.strftime("%m/%d/%Y") if log.timestamp else "N/A"
            behavior_str = log.behavior[:15] if log.behavior else "N/A"
            duration_str = f"{log.duration:.1f}s" if log.duration else "N/A"
            intensity_str = str(log.intensity) if log.intensity else "N/A"
            antecedent_str = log.antecedent[:15] if log.antecedent else "N/A"
            consequence_str = log.consequence[:15] if log.consequence else "N/A"
            
            pdf.add_table_row([date_str, behavior_str, duration_str, intensity_str, antecedent_str, consequence_str])

        # Recommendations Section
        pdf.ln(10)
        pdf.section_title("Recommendations")
        if avg_intensity > 3:
            pdf.chapter_body("• High intensity behaviors observed. Consider reviewing intervention strategies.")
        if total_incidents > 10:
            pdf.chapter_body("• Frequent incidents noted. Recommend functional behavior assessment.")
        if avg_duration > 60:
            pdf.chapter_body("• Long duration behaviors observed. Consider de-escalation techniques.")
        
        pdf.chapter_body("• Continue monitoring and data collection for trend analysis.")
        pdf.chapter_body("• Review and update behavior intervention plan as needed.")

    # Generate PDF in memory
    pdf_output = io.BytesIO()
    pdf_string = pdf.output(dest='S').encode('latin-1')
    pdf_output.write(pdf_string)
    pdf_output.seek(0)

    filename = f"{student.first_name}_{student.last_name}_{report_type}_report_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return send_file(
        pdf_output,
        as_attachment=True,
        download_name=filename,
        mimetype='application/pdf'
    )

@reports_bp.route("/available-reports", methods=["GET"])
def available_reports():
    """Get available report types"""
    return jsonify({
        "reportTypes": [
            {"value": "weekly", "label": "Weekly Report"},
            {"value": "9-week", "label": "9-Week Report"},
            {"value": "semester", "label": "Semester Report"}
        ]
    })

@reports_bp.route("/report-preview", methods=["GET"])
def report_preview():
    """Get a preview of report data without generating PDF"""
    student_id = request.args.get("studentId")
    report_type = request.args.get("reportType")

    if not student_id or not report_type:
        return jsonify({"error": "Missing studentId or reportType"}), 400

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    end_date = datetime.utcnow()
    if report_type == "weekly":
        start_date = end_date - timedelta(weeks=1)
    elif report_type == "9-week":
        start_date = end_date - timedelta(weeks=9)
    elif report_type == "semester":
        start_date = end_date - timedelta(weeks=18)
    else:
        return jsonify({"error": "Invalid report type"}), 400

    logs = BehaviorLog.query.filter(
        BehaviorLog.student_id == student_id,
        BehaviorLog.timestamp >= start_date,
        BehaviorLog.timestamp <= end_date
    ).order_by(BehaviorLog.timestamp.desc()).all()

    # Calculate summary statistics
    total_incidents = len(logs)
    total_duration = sum(log.duration for log in logs if log.duration)
    avg_duration = total_duration / total_incidents if total_incidents > 0 else 0
    avg_intensity = sum(log.intensity for log in logs if log.intensity) / total_incidents if total_incidents > 0 else 0

    # Behavior frequency analysis
    behavior_counts = {}
    for log in logs:
        if log.behavior:
            behavior_counts[log.behavior] = behavior_counts.get(log.behavior, 0) + 1

    return jsonify({
        "student": student.to_dict(),
        "reportType": report_type,
        "dateRange": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "summary": {
            "totalIncidents": total_incidents,
            "totalDuration": total_duration,
            "averageDuration": avg_duration,
            "averageIntensity": avg_intensity
        },
        "behaviorFrequency": behavior_counts,
        "recentLogs": [log.to_dict() for log in logs[:10]]  # Last 10 logs for preview
    })

