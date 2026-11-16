import json
import csv
import os
from student import Student

def load_students(filepath: str) -> dict:
    """
    Loads student data from a JSON file and returns a dictionary of Student objects.
    If the file does not exist, returns an empty dictionary.
    Handles json.JSONDecodeError and other exceptions gracefully.
    """
    if not os.path.exists(filepath):
        return {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            students = {}
            for roll_num, student_data in data.items():
                students[roll_num] = Student.from_dict(student_data)
            return students
    except json.JSONDecodeError:
        print(f"\n[Warning] File '{filepath}' is corrupted or empty. Starting with an empty database.")
        return {}
    except PermissionError:
        print(f"\n[Error] Permission denied to read file '{filepath}'. Starting with an empty database.")
        return {}
    except Exception as e:
        print(f"\n[Error] Failed to load data from '{filepath}': {e}")
        return {}

def save_students(students: dict, filepath: str) -> bool:
    """
    Saves the dictionary of Student objects to a JSON file.
    """
    try:
        # Ensure parent directories exist
        dir_name = os.path.dirname(filepath)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name)
            
        data_to_save = {roll_num: s.to_dict() for roll_num, s in students.items()}
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, indent=4)
        return True
    except Exception as e:
        print(f"\n[Error] Failed to save data to '{filepath}': {e}")
        return False

def export_to_csv(students: dict, filepath: str) -> bool:
    """
    Exports all student records to a CSV file.
    Includes personal details, marks for each subject, total marks, percentage, and grade.
    """
    try:
        # Ensure parent directories exist
        dir_name = os.path.dirname(filepath)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name)
            
        from utils import SUBJECTS
        
        headers = [
            "Roll Number", 
            "Name", 
            "Age", 
            "Course", 
            "Email", 
            "Phone Number"
        ] + SUBJECTS + ["Total Marks", "Percentage", "Grade"]
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            for s in students.values():
                row = [
                    s.roll_number,
                    s.name,
                    s.age,
                    s.course,
                    s.email,
                    s.phone_number
                ]
                for subj in SUBJECTS:
                    row.append(s.marks.get(subj, 0.0))
                row.extend([
                    s.calculate_total(),
                    round(s.calculate_percentage(), 2),
                    s.calculate_grade()
                ])
                writer.writerow(row)
        return True
    except Exception as e:
        print(f"\n[Error] Failed to export data to CSV: {e}")
        return False
