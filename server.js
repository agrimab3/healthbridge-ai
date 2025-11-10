const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

// Rate limiting to prevent abuse
const requestCounts = new Map();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  return true;
}

// Enhanced resource endpoint with better error handling
app.get("/resources", async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ 
      error: "Too many requests. Please try again in a minute." 
    });
  }

  const location = req.query.location || "Los Angeles";

  try {
    // Geocode the location
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      {
        headers: {
          "User-Agent": "HealthBridgeAI/1.0 (contact@healthbridge.example)"
        }
      }
    );
    
    const geoData = await geoRes.json();
    
    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ 
        error: "Location not found. Please try a different search term." 
      });
    }

    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // Enhanced Overpass query with more healthcare resources
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="clinic"](around:5000,${lat},${lon});
        node["amenity"="hospital"](around:5000,${lat},${lon});
        node["amenity"="doctors"](around:5000,${lat},${lon});
        node["amenity"="pharmacy"](around:5000,${lat},${lon});
        node["amenity"="food_bank"](around:5000,${lat},${lon});
        node["amenity"="drinking_water"](around:5000,${lat},${lon});
        node["amenity"="water_point"](around:5000,${lat},${lon});
        way["amenity"="clinic"](around:5000,${lat},${lon});
        way["amenity"="hospital"](around:5000,${lat},${lon});
        way["amenity"="food_bank"](around:5000,${lat},${lon});
      );
      out center;
    `;

    const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery,
      headers: { 
        "Content-Type": "text/plain",
        "User-Agent": "HealthBridgeAI/1.0"
      }
    });

    if (!overpassRes.ok) {
      throw new Error("Failed to fetch resources from map database");
    }

    const overpassData = await overpassRes.json();

    // Process and deduplicate results
    const places = overpassData.elements
      .map(el => {
        // Handle both nodes and ways (ways have center property)
        const latitude = el.lat || (el.center && el.center.lat);
        const longitude = el.lon || (el.center && el.center.lon);
        
        if (!latitude || !longitude) return null;

        return {
          name: el.tags.name || el.tags.amenity || "Unnamed Resource",
          lat: latitude,
          lng: longitude,
          type: el.tags.amenity
        };
      })
      .filter(place => place !== null)
      .filter((place, index, self) => 
        // Remove duplicates based on coordinates
        index === self.findIndex(p => 
          Math.abs(p.lat - place.lat) < 0.0001 && 
          Math.abs(p.lng - place.lng) < 0.0001
        )
      );

    res.json({ 
      lat, 
      lng: lon, 
      places,
      location: geoData[0].display_name 
    });

  } catch (error) {
    console.error("Error in /resources:", error);
    res.status(500).json({ 
      error: "Failed to fetch resources. Please try again." 
    });
  }
});

// Enhanced healthbot endpoint with system prompt optimization
app.post("/healthbot", async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ 
      reply: "I'm receiving too many requests. Please wait a moment before asking again. 😊" 
    });
  }

  const userMessage = req.body.message;

  if (!userMessage || userMessage.trim().length === 0) {
    return res.json({ 
      reply: "Please ask me a question about health, nutrition, or wellness!" 
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer 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",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://healthbridge-ai.example.com",
        "X-Title": "HealthBridge AI"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { 
            role: "system", 
            content: `You are HealthBot, a compassionate and knowledgeable health assistant for underserved communities. Your goal is to:

1. Provide clear, actionable health information in simple language
2. Focus on preventive care and wellness
3. Be culturally sensitive and accessible
4. Encourage seeking professional medical care when appropriate
5. Provide practical tips for nutrition, hygiene, and healthy living

Important guidelines:
- Never provide specific medical diagnoses or treatment plans
- Always recommend consulting healthcare professionals for serious symptoms
- Be empathetic and supportive
- Keep responses concise (2-3 paragraphs maximum)
- Use bullet points for lists
- Encourage free/low-cost health resources when relevant

Remember: You're helping people who may have limited healthcare access, so focus on practical, accessible advice.`
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 
                  "I'm having trouble understanding. Could you rephrase your question?";
    
    res.json({ reply: reply.trim() });

  } catch (error) {
    console.error("Error in /healthbot:", error);
    res.json({ 
      reply: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment. If you have a medical emergency, please call 911 or visit your nearest emergency room. 🏥" 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ HealthBridge AI running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});