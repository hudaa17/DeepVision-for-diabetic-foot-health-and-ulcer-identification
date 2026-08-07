import os
import uuid
import tempfile
from typing import Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.report import Report
from app.models.prediction import Prediction
from app.models.patient import Patient
from app.models.image import Image
from app.services.storage import storage_service
from app.services.audit_service import audit_service

# ReportLab flowables and styling
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

import logging

logger = logging.getLogger(__name__)

class ReportService:
    async def generate_pdf_report(
        self, 
        db: AsyncSession, 
        prediction_id: uuid.UUID, 
        doctor_notes: Optional[str], 
        current_user: Any,
        ip: Optional[str] = None
    ) -> Report:
        """Asynchronously create a professional PDF clinical report and store it."""
        # 1. Fetch prediction and related data
        pred_result = await db.execute(select(Prediction).filter(Prediction.id == prediction_id))
        prediction = pred_result.scalars().first()
        if not prediction or prediction.status != "completed":
            raise ValueError("Prediction record is missing or not fully completed.")
            
        img_result = await db.execute(select(Image).filter(Image.id == prediction.image_id))
        image = img_result.scalars().first()
        
        patient_result = await db.execute(select(Patient).filter(Patient.id == prediction.patient_id))
        patient = patient_result.scalars().first()
        
        if not patient or not image:
            raise ValueError("Related patient or image records are missing.")

        # Check if report already exists for this prediction
        rep_result = await db.execute(select(Report).filter(Report.prediction_id == prediction_id))
        existing_report = rep_result.scalars().first()
        if existing_report:
            # Update notes and return existing report
            existing_report.doctor_notes = doctor_notes
            db.add(existing_report)
            await db.commit()
            await db.refresh(existing_report)
            await audit_service.log_report_download(db, current_user, prediction_id, existing_report.id, ip)
            return existing_report

        # 2. Setup local temp files to download image assets for PDF building
        with tempfile.TemporaryDirectory() as temp_dir:
            orig_local = os.path.join(temp_dir, "original.png")
            heatmap_local = os.path.join(temp_dir, "heatmap.png")
            
            # Download files from storage
            orig_bytes = await storage_service.download_file(image.storage_key)
            with open(orig_local, "wb") as f:
                f.write(orig_bytes)
                
            heatmap_bytes = await storage_service.download_file(prediction.heatmap_storage_key)
            with open(heatmap_local, "wb") as f:
                f.write(heatmap_bytes)

            # Define PDF storage details
            pdf_filename = f"report_{prediction_id}.pdf"
            pdf_storage_key = f"reports/{patient.id}/{pdf_filename}"
            pdf_local_path = os.path.join(temp_dir, pdf_filename)

            # 3. Build the PDF Report using ReportLab
            doc = SimpleDocTemplate(
                pdf_local_path,
                pagesize=letter,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=36
            )
            
            styles = getSampleStyleSheet()
            
            # Custom styles
            title_style = ParagraphStyle(
                "ReportTitle",
                parent=styles["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=22,
                textColor=colors.HexColor("#1A365D"),
                spaceAfter=15
            )
            
            section_heading = ParagraphStyle(
                "SectionHeading",
                parent=styles["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=14,
                textColor=colors.HexColor("#2B6CB0"),
                spaceBefore=10,
                spaceAfter=8,
                keepWithNext=True
            )
            
            body_style = ParagraphStyle(
                "ReportBody",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=10,
                leading=14,
                textColor=colors.HexColor("#2D3748")
            )
            
            bold_label = ParagraphStyle(
                "BoldLabel",
                parent=body_style,
                fontName="Helvetica-Bold"
            )

            story = []

            # Document Title
            story.append(Paragraph("Diabetic Foot Ulcer Risk Assessment Report", title_style))
            story.append(Spacer(1, 0.1 * inch))

            # Patient & Report Metadata Table
            meta_data = [
                [Paragraph("Patient Code:", bold_label), Paragraph(patient.patient_code, body_style),
                 Paragraph("Report Date:", bold_label), Paragraph(datetime.now().strftime("%Y-%m-%d %H:%M"), body_style)],
                [Paragraph("Date of Birth:", bold_label), Paragraph(str(patient.date_of_birth or "N/A"), body_style),
                 Paragraph("Gender:", bold_label), Paragraph(patient.gender or "N/A", body_style)],
                [Paragraph("Phone:", bold_label), Paragraph(patient.phone or "N/A", body_style),
                 Paragraph("Assessment ID:", bold_label), Paragraph(str(prediction_id)[:8], body_style)]
            ]
            meta_table = Table(meta_data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
            meta_table.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(meta_table)
            story.append(Spacer(1, 0.2*inch))

            # Risk Classification Results Table
            story.append(Paragraph("AI Diagnostic Summary", section_heading))
            risk_color = "#38A169" if prediction.risk_level == "normal" else "#DD6B20" if prediction.risk_level == "mild" else "#E53E3E"
            
            risk_label_style = ParagraphStyle(
                "RiskLabel",
                parent=body_style,
                fontName="Helvetica-Bold",
                textColor=colors.HexColor(risk_color),
                fontSize=12
            )
            
            diag_data = [
                [Paragraph("Predicted Risk Level:", bold_label), Paragraph(prediction.risk_level.upper(), risk_label_style)],
                [Paragraph("Model Confidence:", bold_label), Paragraph(f"{prediction.confidence_score * 100:.2f}%", body_style)],
                [Paragraph("Probability Distribution:", bold_label), 
                 Paragraph(f"Normal: {prediction.probability_normal*100:.1f}% | Mild: {prediction.probability_mild*100:.1f}% | Severe: {prediction.probability_severe*100:.1f}%", body_style)]
            ]
            diag_table = Table(diag_data, colWidths=[2.0*inch, 5.0*inch])
            diag_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F7FAFC")),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E0")),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
            ]))
            story.append(diag_table)
            story.append(Spacer(1, 0.2*inch))

            # Images Section (Original Image and Grad-CAM side by side)
            story.append(Paragraph("Clinical Image Analysis", section_heading))
            
            # Resize images to fit side by side inside printable width (7.0 inches)
            img_w, img_h = 3.3 * inch, 2.5 * inch
            try:
                rl_orig = RLImage(orig_local, width=img_w, height=img_h)
                rl_heat = RLImage(heatmap_local, width=img_w, height=img_h)
                
                img_table_data = [
                    [rl_orig, rl_heat],
                    [Paragraph("Uploaded Foot Image", bold_label), Paragraph("Explainability Heatmap (Grad-CAM)", bold_label)]
                ]
                img_table = Table(img_table_data, colWidths=[3.5*inch, 3.5*inch])
                img_table.setStyle(TableStyle([
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ]))
                story.append(img_table)
            except Exception as img_err:
                logger.error(f"Failed to place images in ReportLab PDF: {img_err}")
                story.append(Paragraph("[Image loading failed - refer to app predictions history]", body_style))
                
            story.append(Spacer(1, 0.2*inch))

            # Recommendations
            story.append(Paragraph("Structured Care Guidelines", section_heading))
            recs = prediction.recommendations or {}
            actions = recs.get("actions", [])
            urgency = recs.get("urgency", "low").upper()
            follow_up = recs.get("follow_up", "")

            rec_story = []
            rec_story.append(Paragraph(f"<b>Urgency Level:</b> {urgency} | <b>Follow-up:</b> {follow_up}", body_style))
            rec_story.append(Spacer(1, 0.05*inch))
            for act in actions:
                rec_story.append(Paragraph(f"• {act}", body_style))
                
            rec_table = Table([[rec_story]], colWidths=[7.0*inch])
            rec_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
            ]))
            story.append(rec_table)
            story.append(Spacer(1, 0.25*inch))

            # Clinician Notes
            story.append(Paragraph("Clinician Notes & Observations", section_heading))
            notes_p = Paragraph(doctor_notes or "No clinician notes have been added to this assessment.", body_style)
            notes_table = Table([[notes_p]], colWidths=[7.0*inch])
            notes_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFDF5")),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#FEEBC8")),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
            ]))
            story.append(notes_table)

            # Build document
            doc.build(story)

            # 4. Upload generated PDF to storage service
            with open(pdf_local_path, "rb") as f:
                pdf_data = f.read()
                
            await storage_service.upload_file(
                file_data=pdf_data,
                storage_key=pdf_storage_key,
                content_type="application/pdf"
            )

        # 5. Save Report record to DB
        db_report = Report(
            prediction_id=prediction_id,
            patient_id=prediction.patient_id,
            report_storage_key=pdf_storage_key,
            doctor_notes=doctor_notes
        )
        db.add(db_report)
        await db.commit()
        await db.refresh(db_report)

        await audit_service.log_report_download(db, current_user, prediction_id, db_report.id, ip)
        return db_report

    async def get_report_by_prediction(self, db: AsyncSession, prediction_id: uuid.UUID) -> Optional[Report]:
        """Fetch report database record by prediction ID."""
        result = await db.execute(select(Report).filter(Report.prediction_id == prediction_id))
        return result.scalars().first()

report_service = ReportService()
