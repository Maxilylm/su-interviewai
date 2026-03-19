import { NextRequest } from "next/server";

interface GenerateRequest {
  role: string;
  seniority: string;
  techStack?: string;
  focus?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    const { role, seniority, techStack, focus } = body;

    if (!role || !seniority) {
      return Response.json(
        { error: "Missing required fields: role, seniority" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert technical interviewer and hiring manager with 15+ years of experience across top tech companies. You create insightful, role-appropriate interview questions that effectively evaluate candidates.

Rules:
- Questions must be appropriate for the specified seniority level
- Include a mix of question types (technical, behavioral, system design, etc.)
- Rubrics should be specific and actionable
- Follow-up questions should dig deeper into the candidate's understanding
- Difficulty ratings should reflect the seniority level expectations`;

    const userPrompt = `Generate exactly 10 interview questions for the following candidate profile:

**Role:** ${role}
**Seniority:** ${seniority}
${techStack ? `**Tech Stack:** ${techStack}` : ""}
${focus ? `**Focus Area:** ${focus}` : ""}

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "questions": [
    {
      "question": "The interview question text",
      "category": "One of: Technical, Behavioral, System Design, Problem Solving, Domain Knowledge, Leadership, Communication, Culture Fit",
      "difficulty": 3,
      "rubric": "What to look for in the answer: key points, red flags, and what distinguishes good from great answers",
      "followUps": ["Follow-up question 1", "Follow-up question 2"]
    }
  ]
}

IMPORTANT:
- Generate exactly 10 questions
- difficulty is an integer from 1 to 5
- Each question must have 2-3 follow-up questions
- Categories should be varied across the 10 questions
- Rubric should be 2-4 sentences explaining what a strong answer looks like
- Questions should progress from easier to harder
- For ${seniority} level, difficulty should generally range: Junior (1-3), Mid (2-4), Senior (3-5), Lead/Staff (3-5)`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      return Response.json(
        { error: "AI service error. Please try again." },
        { status: 502 }
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "Empty response from AI" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content);

    // Validate and clamp difficulty values
    if (parsed.questions) {
      for (const q of parsed.questions) {
        q.difficulty = Math.max(1, Math.min(5, Math.round(q.difficulty || 3)));
        if (!Array.isArray(q.followUps)) {
          q.followUps = [];
        }
      }
    }

    return Response.json(parsed);
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
