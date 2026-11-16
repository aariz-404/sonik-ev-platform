import os
from student import Student
from file_handler import load_students, save_students, export_to_csv
from utils import (
    SUBJECTS,
    get_string_input,
    get_integer_input,
    validate_email,
    validate_phone,
    get_marks_input
)

# Base directory setup for persistent JSON storage
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "students.json")

class DuplicateRollNumberError(Exception):
    """Exception raised when trying to add a student with an existing roll number."""
    def __init__(self, roll_number):
        self.roll_number = roll_number
        super().__init__(f"A student with Roll Number '{roll_number}' already exists.")

def print_header(title: str):
    """Helper to print standard formatted section headers."""
    print(f"\n{'=' * 50}")
    print(f" {title.upper().center(48)} ")
    print(f"{'=' * 50}")

def format_student_card(s: Student):
    """Prints single student details in a clean card format."""
    print(f"\n┌──────────────────────────────────────────────┐")
    print(f"│               STUDENT DETAILS                │")
    print(f"├──────────────────────────────────────────────┤")
    print(f"│ Roll Number  : {s.roll_number:<29} │")
    print(f"│ Name         : {s.name:<29} │")
    print(f"│ Age          : {s.age:<29} │")
    print(f"│ Course       : {s.course:<29} │")
    print(f"│ Email        : {s.email:<29} │")
    print(f"│ Phone Number : {s.phone_number:<29} │")
    print(f"├──────────────────────────────────────────────┤")
    print(f"│ SUBJECT MARKS:                               │")
    for subj in SUBJECTS:
        mark = s.marks.get(subj, 0.0)
        print(f"│   - {subj:<12} : {mark:<27.1f} │")
    print(f"├──────────────────────────────────────────────┤")
    print(f"│ Total Marks  : {s.calculate_total():<27.1f} / 500 │")
    print(f"│ Percentage   : {s.calculate_percentage():<27.2f}% │")
    print(f"│ Grade        : {s.calculate_grade():<29} │")
    print(f"└──────────────────────────────────────────────┘")

def display_student_table(student_list: list):
    """
    Displays list of Student objects in a formatted table.
    """
    if not student_list:
        print("\nNo student records found.")
        return

    # Define column headers and widths
    headers = [
        "Roll No", "Name", "Age", "Course", 
        "Email", "Phone", "Math", "Sci", 
        "Eng", "Hist", "Geo", "Pct %", "Grade"
    ]
    col_widths = [8, 16, 4, 10, 22, 11, 5, 5, 5, 5, 5, 6, 5]

    # Render header
    header_line = " | ".join(f"{h:<{w}}" for h, w in zip(headers, col_widths))
    border = "=" * len(header_line)
    print("\n" + border)
    print(header_line)
    print(border)

    # Render rows
    for s in student_list:
        m = s.marks
        row_vals = [
            s.roll_number,
            s.name,
            s.age,
            s.course,
            s.email,
            s.phone_number,
            m.get("Math", 0.0),
            m.get("Science", 0.0),
            m.get("English", 0.0),
            m.get("History", 0.0),
            m.get("Geography", 0.0),
            s.calculate_percentage(),
            s.calculate_grade()
        ]
        
        row_parts = []
        for val, w, h in zip(row_vals, col_widths, headers):
            if isinstance(val, float):
                # Marks or percentage
                if h == "Pct %":
                    row_parts.append(f"{val:<{w}.1f}")
                else:
                    row_parts.append(f"{val:<{w}.1f}")
            else:
                row_parts.append(f"{str(val)[:w]:<{w}}")
                
        print(" | ".join(row_parts))
    print(border + "\n")

