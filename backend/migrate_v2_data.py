"""
Route Your Career V2 one-time migration.

What it does:
- Preserves existing MongoDB records.
- Upserts universities instead of blindly inserting duplicates.
- Creates separate Course records linked by university_id.
- Imports:
  * 13 Georgia medical universities
  * 3 Uzbekistan medical universities
  * Italy universities found in the existing Italy course database
  * 402 Italy Bachelor/Master course rows
- Safe to run more than once.

Run from the backend directory:
    python migrate_v2_data.py
"""

import os
import re
import uuid
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

GEORGIA = [('ALTE University', 'Tbilisi', 5950, '6 years', 'English'), ('Avicenna - Batumi Medical University', 'Batumi', None, '6 years', 'English'), ('Caucasus International University', 'Tbilisi', 6000, '6 years', 'English'), ('Caucasus University', 'Tbilisi', None, '6 years', 'English'), ('David Tvildiani Medical University', 'Tbilisi', None, '6 years', 'English'), ('East European University', 'Tbilisi', 5500, '6 years', 'English'), ('European University', 'Tbilisi', 6500, '6 years', 'English'), ('Georgian National University - SEU', 'Tbilisi', None, '6 years', 'English'), ('New Vision University', 'Tbilisi', 7000, '6 years', 'English'), ('Petre Shotadze Tbilisi Medical Academy', 'Tbilisi', 7000, '6 years', 'English'), ('Tbilisi State Medical University', 'Tbilisi', None, '6 years', 'English'), ('University of Georgia', 'Tbilisi', 6500, '6 years', 'English'), ('Akaki Tsereteli State University', 'Kutaisi', None, '6 years', 'English')]
UZBEKISTAN = [('Andijan State Medical Institute', 'Andijan', 3500, '6 years', 'English'), ('Samarkand State Medical University', 'Samarkand', None, '6 years', 'English'), ('Karakalpakstan Medical Institute', 'Nukus', 3500, '6 years', 'English')]
ITALY_COURSES = [{'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Applied Computer Science and Artificial Intelligence'}, {'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Sustainable Building Engineering'}, {'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Classics'}, {'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Global Humanities'}, {'university': 'University of Macerata', 'level': 'Bachelor', 'course': 'International, European and Comparative Legal Studies'}, {'university': 'University of Pavia', 'level': 'Bachelor', 'course': 'Artificial Intelligence'}, {'university': 'University of Turin', 'level': 'Bachelor', 'course': 'Business & Management'}, {'university': 'University of Turin', 'level': 'Bachelor', 'course': 'Global Law and Transnational Legal Studies'}, {'university': 'University of Pisa', 'level': 'Bachelor', 'course': 'Management for Business and Economics'}, {'university': 'University of Camerino', 'level': 'Bachelor', 'course': 'Biosciences and Biotechnology'}, {'university': 'University of Tor vergata', 'level': 'Bachelor', 'course': 'Business Administration & Economics 2 curriculum- Economics and Business Administration'}, {'university': 'University of Tor vergata', 'level': 'Bachelor', 'course': 'Global Governance'}, {'university': 'University of Polito', 'level': 'Bachelor', 'course': 'ELECTRONIC AND COMMUNICATIONS ENGINEERING'}, {'university': 'University of Polito', 'level': 'Bachelor', 'course': 'Architecture'}, {'university': 'University of Polito', 'level': 'Bachelor', 'course': 'Automotive Engineering'}, {'university': 'University of Polito', 'level': 'Bachelor', 'course': 'Computer Engineering'}, {'university': 'University of Polito', 'level': 'Bachelor', 'course': 'Mechanical Engineering'}, {'university': 'University of Cassino', 'level': 'Bachelor', 'course': 'Economics with Data Science'}, {'university': 'University of Cassino', 'level': 'Bachelor', 'course': 'Economics and Business'}, {'university': 'University of Messina', 'level': 'Bachelor', 'course': 'Data Analysis'}, {'university': 'University of Messina', 'level': 'Bachelor', 'course': 'Political Sciences and International Relations'}, {'university': 'University of Messina', 'level': 'Bachelor', 'course': 'Marine Biology and Blue Biotechnologies'}, {'university': 'University of Messina', 'level': 'Bachelor', 'course': 'Transnational and European Legal Studies'}, {'university': 'University of Messina', 'level': 'Bachelor', 'course': 'Business Management'}, {'university': 'University of Messina', 'level': 'Bachelor', 'course': 'Civil Engineering'}, {'university': 'University of Milan', 'level': 'Bachelor', 'course': 'International Politics, Law and Economics'}, {'university': 'University of Venice', 'level': 'Bachelor', 'course': 'Business Administration and Management'}, {'university': 'University of Venice', 'level': 'Bachelor', 'course': 'Digital Management'}, {'university': 'University of Venice', 'level': 'Bachelor', 'course': 'Economics & Business-Curriculam Economics, Markets & Finance'}, {'university': 'University of Venice', 'level': 'Bachelor', 'course': 'Hospitality Innovation and e-Tourism'}, {'university': 'University of Venice', 'level': 'Bachelor', 'course': 'Philosophy, International and Economic Studies'}, {'university': 'University of Marche', 'level': 'Bachelor', 'course': 'Digital Economics and Business'}, {'university': 'University of NAPLES "Federico II"', 'level': 'Bachelor', 'course': 'Hospitality Management'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Building Construction Engineering'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Business and Economics- CLABE (Bologna Campus)'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Business Economics- Curriculum Financial and Business Management (Rimini Campus)'}, {'university': 'University of Tor vergata', 'level': 'Bachelor', 'course': 'Engineering Science'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Economics and Finance'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Economics of Tourism and Cities (old name: Economics of Tourism curriculum- International Tourism and Leisure Industries)'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Economics, Politics and Social Sciences'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Genomics (Bologna)'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'International Studies'}, {'university': 'University of Polito', 'level': 'Bachelor', 'course': 'Civil and Environmental Engineering'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Management and Economics- CLAME (Forlì Campus)'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Pharmacy (Rimini)'}, {'university': 'University of Bologna', 'level': 'Bachelor', 'course': 'Statistical Sciences Curriculum Stats & Maths'}, {'university': 'University of Campania', 'level': 'Bachelor', 'course': 'Data Analytics'}, {'university': 'University of Cassino', 'level': 'Bachelor', 'course': 'Industrial Engineering Technology'}, {'university': 'University of Padova', 'level': 'Bachelor', 'course': 'Earth and Climate Dynamics'}, {'university': 'University of Padova', 'level': 'Bachelor', 'course': 'Animal Care'}, {'university': 'University of Padova', 'level': 'Bachelor', 'course': 'Biology of Human and Environmental Health'}, {'university': 'University of Padova', 'level': 'Bachelor', 'course': 'Information Engineering'}, {'university': 'University of Padova', 'level': 'Bachelor', 'course': 'Psychological Science'}, {'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Molecular Biology, Medicinal Chemistry and Computer Science for Pharmaceutical Applications'}, {'university': 'University of Trieste', 'level': 'Bachelor', 'course': 'Business Administration and Managment curricula Business and Management'}, {'university': 'University of Trieste', 'level': 'Bachelor', 'course': 'International Economics and Financial Markets curricula Economics and Financial Markets'}, {'university': 'University of Milan', 'level': 'Bachelor', 'course': 'Ancient Civilizations for The Contemporary World'}, {'university': 'University of Florence', 'level': 'Bachelor', 'course': 'Sustainable Business for Societal Challenges'}, {'university': 'University of NAPLES "Federico II"', 'level': 'Bachelor', 'course': 'Civil and Environmental Engineering'}, {'university': 'University of Pavia', 'level': 'Bachelor', 'course': 'Social Sciences for Global Challenges'}, {'university': 'University of Venice', 'level': 'Bachelor', 'course': 'Computer Science - Data Science Curriculum'}, {'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Business Sciences'}, {'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Economics and Finance'}, {'university': 'Free University of Bozen-Bolzano', 'level': 'Bachelor', 'course': 'All'}, {'university': 'University of Siena', 'level': 'Bachelor', 'course': 'Biotech Engineering for Health'}, {'university': 'University of Siena', 'level': 'Bachelor', 'course': 'Economics and Management'}, {'university': 'University Of Milano Bicocca', 'level': 'Bachelor', 'course': 'Physical Sciences for Advanced Technologies'}, {'university': 'University Of Milano Bicocca', 'level': 'Bachelor', 'course': 'Economics and Science for Environmental Sustainability'}, {'university': 'University of Parma', 'level': 'Bachelor', 'course': 'Global studies for sustainable local and international development and cooperation'}, {'university': 'University of Trento', 'level': 'Bachelor', 'course': 'Computer, Communications and Electronic Engineering'}, {'university': 'University of Trento', 'level': 'Bachelor', 'course': 'Computer Science'}, {'university': 'University of Turin', 'level': 'Bachelor', 'course': 'Economics and Finance with Data Science'}, {'university': 'University of Marche', 'level': 'Bachelor', 'course': 'Environmental Sciences and Civil Protection'}, {'university': 'University of NAPLES Parthenope', 'level': 'Bachelor', 'course': 'Business Economics'}, {'university': 'University of Perugia', 'level': 'Bachelor', 'course': 'Engineering management'}, {'university': 'University of Bari Aldo Moro', 'level': 'Bachelor', 'course': 'Earth System and Global Changes'}, {'university': 'University of Genova', 'level': 'Bachelor', 'course': 'Computer Engineering'}, {'university': 'University of NAPLES "Federico II"', 'level': 'Bachelor', 'course': 'Biology for One-Health'}, {'university': 'University of Padova', 'level': 'Bachelor', 'course': 'Economics, Governance and Decision-Making Old Name - Philosophy, Politics and Economics'}, {'university': 'University of Sapienza', 'level': 'Bachelor', 'course': 'Bioinformatics'}, {'university': 'University of Tor vergata', 'level': 'Bachelor', 'course': 'TOURISM SCIENCES (curriculum in English Innovation Tourism for Made in Italy)'}, {'university': 'University of Polimi', 'level': 'Bachelor', 'course': 'Engineering Science'}, {'university': 'University of Polimi', 'level': 'Bachelor', 'course': 'Industrial Engineering'}, {'university': 'University of Polimi', 'level': 'Bachelor', 'course': 'Process Engineering'}, {'university': 'University of Polimi', 'level': 'Bachelor', 'course': 'Architecture'}, {'university': 'University of Genova', 'level': 'Bachelor', 'course': 'MARITIME SCIENCE AND TECHNOLOGY'}, {'university': 'University of Messina', 'level': 'Bachelor', 'course': 'Heritage Innovation Engineering'}, {'university': 'University of Cassino', 'level': 'Bachelor', 'course': 'Computer Engineering'}, {'university': 'University of Trento', 'level': 'Bachelor', 'course': 'Economia and Management'}, {'university': 'University of Bocconi', 'level': 'Bachelor', 'course': 'Economics, Management and Computer Science'}, {'university': 'University of Teramo', 'level': 'Bachelor', 'course': 'Biotechnology'}, {'university': 'University of Cassino', 'level': 'Bachelor', 'course': 'Civil and Environmental Engineering'}, {'university': 'University of Polimi', 'level': 'Bachelor', 'course': 'Civil Engineering'}, {'university': 'University of Milan', 'level': 'Bachelor', 'course': 'Economics: Behavior, Data and Policy'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Artificial Intelligence and Robotics'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Business Management'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Chemical Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Control Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Data Science'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Economics'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Economics and Communication for Management and Innovation'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Electrical Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Electronics Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Engineering in Computer Science'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Finance and Insurance'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Health Economics'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Management Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Nanotechnology Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Statistical Methods and Applications'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Architecture - Urban regeneration'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Architecture (Conservation)'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Atmospheric Science & Technology for Meteorology & Climate'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Biochemistry'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Cognitive Neuroscience'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Computer Science'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Cultural Heritage in the Near and Middle East, and Africa'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Cybersecurity'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Design, Multimedia and Visual Communication'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Development and International Cooperation Sciences'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Energy Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'English and Anglo-American Studies'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Environmental Engineering for Climate Change Adaptation and Mitigation'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'European Studies'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Fashion Theory and Practices'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Genetics and Molecular Biology'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Landscape Architecture'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Mechanical Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Mediterranean Archeology'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Msc Environmental and Sustainable Building Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Physics'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Product and Service Design'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Science and Technology for the Conservation of Cultural Heritage'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Space and Astronautical Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Transport Systems Engineering'}, {'university': 'University of Macerata', 'level': 'Master', 'course': 'International Finance and Economics'}, {'university': 'University of Macerata', 'level': 'Master', 'course': 'International Relations'}, {'university': 'University of Macerata', 'level': 'Master', 'course': 'International tourism and destination management'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Civil Engineering for Mitigation of Risk from Natural Hazards'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Computer Engineering'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Electrical Engineering'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'World Politics and International Relations'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Electronic Engineering'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Industrial Automation Engineering'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Molecular Biology and Genetics'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'The Ancient Mediterranean World (History Archaeology and Art)'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Psychology, Neuroscience and Human Sciences'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'International Business and Entrepreneurship'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Applied Mathematics'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Artificial Intelligence and Automation Engineering'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Biodiversity, Conservation and Environmental Quality'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Biotechnologies of Human Reproduction'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Chemistry'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Economics'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Electronics and Communications Engineering'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Engineering Management'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'European Studies'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Finance'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Genetic Counsellors'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'International Accounting and Management'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Language and Mind: Linguistics and cognitive studies'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Medical Biotechnologies'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Public and Cultural Diplomacy'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Business Administration'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'European Legal Studies'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Scienze animali (curriculum in Animal nutrition and feed safety) (Animal Science)'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Area and Global Studies for International Cooperation'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Cellular and Molecular Biology'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Economics'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Quantitative Finance and Insurance'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Scienze viticole ed enologiche (International curriculum) (Viticulture and Enalogy Sciences)'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Material Sciences'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Molecular Biotechnology'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Filosofia (International curriculum) (Philosophy)'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Stochastics and Data Science'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'English and American Studies'}, {'university': 'University of Brescia', 'level': 'Master', 'course': 'Analytics and Data Science for Economics and Management'}, {'university': 'University of Brescia', 'level': 'Master', 'course': 'Civil and Environmental Engineering'}, {'university': 'University of Brescia', 'level': 'Master', 'course': 'Communication Technologies and Multimedia'}, {'university': 'University of Bologna', 'level': 'Master', 'course': 'Advanced Cosmetic Sciences (Rimini)'}, {'university': 'University of Bologna', 'level': 'Master', 'course': 'Aerospace Engineering'}, {'university': 'University of Bologna', 'level': 'Master', 'course': 'Applied Economics and Markets'}, {'university': 'University of Bologna', 'level': 'Master', 'course': 'Archaeology and Cultures of the Ancient World CURRICULUM in Applied Critical Archaeology and Heritage'}, {'university': 'University of Bologna', 'level': 'Master', 'course': 'Architecture and Creative Practices for the City and Landscape'}, {'university': 'University of Venice', 'level': 'Master', 'course': 'Comparative International Relations'}, {'university': 'University of Bologna', 'level': 'Master', 'course': 'Astrophysics and Cosmology'}, {'university': 'University of Venice', 'level': 'Master', 'course': 'Computer Science and Information Technology'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Nuclear Engineering'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Artificial Intelligence and Data Engineering'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Computer Engineering'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Cybersecurity'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Computer Science and Networking'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Computer Science'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'BIONICS ENGINEERING'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Economics'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Applied and Exploration Geophysics'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Materials and Nanotechnology'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Neuroscience'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Data Science and Business Informatics'}, {'university': 'University of Camerino', 'level': 'Master', 'course': 'Biological Sciences'}, {'university': 'University of Camerino', 'level': 'Master', 'course': 'Chemistry and Advanced Chemical Methodologies'}, {'university': 'University of Camerino', 'level': 'Master', 'course': 'Computer Science'}, {'university': 'University of Camerino', 'level': 'Master', 'course': 'Geoenviromental Resources and Risks'}, {'university': 'University of Camerino', 'level': 'Master', 'course': 'Mathematics and Appplications'}, {'university': 'University of Camerino', 'level': 'Master', 'course': 'Physics'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'European Economy and Business Law'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Economics'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Finance and Banking'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Mechatronics Engineering'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Sport and Health Promotion Old Name- Physical Activity and Health Promotion'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'ICT & Internet Engineering'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Art History in Rome, from Late Antiquity to the Present'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Tourism Strategy, Cultural Heritage and Made in Italy'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Business Administration'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'BIOTECHNOLOGY FOR INDUSTRY AND HEALTH'}, {'university': 'University of Venice', 'level': 'Master', 'course': 'Conservation Science and Technology for Cultural Heritage'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Advanced Molecular Sciences'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Architettura (curriculum "Architectural design")'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Design of Sustainable Tourism Systems'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Economics and Development'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Finance and risk management'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Geoengineering'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Geography, Spatial Management, Heritage for International Cooperation'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Mechanical Engineering for Sustainability'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Natural Resources Management for Tropical Rural Development'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Architecture Construction City'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Architecture for Sustainability'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Architecture for Heritage'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Urban and Territorial Planning'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'BUILDING ENGINEERING'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'DIGITAL SKILLS FOR SUSTAINABLE SOCIETAL TRANSITIONS'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Automotive Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Communications Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Data Science and Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'ICT Engineering for Smart Societies'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Civil Engineering.'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Electronic Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Energy and Nuclear Engineeing'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Management Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Computer Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Mechanical Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Environmental and Land Engineering.'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Mechatronic Engineering'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Physics of Complex Systems'}, {'university': 'University of Siena', 'level': 'Master', 'course': 'Sustainable Industrial Pharmaceutical Biotechnology'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'International Management'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'Physics'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'Advanced Automotive Engineering The programme includes seven curricula: • Advanced Motorcycle Engineering • Advanced Powertrain- Bologna • Advanced Powertrain- Modena • Advanced Sportscar Manufacturing • High Performance Car Design • Off-Highway Vehicle Engineering • Racing Car Design (in collaboration with the Universities of Bologna, Ferrara, and Parma)'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'Sustainable Industrial Engineering'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'DIGITAL AUTOMATION ENGINEERING'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'Languages for Communication in International Enterprises and Organisations'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'Electronics Engineering'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Comparative European and Non-European Languages and Literatures'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Biology for Translational Research and Precision Medicine'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Computer Engineering for Intelligent Systems (old name: Computer Engineering for Robotics and Smart Industry)'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Artificial Intelligence'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Data Science'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Economics and Data Analysis'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'International Economics and Business'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'International Economics and Business'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Mathematics'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Medical Bioinformatics'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Molecular and Medical Biotechnology'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Linguistics'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Applied Economics'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Astrophysics and Cosmology'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Biotechnologies for Food Science'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Business Administration'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Chemical and Process Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Computer Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Computer Science'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Control Systems Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Cybersecurity'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Data Science'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Earth Dynamics'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Electronic Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Energy Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Environmental Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Food and Health'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Forest Science'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'ICT for Internet and Multimedia'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Management Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Materials Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Mathematical Engineering'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Medical Biotechnologies'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Molecular Biology'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Physics'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Sustainable Agriculture'}, {'university': 'University of Padua', 'level': 'Master', 'course': 'Water and Geological Risk Engineering'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Bioinformatics for Computational Genomics'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Biotechnology for the Bioeconomy'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Data Science for Economics'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Environmental and Food Economics'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Environmental Change and Global Sustainability'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Finance and Economics'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Industrial Chemistry'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'International Relations'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Law and Sustainable Development'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Medical Biotechnology and Molecular Medicine'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Molecular Biology of the Cell'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Molecular Biotechnology and Bioinformatics'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Pharmaceutical Biotechnology'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Politics, Philosophy and Public Affairs'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Quantitative Biology'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Safety Assessment of Xenobiotics and Biotechnological Products'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Sustainable Development'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Artificial Intelligence Systems'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Cellular and Molecular Biotechnology'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Computer Science'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Data Science'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Economics'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Environmental Engineering'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'European and International Studies'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Human-Computer Interaction'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Innovation Management'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'International Management'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Mathematics'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Mechatronics Engineering'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Physics'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Quantitative and Computational Biology'}, {'university': 'University of Trento', 'level': 'Master', 'course': 'Sociology and Social Research'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Bioengineering'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Computer Science'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Energy Engineering'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Engineering for Natural Risk Management'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Environmental Engineering'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Internet and Multimedia Engineering'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Management Engineering'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Robotics Engineering'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Safety Engineering for Transport, Logistics and Production'}, {'university': 'University of Genoa', 'level': 'Master', 'course': 'Naval Architecture and Marine Engineering'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Communication Engineering'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Electronic Engineering'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Engineering for the Food Industry'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Environmental and Land Management Engineering'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Food Safety and Food Risk Management'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'International Business and Development'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Language Sciences and Cultural Studies for Special Needs'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Advanced Automotive Engineering'}, {'university': 'University of Ferrara', 'level': 'Master', 'course': 'Economics, Management and Policies for Global Challenges'}, {'university': 'University of Ferrara', 'level': 'Master', 'course': 'Physics'}, {'university': 'University of Ferrara', 'level': 'Master', 'course': 'Biotechnology for Human Health'}, {'university': 'University of Ferrara', 'level': 'Master', 'course': 'Green Economy and Sustainability'}, {'university': 'University of Ferrara', 'level': 'Master', 'course': 'Innovation Design'}, {'university': 'University of Ferrara', 'level': 'Master', 'course': 'Small Business Management in International Markets'}, {'university': 'University of Cassino', 'level': 'Master', 'course': 'Economics and Entrepreneurship'}, {'university': 'University of Modena', 'level': 'Master', 'course': 'ENERGY ENGINEERING'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Environmental Engineering for Risk Mitigation'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Functional and sustainable materials'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Advanced molecular sciences for health products'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Data science for management'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Economics and Management of Sustainable Food System'}, {'university': 'University of NAPLES "Federico II"', 'level': 'Master', 'course': 'Sustainable food systems'}, {'university': 'University of NAPLES Parthenope', 'level': 'Master', 'course': 'Marketing & International Management  (Two curriculum Innovation and the curriculum Entrepreneurship)'}, {'university': 'University of Marche', 'level': 'Master', 'course': 'Data science for Finance and Economics'}, {'university': 'University of Marche', 'level': 'Master', 'course': 'Environmental Hazard and Disaster Risk Management'}, {'university': 'University of Marche', 'level': 'Master', 'course': 'Marine Biology'}, {'university': 'University of Milan', 'level': 'Master', 'course': 'Cultural, Intellectual and Visual History'}, {'university': 'University of Eastern Piedmont', 'level': 'Master', 'course': 'Management and Finance curriculum in Finance'}, {'university': 'University of Eastern Piedmont', 'level': 'Master', 'course': 'Disaster and Health Crisis Management'}, {'university': 'University of Tor vergata', 'level': 'Master', 'course': 'Management Engineering (English curriculum in Technologies and New Frontiers Management)'}, {'university': 'University of NAPLES Parthenope', 'level': 'Master', 'course': 'Business Economics'}, {'university': 'University of NAPLES Parthenope', 'level': 'Master', 'course': 'Management Engineering'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'Geology for energy resources'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'Agricultural and environmental biotechnology'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'Medical, veterinary and forensic biotechnological sciences'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'Quantitative Finance And Data Science For Economics'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'International Relations (LM-52)'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'Earth Sciences for Risk and Environmental Management (LM-74) Curriculum: Geosciences for Environmental Sustainability'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'Administration, Finance and Control (LM-77) Curriculum: Accounting & Business administration'}, {'university': 'University of Perugia', 'level': 'Master', 'course': 'Economics And Management'}, {'university': 'Polytechnic University of Bari', 'level': 'Master', 'course': 'Automation Engineering'}, {'university': 'Polytechnic University of Bari', 'level': 'Master', 'course': 'Computer Science Engineering'}, {'university': 'Polytechnic University of Bari', 'level': 'Master', 'course': 'Telecommunication Engineering'}, {'university': 'Polytechnic University of Bari', 'level': 'Master', 'course': 'Industrial Design'}, {'university': 'Polytechnic University of Bari', 'level': 'Master', 'course': 'Mechanical Engineering'}, {'university': 'University of Tuscia', 'level': 'Master', 'course': 'Archival Science and Artificial Intelligence'}, {'university': 'University of Bari Aldo Moro', 'level': 'Master', 'course': 'Materials Science and Tecnology'}, {'university': 'University of Messina', 'level': 'Master', 'course': 'Quantitative Methods for Finance'}, {'university': 'University of Messina', 'level': 'Master', 'course': 'Civil Engineering (Curriculum in Engineering for Water-related Risks)'}, {'university': 'University of Messina', 'level': 'Master', 'course': 'Physics: Material Physics and Devices'}, {'university': 'University of Cassino', 'level': 'Master', 'course': 'Sport Management - Curriculum Sport Event Management'}, {'university': 'University of Pavia', 'level': 'Master', 'course': 'Geosciences for Sustainable Development Curriculum in Geosciences for Energy, Mineral and Water Resources'}, {'university': 'University of Polimi', 'level': 'Master', 'course': 'Computer Science and Engineering With Artificial Intelligence'}, {'university': 'University of Polimi', 'level': 'Master', 'course': 'Industrial Safety and Risk Engineering'}, {'university': 'University of Polimi', 'level': 'Master', 'course': 'Building Engineering for Sustainability'}, {'university': 'University Of Milano Bicocca', 'level': 'Master', 'course': 'Mathematics'}, {'university': 'University of Turin', 'level': 'Master', 'course': 'Artificial Intelligence and High Performance Computing Technologies'}, {'university': 'University of Florence', 'level': 'Master', 'course': 'Physical and Astrophysical Sciences'}, {'university': 'University of Venice', 'level': 'Master', 'course': 'Environmental Engineering for the Green Transition'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Chemical and Sustainable Processes Engineering 3 Curriculum 1. Biotechnological-food 2. Process design and development 3. Sustainability of processes and products in the chemical industry'}, {'university': 'University of Polito', 'level': 'Master', 'course': 'Electrical Engineering'}, {'university': 'University of Sapienza', 'level': 'Master', 'course': 'Telecommunication Engineering'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'Communication Engineering'}, {'university': 'University of Pisa', 'level': 'Master', 'course': 'DIGITAL INTELLIGENCE AND CHANGE MANAGEMENT'}, {'university': 'University of Polimi', 'level': 'Master', 'course': 'Architectural Engineering (Lecco)'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Languages for Global Business, Trade and Tourism'}, {'university': 'University of Verona', 'level': 'Master', 'course': 'Viticulture, enology and wine marketing'}, {'university': 'University of Messina', 'level': 'Master', 'course': 'Mechanical Engineering - Curriculum Mechanical Engineering and Innovation'}, {'university': 'University of Messina', 'level': 'Master', 'course': 'Global Security Studies'}, {'university': 'University of NAPLES "Federico II"', 'level': 'Master', 'course': 'Mechanical Engineering for Energy and Environmental- Curriculum "Sustainable Energy"'}, {'university': 'University of Parma', 'level': 'Master', 'course': 'Global food law: sustainability challenges and innovation'}, {'university': 'University of NAPLES "Federico II"', 'level': 'Master', 'course': 'Chemical Sciences'}]
ALIASES = {'University of Sapienza': 'Sapienza University of Rome', 'University of Tor vergata': 'University of Rome Tor Vergata', 'University of Polito': 'Politecnico di Torino', 'University of Polimi': 'Politecnico di Milano', 'University of Padova': 'University of Padua', 'University of NAPLES "Federico II"': 'University of Naples Federico II', 'University of NAPLES Parthenope': 'Parthenope University of Naples', 'University Of Milano Bicocca': 'University of Milano-Bicocca', 'University of Genova': 'University of Genoa', 'University of Bocconi': 'Bocconi University'}


