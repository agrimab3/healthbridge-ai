# healthbridge-ai
Connecting underserved communities to healthcare resources through AI and geolocation mapping!

Description
HealthBridge AI is a web application designed to resolve critical access gaps to healthcare by applying artificial intelligence and geolocation in real time. The web application offers users an instant means to find healthcare services, food banks, and clean drinking water, with results limited to a 5-kilometer radius, based on the user's current location. Furthermore, an AI-powered health assistant is available to users 24 hours a day, 7 days a week, to assist with questions related to symptoms, nutritional health information, and preventive care suggestions geared toward the community with limited access to healthcare. 
This project addresses three United Nations Sustainable Development Goals (SDGs):
SDG 3: Good Health & Well-being: connects people and resources to healthcare services.
SDG 2: Zero Hunger: maps food banks and other nutrition resources.
SDG 6: Clean Water & Sanitation identifies safe sources of drinking water.
The application consists of a professional, mobile-responsive front end that is able to filter healthcare resources in real time, generates map markers based on location, and has a chatbot that utilizes language models. The application is built with an architecture ready for production with the following features, i.e., rate limiting, error handling, and proper security.

Dependencies
Node.js 18.0 or higher (Download here)
npm (comes bundled with Node.js)
Modern web browser (Chrome, Firefox, Safari, or Edge)
Active internet connection for API access
Operating Systems: Windows 10+, macOS 10.15+, or Linux
Installing
1. Download the project
bash
git clone https://github.com/YOUR-USERNAME/healthbridge-ai.git
cd healthbridge-ai
2. Install dependencies
bash
npm install
3. Verify installation
bash
npm --version
node --version
No modifications to files are needed - the project is ready to run!
Executing Program
Start the server:
bash
npm start

Test the application:
Enter a city name (e.g., "Los Angeles, CA") in the search box
Click " Search Resources"
View mapped resources on the interactive map
Click filter buttons to view specific resource types
Click any map marker for details and directions
Scroll down to HealthBot and ask health questions
Help
Common Issues and Solutions
Problem: Server won't start
bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm start
Problem: "Cannot GET /"
bash
# Solution: Ensure you're in the correct directory
cd healthbridge-ai
npm start
Problem: Map not loading
Check your internet connection
Try a different location (e.g., "New York, NY")
Check browser console (F12) for errors
Problem: Chatbot not responding
Wait 30 seconds and try again (may be rate limited)
Try a simpler question
Check that OpenRouter API is accessible
Problem: "Location not found"
Use full city names with state/country (e.g., "Austin, Texas")
Try major cities first to test functionality



