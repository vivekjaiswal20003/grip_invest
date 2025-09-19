const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generateContent = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content with Google Gemini:", error);
    // Re-throw the error to be handled by the calling function
    throw new Error('AI content generation failed.');
  }
};

const checkPasswordStrength = async (password) => {
  const prompt = `Classify the strength of this password as \"Weak\", \"Medium\", or \"Strong\" and provide a brief suggestion for improvement (e.g., \"Add special characters\"): ${password}. Respond only with the classification and suggestion, no conversational filler.`;
  return generateContent(prompt);
};

const generateProductDescription = async (productDetails) => {
  const { name, investmentType, tenureMonths, annualYield, riskLevel } = productDetails;
  const prompt = `Generate a concise and engaging investment product description based on the following details:
  Name: ${name}
  Type: ${investmentType}
  Tenure: ${tenureMonths} months
  Annual Yield: ${annualYield}%
  Risk Level: ${riskLevel}

  Focus on benefits for the investor. Keep it under 100 words.`;
  return generateContent(prompt);
};

const getProductRecommendations = async (userRiskAppetite, allProducts, userInvestments) => {
  const productList = allProducts.map(p => `- ID: ${p.id}, Name: ${p.name} (Risk: ${p.riskLevel}, Yield: ${p.annualYield}%)`).join('\n');
  const investmentList = userInvestments.length > 0 
    ? userInvestments.map(inv => `- ${inv.product.name} (${inv.amount})`).join('\n')
    : 'None';

  const prompt = `
    You are an expert financial advisor for Grip Invest.
    A user with a '${userRiskAppetite}' risk appetite is looking for investment recommendations.

    Here is the user\'s current portfolio:
    ${investmentList}

    Here are the available products they can invest in:
    ${productList}

    Please recommend 3 to 5 products that would be a good fit for their risk appetite and would help diversify their portfolio. For each recommendation, provide the product ID, product name, a compelling reason why it\'s a good choice for this specific user, and the expected annual yield.

    Return your response as a valid JSON array, where each object has the following keys: "productId", "productName", "reason", "annualYield". Do not include any text outside of the JSON array.

    Example format:
    [
      {
        "productId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        "productName": "Stable Bond Fund",
        "reason": "This fund aligns with your low-risk appetite and provides stable returns. It\'s a great way to balance your portfolio.",
        "annualYield": "6.00%"
      }
    ]
  `;


  try {
    const jsonResponse = await generateContent(prompt);
    console.log("Raw AI Response:", jsonResponse);
    
    // The response might come with markdown formatting, so we clean it up
    const startIndex = jsonResponse.indexOf('[');
    const endIndex = jsonResponse.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Invalid JSON response from AI');
    }
    const jsonString = jsonResponse.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse AI recommendation response:", e.message);
    // Throw an error that the controller can catch
    throw new Error('Failed to get recommendations from AI service.');
  }
};

const getPortfolioRiskSummary = async (portfolioData) => {
  const investmentsSummary = portfolioData.investments.map(inv =>
    `- Product: ${inv.product.name}, Type: ${inv.product.investmentType}, Amount: ${inv.amount}, Risk: ${inv.product.riskLevel}`
  ).join('\n');

  const prompt = `Analyze the following investment portfolio and provide a concise summary of the user's risk exposure. Highlight any potential areas of concern or diversification opportunities.

Portfolio Summary:
Total Invested: ${portfolioData.totalInvested}
Total Expected Return: ${portfolioData.totalExpectedReturn}
Number of Investments: ${portfolioData.numberOfInvestments}

Investments:
${investmentsSummary}

Risk Exposure Summary:`;
  return generateContent(prompt);
};

const summarizeError = async (errorMessage) => {
  const prompt = `Summarize the following error message concisely, identifying the core issue if possible. Keep the summary under 50 words.

Error Message:
${errorMessage}

Summary:`;
  return generateContent(prompt);
};

module.exports = {
  checkPasswordStrength,
  generateProductDescription,
  getProductRecommendations,
  getPortfolioRiskSummary,
  summarizeError
};