def slugify(value):
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def canonical_university_name(name):
    return ALIASES.get(name, name).strip()


def legacy_university_defaults(name, country, city, stream):
    now = datetime.now(timezone.utc)
    return {
        "id": str(uuid.uuid4()),
        "stream": stream,
        "name": name,
        "slug": slugify(name),
        "country": country,
        "city": city,
        # Kept only for backward compatibility with the existing University model.
        "course": "MBBS" if stream == "MBBS" else "Management",
        "course_level": None,
        "duration": None,
        "medium": "English",
        "intake": None,
        "application_deadline": None,
        "currency": "USD" if stream == "MBBS" else "EUR",
        "tuition_fee_year": None,
        "hostel_fee_year": None,
        "food_fee_year": None,
        "first_year_total": None,
        "total_course_cost": None,
        "application_fee": None,
        "scholarship_info": None,
        "eligibility": None,
        "neet_requirement": None,
        "pcb_requirement": None,
        "internship": None,
        "recognition": None,
        "nmc_notes": None,
        "fmge_next_notes": None,
        "academic_requirement": None,
        "english_requirement": None,
        "ielts_requirement": None,
        "toefl_requirement": None,
        "gmat_gre_requirement": None,
        "work_experience": None,
        "specializations": [],
        "internship_opportunities": None,
        "placement_info": None,
        "post_study_opportunities": None,
        "overview": None,
        "accreditation": None,
        "ranking": None,
        "established_year": None,
        "campus": None,
        "hostel": None,
        "indian_food": None,
        "student_life": None,
        "climate": None,
        "airport_distance": None,
        "pros": [],
        "cons": [],
        "documents_required": [],
        "admission_process": [],
        "faqs": [],
        "website": None,
        "apply_link": None,
        "featured": False,
        "popular": False,
        "budget_option": False,
        "recommended": False,
        "status": "published",
        "seo_title": name,
        "meta_description": f"Explore {name} in {country}.",
        "keywords": [],
        "created_at": now,
        "updated_at": now,
        "published_at": now,
    }


