import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getFinancialAdvice(data: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are MSAVER, a highly intelligent financial assistant. 
        Analyze the following user financial data and provide 3-4 concise, actionable insights.
        Format the response as JSON with an array of objects: [{ "title": "...", "message": "...", "type": "info|warning|success" }]
        
        User Data:
        - Monthly Salary: ₹${data.user.salary}
        - Total Expenses this month: ₹${data.expensesTotal}
        - Active Savings Goals: ${data.savingsCount}
        - Recent Expenses: ${JSON.stringify(data.recentExpenses)}
        
        Insights should focus on:
        1. Spending patterns
        2. Savings opportunities
        3. Budget warnings
        4. Investment tips
      `
    });

    const text = response.text;
    
    // Extract JSON from markdown if needed
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("AI Advice failed", error);
    return [
      { title: "AI Offline", message: "Connect your Gemini API key to get personalized insights.", type: "info" }
    ];
  }
}
