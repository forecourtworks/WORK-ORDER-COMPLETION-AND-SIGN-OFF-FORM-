# FORECOURT WORKS LTD – Digital Technical Service Work Order App

A mobile-first, browser-based interactive Work Order application that replaces paper documentation for fuel systems maintenance (dispensers, UST/AST, piping, generators, etc.).

## Features

- **Calendar & Clock** – Native date/time pickers for all date and time fields.
- **GPS Auto-Address** – One-tap capture of current location with reverse geocoding (OpenStreetMap Nominatim).
- **Smart Auto-Population** – After entering Work Type + Equipment Category, the app pre-fills:
  - Job Hazard Analysis (typical hazards + controls for that work)
  - Scope of Work & Deliverables
  - Work Done & Findings narrative
  - Quality Control test table
  - Spare Parts list with warranty dates
  - Recommendations
  - Final Status statement & Technician declaration
  - Client acceptance wording  
  All auto-filled fields remain **fully editable**. A **Confirm** button on each section forces the technician to review before progressing.
- **Photos / Evidence** – Native camera capture + file attachment. Multiple images supported; embedded in the generated PDF.
- **Digital Signatures** – Finger/stylus drawing pads for Lead Technician, Assisting Technician and Site Representative.
- **Compulsory Field Guardrails** – Validation before advancing and before PDF generation (Client, Site, Equipment, Work Type, Problem, Lead Tech, Final Status, Tech & Client signatures).
- **Professional PDF Export** – Multi-page A4 PDF matching the paper Work Order structure (Parts A–I), with company branding, controlled-document footers and embedded signatures/photos.
- **Share** – Uses the Web Share API where available (WhatsApp, Email, Files, etc.) or falls back to download.
- **Draft Save** – Saves form state + photos to the device’s localStorage so work can be resumed.

## How to Use

1. Open `index.html` in a modern mobile or desktop browser (Chrome, Safari, Edge recommended).
2. For production, host the folder on any static web server (HTTPS required for GPS, camera and Web Share on most devices).
3. Fill Step 1 (Job & Equipment Basics) → tap **Auto-Populate Technical Sections & Continue**.
4. Walk through each subsequent step, review auto-filled content, edit if needed, then tap **Confirm**.
5. Capture photos and collect signatures.
6. On the final step, **Generate Professional PDF** then **Share / Download**.

## Technical Notes

- Pure HTML + CSS + vanilla JavaScript (no build step).
- Libraries loaded via CDN: Signature Pad, html2canvas, jsPDF.
- Works offline for form filling after first load (PDF generation and reverse-geocode need network).
- Best experienced on a phone or tablet in the field.

## Branding

Company: **FORECOURT WORKS LTD**  
Tagline: Fueling Systems: Installation, Repair, Routine Maintenance, Calibration, and Regulatory Compliance Inspections.

---

© Forecourt Works Ltd – Controlled Document System
