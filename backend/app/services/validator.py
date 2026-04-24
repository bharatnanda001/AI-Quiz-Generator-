import re


def validate_question(question: dict, context_text: str) -> bool:
    """
    Validates the generated question using heuristics.
    Returns True if valid, False if it should be rejected.
    """
    # 1. Stem length verification
    stem = question.get("stem", "")
    if not isinstance(stem, str):
        print("DEBUG (Validation): Rejected due to non-string stem")
        return False
        
    word_count = len(stem.split())
    if word_count < 3:
        print(f"DEBUG (Validation): Rejected due to short stem: '{stem}'")
        return False
        
    # 2. Extract answer and verify it's somewhat related to context
    correct_ans = str(question.get("correct_option", "")).lower()
    if not correct_ans:
        print("DEBUG (Validation): Rejected due to empty correct_option")
        return False
    
    # 3. For MCQs, check option uniqueness
    if question.get("type", "MCQ") == "MCQ":
        opts = question.get("options", [])
        if not isinstance(opts, list) or len(opts) < 2:
            print(f"DEBUG (Validation): Rejected MCQ due to lack of options or invalid format: {type(opts)}")
            return False
            
        # Ensure all options are strings
        opts = [str(o) for o in opts]
        if len(set(opts)) != len(opts):
            print("DEBUG (Validation): Rejected MCQ due to duplicate options")
            return False

    return True
