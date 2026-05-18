import os
import logging
from typing import List
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
]

DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"

def get_credentials():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists("credentials.json"):
                raise FileNotFoundError("credentials.json not found. Please create OAuth credentials in Google Cloud Console (Desktop App) and save it as backend/credentials.json")
            
            # Use LocalWebserver since this is running on Desktop
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    return creds

def export_quiz_to_form(quiz_title: str, questions: List[dict]):
    """
    Creates a new Google Form, sets it as a quiz, and adds the provided questions.
    Returns a dictionary containing the formId, responderUri, and editUrl.
    """
    try:
        creds = get_credentials()
        form_service = build("forms", "v1", credentials=creds, discoveryServiceUrl=DISCOVERY_DOC)
        
        # 1. Create the blank form
        form = {
            "info": {
                "title": quiz_title,
                "documentTitle": quiz_title
            }
        }
        result = form_service.forms().create(body=form).execute()
        form_id = result["formId"]
        responder_uri = result.get("responderUri")
        
        # 2. Convert form to a Quiz
        update_settings_request = {
            "requests": [
                {
                    "updateSettings": {
                        "settings": {
                            "quizSettings": {
                                "isQuiz": True
                            }
                        },
                        "updateMask": "quizSettings.isQuiz"
                    }
                }
            ]
        }
        form_service.forms().batchUpdate(formId=form_id, body=update_settings_request).execute()
        
        # 3. Add questions
        requests = []
        for index, q in enumerate(questions):
            # Parse questions
            stem = q.get("stem", "Question")
            options = q.get("options", ["Option 1", "Option 2"])
            correct_opt = q.get("correct_option")
            explanation = q.get("answer_explanation", "")
            
            choice_objects = [{"value": opt} for opt in options]
            
            item_request = {
                "createItem": {
                    "item": {
                        "title": stem,
                        "questionItem": {
                            "question": {
                                "required": True,
                                "grading": {
                                    "pointValue": 1,
                                    "correctAnswers": {
                                        "answers": [{"value": correct_opt}]
                                    },
                                    "whenRight": {"text": explanation} if explanation else None,
                                    "whenWrong": {"text": explanation} if explanation else None
                                },
                                "choiceQuestion": {
                                    "type": "RADIO",
                                    "options": choice_objects,
                                    "shuffle": True
                                }
                            }
                        }
                    },
                    "location": {
                        "index": index
                    }
                }
            }
            # Remove None values from grading explanations if empty
            if not explanation:
                del item_request["createItem"]["item"]["questionItem"]["question"]["grading"]["whenRight"]
                del item_request["createItem"]["item"]["questionItem"]["question"]["grading"]["whenWrong"]

            requests.append(item_request)
            
        if requests:
            form_service.forms().batchUpdate(formId=form_id, body={"requests": requests}).execute()
            
        return {
            "formId": form_id,
            "responderUri": responder_uri,
            "editUrl": f"https://docs.google.com/forms/d/{form_id}/edit"
        }
    except Exception as e:
        logger.error(f"Failed to export to Google Forms: {e}")
        raise e
