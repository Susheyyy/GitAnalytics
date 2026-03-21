import google.generativeai as genai
import os

def analyze_project_with_ai(repo_data, fingerprint):
    # Load key inside function to ensure it picks up .env changes
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("CRITICAL: GEMINI_API_KEY not found in environment variables!")
        return "AI analysis unavailable: Missing API Key."

    try:
        genai.configure(api_key=api_key)
        # Using 1.5-flash for speed and reliability
        model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
        
        prompt = f"""
        Analyze this GitHub repo: {repo_data['name']}.
        Files: {fingerprint['files']}
        Tech Stack: {fingerprint.get('tech_stack', [])}
        About: {repo_data['about']}
        
        Provide:
        1. A 2-sentence summary of the project purpose.
        2. One suggestion to improve the README (README exists: {repo_data['has_readme']}).
        """

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        # This will print the EXACT error (e.g., Invalid API Key, Quota Exceeded)
        print(f"GEMINI SERVICE ERROR: {str(e)}")
        raise e