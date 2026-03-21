import google.generativeai as genai
import os

def analyze_project_with_ai(repo_data, fingerprint):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "AI analysis unavailable: Missing API Key."

    try:
        genai.configure(api_key=api_key)

        # 1. AUTO-DISCOVER: List all models authorized for your API key
        # This prevents the 404 error by picking a model that definitely exists
        available_models = [
            m.name for m in genai.list_models() 
            if 'generateContent' in m.supported_generation_methods
        ]
        
        if not available_models:
            print("ERROR: No compatible Gemini models found for this API key.")
            return "No compatible Gemini models found."
        
        # 2. Priority Selection: Prefer 'flash' for speed, fallback to the first available
        selected_model = next((m for m in available_models if "flash" in m), available_models[0])
        print(f"DEBUG: Successfully matched and using model -> {selected_model}")
        
        model = genai.GenerativeModel(selected_model)
        
        prompt = f"""
        Analyze this GitHub repo: {repo_data['name']}.
        Files detected: {fingerprint['files']}
        Tech Stack Keywords: {fingerprint.get('tech_stack', [])}
        About: {repo_data['about']}
        
        Task:
        1. Summarize the project's purpose in 2 professional sentences.
        2. Suggest one specific improvement for the README (Current README status: {repo_data['has_readme']}).
        Provide your response in this EXACT format. Do not use asterisks (**), lists, or introductory filler text:

        SUMMARY:
        (Insert 2 professional sentences)

        IMPROVEMENT:
        (Insert one specific suggestion)
        """

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"GEMINI SERVICE ERROR: {str(e)}")
        raise e