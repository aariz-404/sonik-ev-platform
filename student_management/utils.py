import re

# Standard 5 subjects for student marks
SUBJECTS = ["Math", "Science", "English", "History", "Geography"]

def validate_email(email: str) -> bool:
    """
    Validate email address format.
    Matches simple email structure: local_part@domain.tld
    """
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip()))

def validate_phone(phone: str) -> bool:
    """
    Validate that phone number consists of exactly 10 digits.
    """
    pattern = r"^\d{10}$"
    return bool(re.match(pattern, phone.strip()))

def get_string_input(prompt: str, validator_func=None, error_message: str = None, allow_empty: bool = False) -> str:
    """
    Prompts user for string input, loops until valid.
    If allow_empty is True and user presses Enter, returns None.
    """
    while True:
        val = input(prompt).strip()
        if not val:
            if allow_empty:
                return None
            print("Error: Input cannot be empty. Please enter a value.")
            continue
        
        if validator_func:
            if validator_func(val):
                return val
            else:
                print(f"Error: {error_message or 'Invalid format.'}")
        else:
            return val

def get_integer_input(prompt: str, min_val: int = None, max_val: int = None, allow_empty: bool = False):
    """
    Prompts user for integer input, handles ValueError and range checks.
    If allow_empty is True and user presses Enter, returns None.
    """
    while True:
        val_str = input(prompt).strip()
        if not val_str:
            if allow_empty:
                return None
            print("Error: Input cannot be empty. Please enter a valid integer.")
            continue
        try:
            val = int(val_str)
            if min_val is not None and val < min_val:
                print(f"Error: Value must be at least {min_val}.")
                continue
            if max_val is not None and val > max_val:
                print(f"Error: Value must be at most {max_val}.")
                continue
            return val
        except ValueError:
            print("Error: Invalid input. Please enter a valid integer.")

def get_float_input(prompt: str, min_val: float = None, max_val: float = None, allow_empty: bool = False):
    """
    Prompts user for float input, handles ValueError and range checks.
    If allow_empty is True and user presses Enter, returns None.
    """
    while True:
        val_str = input(prompt).strip()
        if not val_str:
            if allow_empty:
                return None
            print("Error: Input cannot be empty. Please enter a valid number.")
            continue
        try:
            val = float(val_str)
            if min_val is not None and val < min_val:
                print(f"Error: Value must be at least {min_val}.")
                continue
            if max_val is not None and val > max_val:
                print(f"Error: Value must be at most {max_val}.")
                continue
            return val
        except ValueError:
            print("Error: Invalid input. Please enter a valid number.")

def get_marks_input(allow_empty: bool = False, current_marks: dict = None) -> dict:
    """
    Prompts and retrieves marks for all 5 subjects, validating each.
    If allow_empty is True, user can skip entering new marks by pressing Enter.
    """
    marks = {}
    print("\nEnter marks for the following subjects (0 - 100):")
    for subj in SUBJECTS:
        current_desc = f" (Current: {current_marks[subj]})" if current_marks else ""
        prompt = f"  - {subj}{current_desc}: "
        val = get_float_input(prompt, min_val=0.0, max_val=100.0, allow_empty=allow_empty)
        if val is None and allow_empty and current_marks:
            marks[subj] = current_marks[subj]
        else:
            marks[subj] = val
    return marks
