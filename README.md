# Inventory Management System

**A project for CMSC 447: Inventory Management System by CodeBase Commanders**

## Table of Contents
- [Introduction](#introduction)
- [Project Setup](#project-setup)
- [Branching Strategy](#branching-strategy)
- [Development Workflow](#development-workflow)
- [Directory Structure](#directory-structure)
- [Technologies Used](#technologies-used)
- [Team Roles](#team-roles)
- [Contributing](#contributing)

## Introduction
The Inventory Management System is a web-based solution designed to track product descriptions and quantities, provide real-time alerts for low stock levels, and generate reports. The system includes features for product management, role-based access control, audit logs, notifications, and search functionality.

## Project Setup
To get started with the project, follow the instructions below:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Golani51/Inventory-Management-System.git
   cd Inventory-Management-System
   ```

2. **Create and Switch to Your Feature Branch**
   Each team member should work on their own feature branch:
   ```bash
   git checkout -b <your-branch-name>
   ```

3. **Install Project Dependencies**
   Depending on your role, you may need to install dependencies for different parts of the project:

   - **For Backend Development** (Matthew):
     ```bash
     pip install -r requirements.txt
     ```

   - **For Frontend Development** (Alex):
     Make sure you have **Node.js** installed. Then run:
     ```bash
     npm install
     ```

   - **For Database** (Josh):
     Follow the database setup instructions provided in the database folder.

## Branching Strategy
We use a **feature-branch workflow** to keep development organized:

- **`main`**: The primary branch for stable, production-ready code.
- **`backend/<feature-name>`**: Branches for backend API development.
- **`frontend/<feature-name>`**: Branches for frontend development tasks.
- **`database/<feature-name>`**: Branches for database schema and integration.

### Example
If you are adding a login feature in the frontend:
```bash
git checkout -b frontend/add-login-feature
```

## Development Workflow
1. **Update Your Local Repository**
   Before starting work, always pull the latest changes from the `main` branch:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Make Changes and Commit**
   Make sure your changes are isolated to your branch and that you commit frequently with descriptive messages:
   ```bash
   git add .
   git commit -m "Added login form for user authentication"
   ```

3. **Push Your Branch**
   Push your changes to GitHub:
   ```bash
   git push origin <your-branch-name>
   ```

4. **Create a Pull Request (PR)**
   Go to the repository on GitHub and create a **Pull Request** from your branch to `main`. Assign team members for review and wait for approval before merging.

## Directory Structure
```
Inventory-Management-System/
│
├── backend/
│   ├── api/
│   ├── models/
│   └── app.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── index.html
│
├── database/
│   ├── schema.sql
│   └── scripts/
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── README.md
```

## Technologies Used
- **Backend**: Python, Flask
- **Frontend**: JavaScript, HTML, CSS
- **Database**: MySQL
- **Version Control**: Git

## Team Roles
- **Matthew Dyson**: Backend Developer
- **Alex Gudat**: Frontend Developer
- **Joshua Hur**: Database Specialist
- **Ben Maher**: Scrum Master
- **Jon Woods**: QA & Documentation Specialist

## Contributing
To contribute to the project, follow the development workflow and submit pull requests for review. Always communicate any blockers or issues in our group meetings or via the project board on GitHub.
