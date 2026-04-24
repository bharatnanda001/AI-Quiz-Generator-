from typing import List

try:
    from keybert import KeyBERT
    kw_model = KeyBERT()
except ImportError:
    kw_model = None

def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    if not kw_model or not text.strip():
        # Fallback if KeyBERT isn't loaded correctly
        words = text.split()
        return list(set([w for w in words if len(w) > 4]))[:top_n]
    
    keywords = kw_model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=top_n)
    return [kw[0] for kw in keywords]
