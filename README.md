# Visa Merchant Insights Dashboard

This project simulates how I would use SQL and Tableau to identify trends in customer behavior, product conversions, and high-value user segments.

---

## Project Goals
- Identify which job types and contact methods have the highest conversion rates
- Explore education and loan status impacts on offer acceptance
- Analyze average account balances by job to find high-value segments

---
**Dataset:** Bank Marketing Dataset (Kaggle)  

## Tools Used
- **SQL (DuckDB)** – for analysis and KPI creation
- **Tableau Public** – for dashboard design
- **VS Code** – to organize SQL files and documentation
- **bank.csv** dataset from Kaggle (Bank Marketing)

---

## 🔍 Questions Answered:
1. What job types convert the most?  
2. Which contact method leads to higher product adoption?  

## Key Insights
- **Students and retirees** showed the highest conversion rates
- **Cellular contact** far outperforms telephone and unknown methods
- **Management and retired** customers hold the highest average balances

---

## Files Included
- `/sql/` – All 5 SQL KPI queries  
- `/images/` – Dashboard screenshot  
- `/Dashboard.twbx` – Tableau workbook file  
- `/data/` – CSV source file

---

## Business Value
This dashboard mirrors the kind of insights Visa Consulting and Analytics (VCA) or GBO team might deliver to merchant clients or card issuers: helping them optimize targeting strategies, understand behavior, and increase ROI on outreach.

---

## Challenges Faced

- DuckDB initially wasn't installed — solved it via Homebrew terminal install  
- Dataset had to be manually downloaded and prepped due to GitHub preview limitations  
- Figuring out Tableau's Quick Table Calculations and percent conversions took trial + error  
- Learned how to properly structure GitHub projects and push using terminal step-by-step
 

---
## 📊 Dashboard Preview
![Dashboard Screenshot](images/visa_dashboard.png)