async def find_university(db, name, country):
    # First match exact canonical name + country, then fall back to case-insensitive.
    doc = await db.universities.find_one(
        {"name": name, "country": country},
        {"_id": 0},
    )
    if doc:
        return doc

    doc = await db.universities.find_one(
        {
            "name": {"$regex": f"^{re.escape(name)}$", "$options": "i"},
            "country": {"$regex": f"^{re.escape(country)}$", "$options": "i"},
        },
        {"_id": 0},
    )
    return doc


async def upsert_university(db, name, country, city=None, stream="Management"):
    name = canonical_university_name(name)
    existing = await find_university(db, name, country)
    now = datetime.now(timezone.utc)

    if existing:
        updates = {
            "name": name,
            "country": country,
            "city": city or existing.get("city"),
            "updated_at": now,
        }

        # Keep compatibility fields populated for existing backend response model.
        if not existing.get("stream"):
            updates["stream"] = stream
        if not existing.get("course"):
            updates["course"] = "MBBS" if stream == "MBBS" else "Management"
        if not existing.get("slug"):
            updates["slug"] = slugify(name)
        if not existing.get("status"):
            updates["status"] = "published"

        await db.universities.update_one(
            {"id": existing["id"]},
            {"$set": updates},
        )
        return existing["id"], False

    doc = legacy_university_defaults(name, country, city, stream)
    await db.universities.insert_one(doc)
    return doc["id"], True


