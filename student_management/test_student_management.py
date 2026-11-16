import os
import unittest
import json
import csv
from student import Student
from utils import validate_email, validate_phone
from file_handler import load_students, save_students, export_to_csv

class TestStudentManagement(unittest.TestCase):
    def setUp(self):
        self.test_json = "test_students.json"
        self.test_csv = "test_students.csv"
        self.marks_data = {
            "Math": 90.0,
            "Science": 80.0,
            "English": 70.0,
            "History": 60.0,
            "Geography": 50.0
        }
        self.student = Student(
            roll_number="101",
            name="John Doe",
            age=20,
            course="Computer Science",
            email="john.doe@example.com",
            phone_number="1234567890",
            marks=self.marks_data
        )

    def tearDown(self):
        if os.path.exists(self.test_json):
            os.remove(self.test_json)
        if os.path.exists(self.test_csv):
            os.remove(self.test_csv)

    def test_student_calculations(self):
        # 90 + 80 + 70 + 60 + 50 = 350
        self.assertEqual(self.student.calculate_total(), 350.0)
        # 350 / 5 = 70.0
        self.assertEqual(self.student.calculate_percentage(), 70.0)
        # 70% is B
        self.assertEqual(self.student.calculate_grade(), "B")

    def test_grade_boundaries(self):
        # A+ boundary (>= 90)
        s_aplus = Student("1", "A+", 20, "CS", "a@b.com", "1234567890", {subj: 90.0 for subj in self.marks_data})
        self.assertEqual(s_aplus.calculate_grade(), "A+")
        
        # A boundary (80-89)
        s_a = Student("2", "A", 20, "CS", "a@b.com", "1234567890", {subj: 85.0 for subj in self.marks_data})
        self.assertEqual(s_a.calculate_grade(), "A")
        
        # B boundary (70-79)
        s_b = Student("3", "B", 20, "CS", "a@b.com", "1234567890", {subj: 75.0 for subj in self.marks_data})
        self.assertEqual(s_b.calculate_grade(), "B")
        
        # C boundary (60-69)
        s_c = Student("4", "C", 20, "CS", "a@b.com", "1234567890", {subj: 65.0 for subj in self.marks_data})
        self.assertEqual(s_c.calculate_grade(), "C")
        
        # D boundary (50-59)
        s_d = Student("5", "D", 20, "CS", "a@b.com", "1234567890", {subj: 55.0 for subj in self.marks_data})
        self.assertEqual(s_d.calculate_grade(), "D")
        
        # Fail boundary (< 50)
        s_fail = Student("6", "Fail", 20, "CS", "a@b.com", "1234567890", {subj: 40.0 for subj in self.marks_data})
        self.assertEqual(s_fail.calculate_grade(), "Fail")

    def test_email_validation(self):
        self.assertTrue(validate_email("test@example.com"))
        self.assertTrue(validate_email("user.name+tag@sub.domain.org"))
        self.assertFalse(validate_email("invalid-email"))
        self.assertFalse(validate_email("invalid@domain"))
        self.assertFalse(validate_email("@domain.com"))
        self.assertFalse(validate_email("user@.com"))

    def test_phone_validation(self):
        self.assertTrue(validate_phone("1234567890"))
        self.assertFalse(validate_phone("12345"))
        self.assertFalse(validate_phone("12345678901"))
        self.assertFalse(validate_phone("12345abc90"))

    def test_serialization(self):
        d = self.student.to_dict()
        self.assertEqual(d["roll_number"], "101")
        self.assertEqual(d["name"], "John Doe")
        self.assertEqual(d["marks"]["Math"], 90.0)

        s_loaded = Student.from_dict(d)
        self.assertEqual(s_loaded.roll_number, "101")
        self.assertEqual(s_loaded.name, "John Doe")
        self.assertEqual(s_loaded.marks["Math"], 90.0)

    def test_file_handler_json(self):
        db = {"101": self.student}
        success = save_students(db, self.test_json)
        self.assertTrue(success)
        self.assertTrue(os.path.exists(self.test_json))

        loaded_db = load_students(self.test_json)
        self.assertIn("101", loaded_db)
        loaded_s = loaded_db["101"]
        self.assertEqual(loaded_s.name, "John Doe")
        self.assertEqual(loaded_s.calculate_percentage(), 70.0)

    def test_file_handler_csv(self):
        db = {"101": self.student}
        success = export_to_csv(db, self.test_csv)
        self.assertTrue(success)
        self.assertTrue(os.path.exists(self.test_csv))

        # Check content in CSV
        with open(self.test_csv, 'r', newline='', encoding='utf-8') as f:
            reader = list(csv.reader(f))
            self.assertEqual(len(reader), 2)  # Header + 1 Row
            # Headers validation
            self.assertEqual(reader[0][0], "Roll Number")
            self.assertEqual(reader[0][1], "Name")
            # Row value check
            self.assertEqual(reader[1][0], "101")
            self.assertEqual(reader[1][1], "John Doe")
            self.assertEqual(reader[1][13], "B") # Grade index (6 metadata + 5 marks + 3 calculated = 14 items, index 13 is Grade)

if __name__ == "__main__":
    unittest.main()
