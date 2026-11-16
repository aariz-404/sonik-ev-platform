class Student:
    """
    Represents a student entity in the Student Management System.
    """
    def __init__(self, roll_number, name, age, course, email, phone_number, marks):
        self.roll_number = str(roll_number).strip()
        self.name = str(name).strip()
        self.age = int(age)
        self.course = str(course).strip()
        self.email = str(email).strip()
        self.phone_number = str(phone_number).strip()
        # Ensure we have precisely 5 subjects
        self.marks = {subj: float(mark) for subj, mark in marks.items()}

    def calculate_total(self) -> float:
        """Calculate and return the sum of marks for all subjects."""
        return sum(self.marks.values())

    def calculate_percentage(self) -> float:
        """Calculate and return the average percentage of marks."""
        if not self.marks:
            return 0.0
        return self.calculate_total() / len(self.marks)

    def calculate_grade(self) -> str:
        """
        Determine and return the grade based on percentage:
        90–100 -> A+
        80–89  -> A
        70–79  -> B
        60–69  -> C
        50–59  -> D
        Below 50 -> Fail
        """
        percentage = self.calculate_percentage()
        if percentage >= 90.0:
            return "A+"
        elif percentage >= 80.0:
            return "A"
        elif percentage >= 70.0:
            return "B"
        elif percentage >= 60.0:
            return "C"
        elif percentage >= 50.0:
            return "D"
        else:
            return "Fail"

    def to_dict(self) -> dict:
        """Convert the student instance to a dictionary for JSON storage."""
        return {
            "roll_number": self.roll_number,
            "name": self.name,
            "age": self.age,
            "course": self.course,
            "email": self.email,
            "phone_number": self.phone_number,
            "marks": self.marks
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Create a Student instance from a dictionary."""
        return cls(
            roll_number=data["roll_number"],
            name=data["name"],
            age=data["age"],
            course=data["course"],
            email=data["email"],
            phone_number=data["phone_number"],
            marks=data["marks"]
        )
