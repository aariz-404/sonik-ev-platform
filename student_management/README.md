# Student Management System

A robust, console-based Student Management System written in Python using Object-Oriented Programming (OOP) principles, structured across multiple modules, featuring custom exception handling, complete input validation, data persistence using JSON, and analytical bonus features like data sorting, top performing lists, and CSV exporting.

## Project Structure

The project is structured modularly as follows:

```text
student_management/
│── main.py            # Entry point, houses CLI menus and user interactions
│── student.py         # Student class model with grading and dict mapping logic
│── file_handler.py    # Operations for loading/saving database JSON and exporting CSVs
│── utils.py           # Reusable input parsers and regex-based validators
│── students.json      # Flat-file database storing student records in JSON format
└── README.md          # Project user guide and technical documentation
```

---

## Features

### 1. Student Entity Management
- **Add Student**: Registers a new student. Stores a unique **Roll Number**, **Name**, **Age**, **Course**, **Email**, **Phone Number**, and **Marks** for 5 core subjects:
  - *Mathematics*
  - *Science*
  - *English*
  - *History*
  - *Geography*
- **Update Student**: Allows updates to any attribute. The system displays current values, and pressing `Enter` leaves the value unchanged.
- **Delete Student**: Deletes records by Roll Number with confirmation.

### 2. Search & Queries
- Search records by exact **Roll Number** (returns a detailed card of the student's records).
- Search records by **Name** (supports partial substring, case-insensitive matches, and displays matches in a tabular layout).

### 3. Analytics & Formatted Table Views
- View all students in a neatly aligned tabular grid.
- Sort the displayed table by:
  - **Name** (alphabetically, case-insensitive)
  - **Roll Number** (sorted numerically where possible, otherwise alphabetically)
  - **Percentage** (descending)
- **Top 3 Students**: Displays the top 3 highest-scoring students based on their percentages.
- **Calculate Result**: Generates and prints a detailed report card showing subject-wise marks, total marks, percentage, and grade.

### 4. File Handling & Export
- **Auto-Load/Save**: Automatically reads existing records from `students.json` at startup, and writes modifications back immediately after any addition, update, or deletion.
- **CSV Export**: Allows exporting the entire database to a formatted CSV file (`.csv`) for compatibility with spreadsheet software like Microsoft Excel or Google Sheets.

---

## Input Validations & Exception Handling

The application protects against invalid operations and inputs through defensive programming:
- **Email Validation**: Validates emails using structured regular expressions (e.g. `user@domain.com`).
- **Phone Validation**: Ensures the phone number contains exactly 10 digits.
- **Duplicate Roll Numbers**: Detects duplicate Roll Numbers and raises a custom `DuplicateRollNumberError` to prevent overwriting existing students.
- **Invalid Input Types & Ranges**: 
  - Validates student age (restricted to integer values between 5 and 100).
  - Validates subject marks (restricted to floating-point or integer values between 0.0 and 100.0).
  - Handles bad input formats gracefully by printing descriptive messages and prompting again.
- **File Not Found**: Starts with an empty database if `students.json` does not exist, and creates it automatically. If the file is corrupted, it warns the user and initializes safely instead of crashing.

---

## How to Run

1. Make sure you have **Python 3** installed.
2. Navigate to the project directory or run the script using its absolute path:
   ```bash
   python main.py
   ```
3. Use the menu prompts to navigate, enter, search, and manage student data.
