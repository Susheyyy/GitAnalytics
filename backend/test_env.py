from dotenv import load_dotenv
import os

# This returns True if the file was found and loaded
print(f"File loaded: {load_dotenv()}") 
print(f"Token Found: {os.getenv('GITHUB_TOKEN')}")