def add_student(students: dict):
    print_header("Add New Student")
    
    # Validation loop for Roll Number uniqueness
    while True:
        try:
            roll_number = get_string_input("Enter Roll Number: ").strip()
            if roll_number in students:
                raise DuplicateRollNumberError(roll_number)
            break
        except DuplicateRollNumberError as e:
            print(f"Error: {e} Please try again.")

    name = get_string_input("Enter Student Name: ")
    age = get_integer_input("Enter Student Age (5 - 100): ", min_val=5, max_val=100)
    course = get_string_input("Enter Course: ")
    email = get_string_input(
        "Enter Email: ", 
        validator_func=validate_email, 
        error_message="Invalid email format (e.g., example@domain.com)."
    )
    phone_number = get_string_input(
        "Enter Phone Number (10 digits): ", 
        validator_func=validate_phone, 
        error_message="Invalid phone number. Must be exactly 10 digits."
    )
    
    # Get marks for 5 subjects
    marks = get_marks_input(allow_empty=False)
    
    # Instantiate Student object
    new_student = Student(roll_number, name, age, course, email, phone_number, marks)
    
    # Store in dict & Save to JSON
    students[roll_number] = new_student
    if save_students(students, DATA_FILE):
        print(f"\n[Success] Student '{name}' (Roll: {roll_number}) added successfully.")
    else:
        print("\n[Error] Student could not be saved to disk.")

def view_students_submenu(students: dict):
    while True:
        print_header("View Students Sub-Menu")
        print("1. View All (Unsorted / As Entered)")
        print("2. View Sorted by Name")
        print("3. View Sorted by Roll Number")
        print("4. View Sorted by Percentage")
        print("5. View Top 3 Students")
        print("6. Export All Students to CSV")
        print("7. Back to Main Menu")
        
        choice = get_integer_input("\nSelect an option (1-7): ", min_val=1, max_val=7)
        
        if choice == 1:
            display_student_table(list(students.values()))
        elif choice == 2:
            sorted_list = sorted(students.values(), key=lambda s: s.name.lower())
            display_student_table(sorted_list)
        elif choice == 3:
            # Sort helper for alphanumeric roll numbers
            def roll_sort_key(s):
                try:
                    return (0, int(s.roll_number))
                except ValueError:
                    return (1, s.roll_number.lower())
            sorted_list = sorted(students.values(), key=roll_sort_key)
            display_student_table(sorted_list)
        elif choice == 4:
            sorted_list = sorted(students.values(), key=lambda s: s.calculate_percentage(), reverse=True)
            display_student_table(sorted_list)
        elif choice == 5:
            top_3 = sorted(students.values(), key=lambda s: s.calculate_percentage(), reverse=True)[:3]
            print("\n--- TOP 3 STUDENTS BY PERCENTAGE ---")
            display_student_table(top_3)
        elif choice == 6:
            filename = get_string_input("Enter output CSV filename (e.g. students.csv): ")
            if not filename.lower().endswith('.csv'):
                filename += '.csv'
            csv_path = os.path.join(BASE_DIR, filename)
            if export_to_csv(students, csv_path):
                print(f"\n[Success] Exported records to {csv_path}")
            else:
                print("\n[Error] Export failed.")
        elif choice == 7:
            break

def search_student(students: dict):
    print_header("Search Student")
    print("1. Search by Roll Number")
    print("2. Search by Name")
    
    choice = get_integer_input("\nSelect search method (1-2): ", min_val=1, max_val=2)
    
    if choice == 1:
        roll_num = get_string_input("Enter Roll Number to search: ").strip()
        if roll_num in students:
            format_student_card(students[roll_num])
        else:
            print(f"\n[Info] No student found with Roll Number '{roll_num}'.")
    elif choice == 2:
        query_name = get_string_input("Enter name to search (partial matches allowed): ").lower()
        results = [s for s in students.values() if query_name in s.name.lower()]
        if results:
            print(f"\nFound {len(results)} matching record(s):")
            display_student_table(results)
        else:
            print(f"\n[Info] No students found matching '{query_name}'.")

