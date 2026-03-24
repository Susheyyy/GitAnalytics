import google.generativeai as genai
import os

def analyze_project_with_ai(repo_data, fingerprint):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "AI analysis unavailable: Missing API Key."

    try:
        genai.configure(api_key=api_key)
        available_models = [
            m.name for m in genai.list_models() 
            if 'generateContent' in m.supported_generation_methods
        ]
        if not available_models:
            return "No compatible Gemini models found."
        
        selected_model = next((m for m in available_models if "flash" in m), available_models[0])
        model = genai.GenerativeModel(selected_model)
        
        prompt = f"""
        Analyze this GitHub repo: {repo_data['name']}.
        Files detected: {fingerprint['files']}
        About: {repo_data['about']}
        
        Task:
        1. Summarize the project's purpose in 2 professional sentences.
        2. Suggest one technical improvement for the README.
        
        STRICT FORMATTING RULES:
        - Do NOT use asterisks (**), dashes (-), or numbered lists.
        - Start with 'SUMMARY:' followed by the summary.
        - Then write 'IMPROVEMENT:' followed by the suggestion.
        - DO NOT include any introductory filler text.
        """

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"GEMINI SERVICE ERROR: {str(e)}")
        raise e