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

def generate_tech_roadmap(username, top_lang, projects):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "AI analysis unavailable: Missing API Key."

    try:
        genai.configure(api_key=api_key)
        # Reusing your model selection logic
        available_models = [
            m.name for m in genai.list_models() 
            if 'generateContent' in m.supported_generation_methods
        ]
        selected_model = next((m for m in available_models if "flash" in m), available_models[0])
        model = genai.GenerativeModel(selected_model)

        # The Career Coach Prompt
        project_names = [p['name'] for p in projects[:5]]
        prompt = f"""
        User: {username}
        Primary Tech: {top_lang}
        Recent Projects: {', '.join(project_names)}

        Task: Analyze their GitHub stack and provide a 'What's Next' roadmap.
        1. Suggest one advanced framework or library in {top_lang} they should master.
        2. Suggest one complementary language to learn (e.g., if Python, suggest Rust/Go).
        3. Give a 1-sentence project idea that combines their current {top_lang} skills with the new suggestions.

        STRICT FORMATTING:
        - Use ONLY <b>tags</b> for tech names (no asterisks).
        - Keep the total response under 80 words.
        - Direct, professional, and slightly witty tone.
        - Return only the suggestion text.
        """

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"ROADMAP AI ERROR: {str(e)}")
        return "Failed to generate roadmap. Try again later."