async def upsert_course(
    db,
    university_id,
    university_name,
    country,
    city,
    stream,
    name,
    level,
    duration=None,
    medium="English",
    currency="USD",
    tuition_fee_year=None,
    total_course_cost=None,
    intake=None,
    eligibility=None,
    neet_requirement=None,
    pcb_requirement=None,
    status="draft",
):
    now = datetime.now(timezone.utc)

    # Course identity is university + course name + level.
    existing = await db.courses.find_one(
        {
            "university_id": university_id,
            "name": {"$regex": f"^{re.escape(name)}$", "$options": "i"},
            "level": {"$regex": f"^{re.escape(level)}$", "$options": "i"},
        },
        {"_id": 0},
    )

    slug = slugify(f"{university_name}-{name}-{level}")

    core = {
        "university_id": university_id,
        "university_name": university_name,
        "country": country,
        "city": city,
        "stream": stream,
        "name": name,
        "slug": slug,
        "level": level,
        "duration": duration,
        "medium": medium,
        "currency": currency,
        "tuition_fee_year": tuition_fee_year,
        "total_course_cost": total_course_cost,
        "intake": intake,
        "application_deadline": None,
        "eligibility": eligibility,
        "neet_requirement": neet_requirement,
        "pcb_requirement": pcb_requirement,
        "academic_requirement": None,
        "english_requirement": None,
        "ielts_requirement": None,
        "gmat_gre_requirement": None,
        "work_experience": None,
        "featured": False,
        "recommended": False,
        "budget_option": False,
        "last_verified": None,
        "source_url": None,
        "status": status,
        "updated_at": now,
    }

    if existing:
        # Preserve admin-entered verification/source/matching fields.
        for field in [
            "last_verified",
            "source_url",
            "featured",
            "recommended",
            "budget_option",
            "application_deadline",
            "academic_requirement",
            "english_requirement",
            "ielts_requirement",
            "gmat_gre_requirement",
            "work_experience",
        ]:
            if existing.get(field) is not None:
                core[field] = existing.get(field)

        await db.courses.update_one(
            {"id": existing["id"]},
            {"$set": core},
        )
        return False

    doc = {
        **core,
        "id": str(uuid.uuid4()),
        "created_at": now,
        "published_at": now if status == "published" else None,
    }

    await db.courses.insert_one(doc)
    return True


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    university_created = 0
    university_reused = 0
    course_created = 0
    course_updated = 0

    print("\n=== ROUTE YOUR CAREER V2 MIGRATION ===\n")

    # -----------------------------------------------------
    # GEORGIA
    # -----------------------------------------------------
    print("Importing Georgia...")
    for name, city, fee, duration, medium in GEORGIA:
        uid, created = await upsert_university(
            db, name, "Georgia", city, "MBBS"
        )
        university_created += int(created)
        university_reused += int(not created)

        made = await upsert_course(
            db=db,
            university_id=uid,
            university_name=canonical_university_name(name),
            country="Georgia",
            city=city,
            stream="MBBS",
            name="General Medicine",
            level="Medical",
            duration=duration,
            medium=medium,
            currency="USD",
            tuition_fee_year=fee,
            intake="Fall / September",
            eligibility="Physics, Chemistry and Biology in Class XII; university-specific requirements apply.",
            neet_requirement="Required for Indian students subject to applicable regulations.",
            pcb_requirement="University-specific requirement.",
            status="published",
        )
        course_created += int(made)
        course_updated += int(not made)

    # -----------------------------------------------------
    # UZBEKISTAN
    # -----------------------------------------------------
    print("Importing Uzbekistan...")
    for name, city, fee, duration, medium in UZBEKISTAN:
        uid, created = await upsert_university(
            db, name, "Uzbekistan", city, "MBBS"
        )
        university_created += int(created)
        university_reused += int(not created)

        made = await upsert_course(
            db=db,
            university_id=uid,
            university_name=canonical_university_name(name),
            country="Uzbekistan",
            city=city,
            stream="MBBS",
            name="General Medicine",
            level="Medical",
            duration=duration,
            medium=medium,
            currency="USD",
            tuition_fee_year=fee,
            intake="Annual intake",
            eligibility="Physics, Chemistry and Biology in Class XII; university-specific requirements apply.",
            neet_requirement="Required for Indian students subject to applicable regulations.",
            pcb_requirement="University-specific requirement.",
            status="published",
        )
        course_created += int(made)
        course_updated += int(not made)

    # -----------------------------------------------------
    # ITALY
    # -----------------------------------------------------
    print(f"Importing Italy: {len(ITALY_COURSES)} course rows...")
    italy_uni_cache = {}

    for row in ITALY_COURSES:
        raw_uni = row["university"].strip()
        uni_name = canonical_university_name(raw_uni)

        if uni_name not in italy_uni_cache:
            uid, created = await upsert_university(
                db,
                uni_name,
                "Italy",
                None,
                "Management",
            )
            italy_uni_cache[uni_name] = uid
            university_created += int(created)
            university_reused += int(not created)

        uid = italy_uni_cache[uni_name]
        level = row.get("level") or "Other"
        course_name = row.get("course") or "Programme"

        # Italy source currently contains course names/levels, but not
        # reliable fee/intake/eligibility data. Import as draft so it is
        # ready in Admin without exposing unverified details publicly.
        made = await upsert_course(
            db=db,
            university_id=uid,
            university_name=uni_name,
            country="Italy",
            city=None,
            stream="Management",
            name=course_name,
            level=level,
            duration="3 years" if level == "Bachelor" else "2 years" if level == "Master" else None,
            medium="English",
            currency="EUR",
            tuition_fee_year=None,
            intake=None,
            status="draft",
        )
        course_created += int(made)
        course_updated += int(not made)

    print("\n=== MIGRATION COMPLETE ===")
    print(f"Universities created: {university_created}")
    print(f"Existing universities reused/updated: {university_reused}")
    print(f"Courses created: {course_created}")
    print(f"Existing courses updated: {course_updated}")
    print(f"Total universities now: {await db.universities.count_documents({})}")
    print(f"Total courses now: {await db.courses.count_documents({})}")
    print("\nGeorgia + Uzbekistan medical courses were published.")
    print("Italy courses were imported as DRAFT because fee/eligibility data still needs verification.")
    print("\nYou may safely run this script again; it is designed not to duplicate the same university/course identity.")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