def update_student(students: dict):
    print_header("Update Student Record")
    roll_num = get_string_input("Enter Roll Number of the student to update: ").strip()
    
    if roll_num not in students:
        print(f"\n[Error] Student with Roll Number '{roll_num}' not found.")
        return
        
    student = students[roll_num]
    print(f"\nUpdating details for {student.name} (Roll: {roll_num}).")
    print("Press Enter to skip updating a field and keep the current value.\n")
    
    # Update fields with optional skips
    new_name = get_string_input(f"Enter Name (Current: {student.name}): ", allow_empty=True)
    if new_name:
        student.name = new_name
        
    new_age = get_integer_input(f"Enter Age (Current: {student.age}): ", min_val=5, max_val=100, allow_empty=True)
    if new_age is not None:
        student.age = new_age
        
    new_course = get_string_input(f"Enter Course (Current: {student.course}): ", allow_empty=True)
    if new_course:
        student.course = new_course
        
    new_email = get_string_input(
        f"Enter Email (Current: {student.email}): ", 
        validator_func=validate_email, 
        error_message="Invalid email format.", 
        allow_empty=True
    )
    if new_email:
        student.email = new_email
        
    new_phone = get_string_input(
        f"Enter Phone Number (Current: {student.phone_number}): ", 
        validator_func=validate_phone, 
        error_message="Phone number must be exactly 10 digits.", 
        allow_empty=True
    )
    if new_phone:
        student.phone_number = new_phone
        
    # Get marks updates
    student.marks = get_marks_input(allow_empty=True, current_marks=student.marks)
    
    # Save updates to JSON file
    if save_students(students, DATA_FILE):
        print(f"\n[Success] Record for Roll Number '{roll_num}' updated successfully.")
    else:
        print("\n[Error] Updates could not be saved to disk.")

def delete_student(students: dict):
    print_header("Delete Student Record")
    roll_num = get_string_input("Enter Roll Number to delete: ").strip()
    
    if roll_num not in students:
        print(f"\n[Error] Student with Roll Number '{roll_num}' not found.")
        return
        
    student = students[roll_num]
    confirm = get_string_input(
        f"Are you sure you want to permanently delete {student.name} (Roll: {roll_num})? (y/n): "
    ).lower()
    
    if confirm in ['y', 'yes']:
        del students[roll_num]
        if save_students(students, DATA_FILE):
            print(f"\n[Success] Record for Roll Number '{roll_num}' deleted successfully.")
        else:
            print("\n[Error] Change could not be saved to disk.")
    else:
        print("\nDeletion cancelled.")

def calculate_result(students: dict):
    print_header("Calculate Result")
    roll_num = get_string_input("Enter Roll Number: ").strip()
    
    if roll_num in students:
        s = students[roll_num]
        print(f"\n==============================================")
        print(f"                 RESULT CARD                  ")
        print(f"==============================================")
        print(f" Roll Number : {s.roll_number}")
        print(f" Name        : {s.name}")
        print(f" Course      : {s.course}")
        print(f"----------------------------------------------")
        print(f" Subject Marks:")
        for subj in SUBJECTS:
            print(f"   - {subj:<10}: {s.marks.get(subj, 0.0):.1f} / 100")
        print(f"----------------------------------------------")
        print(f" Total Marks : {s.calculate_total():.1f} / 500")
        print(f" Percentage  : {s.calculate_percentage():.2f}%")
        print(f" Grade       : {s.calculate_grade()}")
        print(f"==============================================")
    else:
        print(f"\n[Error] Student with Roll Number '{roll_num}' not found.")

def main():
    # Load student records automatically at start
    students = load_students(DATA_FILE)
    
    while True:
        print_header("Student Management System")
        print("1. Add Student")
        print("2. View Students")
        print("3. Search Student")
        print("4. Update Student")
        print("5. Delete Student")
        print("6. Calculate Result")
        print("7. Exit")
        
        choice = get_integer_input("\nSelect an option (1-7): ", min_val=1, max_val=7)
        
        if choice == 1:
            add_student(students)
        elif choice == 2:
            view_students_submenu(students)
        elif choice == 3:
            search_student(students)
        elif choice == 4:
            update_student(students)
        elif choice == 5:
            delete_student(students)
        elif choice == 6:
            calculate_result(students)
        elif choice == 7:
            # Double assurance file save
            save_students(students, DATA_FILE)
            print("\nExiting Student Management System. Goodbye!\n")
            break

if __name__ == "__main__":
    main()
