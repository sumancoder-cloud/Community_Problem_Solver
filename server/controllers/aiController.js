import Problem from "../models/Problem.js";
import Solution from "../models/Solution.js";

const extractText = (responseData) => {
    const candidates = responseData?.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    return parts.map((part) => part.text || "").join("\n").trim();
};

const parseSuggestions = (text) => {
    if (!text) {
        return [];
    }

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item).trim()).filter(Boolean);
            }
        } catch {
            // fall through to line parsing
        }
    }

    return text
        .split(/\n+/)
        .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 5);
};

const buildFallbackSuggestions = (problem) => {
    const area = problem?.location || "your area";
    const title = (problem?.title || "").toLowerCase();
    const description = (problem?.description || "").toLowerCase();
    const text = `${title} ${description}`.trim();
    const suggestions = [];

    const addSuggestion = (value) => {
        if (!suggestions.includes(value)) {
            suggestions.push(value);
        }
    };

    if (text.match(/network|signal|mobile|internet|wifi|telecom|tower/)) {
        addSuggestion(`Report the outage to your telecom provider and request a signal survey for ${area}.`);
        addSuggestion("Ask the provider if nearby towers are down and request a temporary mobile cell-on-wheels.");
        addSuggestion("Collect screenshots of signal strength from multiple users and submit a joint complaint.");
        addSuggestion("Check for scheduled maintenance and share the outage timeline with local officials.");
        addSuggestion("Request a booster/repeater assessment for the most affected street cluster.");
    } else if (text.match(/pothole|road|street|traffic|asphalt/)) {
        addSuggestion("Mark the damaged spot with cones/paint and alert local traffic police for safety.");
        addSuggestion("Submit a municipal road repair ticket with photos and exact coordinates.");
        addSuggestion("Organize a short-term patch using cold mix asphalt until official repairs.");
        addSuggestion("Request an inspection visit and publish the ticket number to track progress.");
        addSuggestion("Coordinate with nearby shops to contribute to warning signage.");
    } else if (text.match(/water|leak|pipe|drain|sewage|flood/)) {
        addSuggestion("Report the leak to the water board with photos and nearby landmark details.");
        addSuggestion("Shut off the local valve if safe and notify neighbors to reduce wastage.");
        addSuggestion("Request emergency patching and a follow-up pipeline inspection.");
        addSuggestion("Place temporary barriers to keep pedestrians away from flooded areas.");
        addSuggestion("Log the complaint ID and share updates with residents in ${area}.");
    } else if (text.match(/garbage|waste|trash|litter/)) {
        addSuggestion("Request an extra waste pickup for ${area} and share photos with sanitation staff.");
        addSuggestion("Organize a weekend cleanup drive with local volunteers and shop owners.");
        addSuggestion("Ask for additional bins or a new pickup schedule for the hotspot.");
        addSuggestion("Post before/after photos to keep the issue visible to authorities.");
        addSuggestion("Coordinate with residents to separate waste and reduce overflow.");
    } else if (text.match(/streetlight|light|lamp/)) {
        addSuggestion("Report the faulty light pole number to the electricity department.");
        addSuggestion("Request a temporary lighting fix for key crossings in ${area}.");
        addSuggestion("Document night-time visibility issues with photos for faster action.");
        addSuggestion("Ask local vendors to provide temporary lighting until repair.");
        addSuggestion("Track the repair ticket and share updates with residents.");
    }

    if (suggestions.length < 5) {
        addSuggestion(`Create a small volunteer group in ${area} and assign weekly action tasks.`);
        addSuggestion("Report the issue to municipal authorities with photo evidence and ticket follow-up.");
        addSuggestion("Collect neighbor signatures and submit a community request to prioritize this issue.");
        addSuggestion("Start a short-term workaround while a permanent fix is arranged.");
        addSuggestion("Share progress updates publicly to keep momentum and accountability.");
    }

    return suggestions.slice(0, 5);
};

export const getAisuggestionsForProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem Not Found" });
        }

        const existingSolutions = await Solution.find({ problemId: problem._id })
            .sort({ votes: -1 })
            .limit(3)
            .select("description votes");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({
                message: "AI service is not configured. Showing practical fallback suggestions.",
                suggestions: buildFallbackSuggestions(problem),
                source: "fallback"
            });
        }

        const prompt = [
            "You are helping a community problem-solving platform.",
            "Suggest 5 practical, low-cost, locally feasible solutions.",
            "Each suggestion must reference a concrete detail from the title, description, or location.",
            "Avoid generic advice and avoid repeating the same suggestions across different problems.",
            "Return only a JSON array of short strings.",
            `Problem title: ${problem.title}`,
            `Problem description: ${problem.description}`,
            `Location: ${problem.location}`,
            existingSolutions.length > 0
                ? `Existing community solutions: ${existingSolutions.map((solution) => solution.description).join(" | ")}`
                : "Existing community solutions: none"
        ].join("\n");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-1.5-flash"}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    maxOutputTokens: 512
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Gemini API error:", response.status, response.statusText, errorText);
            return res.status(200).json({
                message: "AI service is temporarily unavailable. Showing practical fallback suggestions.",
                suggestions: buildFallbackSuggestions(problem),
                source: "fallback",
                error: `Gemini API error ${response.status}`
            });
        }

        const data = await response.json();
        const text = extractText(data);
        const suggestions = parseSuggestions(text);

        if (!suggestions.length) {
            console.log("Gemini response empty:", text);
            return res.status(200).json({
                message: "AI response was empty. Showing practical fallback suggestions.",
                suggestions: buildFallbackSuggestions(problem),
                source: "fallback"
            });
        }

        return res.status(200).json({
            message: "AI suggestions generated successfully",
            suggestions,
            rawText: text,
            source: "gemini"
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            message: "AI generation failed. Showing practical fallback suggestions.",
            suggestions: [
                "Coordinate with nearby residents and create a quick response plan.",
                "Share issue photos and details with local authorities and track updates.",
                "Start a low-cost temporary mitigation until permanent repair is completed.",
                "Ask community volunteers to participate in a short weekend action drive.",
                "Document progress publicly to maintain accountability and momentum."
            ],
            source: "fallback"
        });
    }
};