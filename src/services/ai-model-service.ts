/**
 * AI Model Service
 * Integrates C    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 0.3,
        system: systemPrompt,(Anthropic) and GPT-4 (OpenAI) for property analysis
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { PropertyData, QualityReviewResult, QualityIssue } from '@/src/types/batch-analysis';
import { DomainAnalysisResult } from '@/src/types/domain';

export class AIModelService {
  private anthropic: Anthropic;
  private openai: OpenAI;

  constructor() {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.anthropic = new Anthropic({ apiKey: anthropicKey });
    this.openai = new OpenAI({ apiKey: openaiKey });
  }

  /**
   * Primary Analysis using Claude (Stage 1 of Universal Methodology)
   */
  async analyzePrimaryWithClaude(
    propertyData: PropertyData,
    propertyType: 'primary' | 'rental'
  ): Promise<DomainAnalysisResult> {
    const systemPrompt = this.buildPrimaryAnalysisPrompt(propertyType);
    const propertyDescription = this.formatPropertyData(propertyData);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this property:\n\n${propertyDescription}\n\nProvide a comprehensive ${propertyType} residence analysis.`
          }
        ]
      });

      const content = message.content[0];
      const responseText = content.type === 'text' ? content.text : '';

      // Parse Claude's response into structured format
      const analysisResult = this.parseClaudeResponse(responseText, propertyData, propertyType);

      return analysisResult;
    } catch (error) {
      console.error('Claude analysis error:', error);
      throw new Error(`Primary analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Primary Analysis using GPT-4 (Alternative to Claude)
   */
  async analyzePrimaryWithGPT4(
    propertyData: PropertyData,
    propertyType: 'primary' | 'rental'
  ): Promise<DomainAnalysisResult> {
    const systemPrompt = this.buildPrimaryAnalysisPrompt(propertyType);
    const propertyDescription = this.formatPropertyData(propertyData);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: systemPrompt + '\n\nProvide your analysis in a clear, structured format with sections for score, recommendation, summary, key findings, risk factors, and opportunities.'
          },
          {
            role: 'user',
            content: `Analyze this property:\n\n${propertyDescription}\n\nProvide a comprehensive ${propertyType} residence analysis.`
          }
        ]
      });

      const responseText = completion.choices[0]?.message?.content || '';

      // Parse GPT-4's response into structured format (reuse Claude parser since format is similar)
      const analysisResult = this.parseClaudeResponse(responseText, propertyData, propertyType);

      return analysisResult;
    } catch (error) {
      console.error('GPT-4 analysis error:', error);
      throw new Error(`Primary analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quality Review using GPT-4 (Stage 2 of Universal Methodology)
   */
  async reviewQualityWithGPT4(
    propertyData: PropertyData,
    primaryAnalysis: DomainAnalysisResult
  ): Promise<QualityReviewResult> {
    const systemPrompt = `You are a quality assurance expert reviewing property analyses for accuracy and completeness.

Your task:
1. Verify data accuracy (price, bedrooms, bathrooms, square footage)
2. Check calculation correctness (ROI, cap rate, cash flow)
3. Identify logical flaws or inconsistencies
4. Flag missing critical analysis points
5. Rate overall quality 0-100

IMPORTANT: Missing Zestimate/Rent Zestimate is NOT an error if the analyst:
- Researched comparable market values
- Provided estimated values based on market data
- Explained the estimation methodology
- Used those estimates for scoring and analysis

DO flag as error if:
- Analyst penalized property for missing Zestimate
- Analyst failed to research alternatives
- Analyst gave low scores without market research
- Calculations are clearly wrong

Respond in JSON format:
{
  "overallAssessment": "APPROVED" | "CONCERNS" | "REJECTED",
  "confidenceScore": 0.0-1.0,
  "issues": [
    {
      "severity": "critical" | "major" | "minor",
      "category": "data_accuracy" | "calculation_error" | "logic_flaw" | "missing_analysis" | "inconsistency",
      "description": "Clear description",
      "suggestedCorrection": "How to fix",
      "affectedField": "field name"
    }
  ],
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"],
  "dataAccuracy": {
    "priceVerified": true/false,
    "bedroomsBathroomsVerified": true/false,
    "sqftVerified": true/false,
    "locationVerified": true/false
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Review this property analysis:

PROPERTY DATA:
${JSON.stringify(propertyData, null, 2)}

PRIMARY ANALYSIS:
Score: ${primaryAnalysis.qualityScore}/100
Recommendation: ${primaryAnalysis.recommendation}
Summary: ${primaryAnalysis.analysis.summary}
Key Findings: ${primaryAnalysis.analysis.keyFindings.join(', ')}
Risk Factors: ${primaryAnalysis.analysis.riskFactors.join(', ')}
Opportunities: ${primaryAnalysis.analysis.opportunities.join(', ')}

Provide detailed quality review in JSON format.`
          }
        ]
      });

      const responseText = completion.choices[0].message.content || '{}';
      const reviewData = JSON.parse(responseText);

      const qualityReview: QualityReviewResult = {
        model: 'gpt-4',
        timestamp: new Date(),
        overallAssessment: reviewData.overallAssessment || 'CONCERNS',
        confidenceScore: reviewData.confidenceScore || 0.5,
        issues: reviewData.issues || [],
        suggestions: reviewData.suggestions || [],
        dataAccuracy: reviewData.dataAccuracy || {
          priceVerified: false,
          bedroomsBathroomsVerified: false,
          sqftVerified: false,
          locationVerified: false,
        },
      };

      return qualityReview;
    } catch (error) {
      console.error('GPT-4 quality review error:', error);
      throw new Error(`Quality review failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build primary analysis prompt based on property type
   */
  private buildPrimaryAnalysisPrompt(propertyType: 'primary' | 'rental'): string {
    const basePrompt = `You are an expert real estate analyst specializing in ${propertyType} residence evaluation.

Your analysis must be comprehensive, data-driven, and actionable. Focus on:`;

    if (propertyType === 'rental') {
      return `${basePrompt}

RENTAL PROPERTY SCORING (100 points total):

1. Financial Performance (40 pts)
   - Cash flow potential: 10/15 pts - The high purchase price and low Zestimate value suggest limited cash flow potential.
   - ROI projections: 5/10 pts - With the high purchase price and low Zestimat...
   
2. Market Position (25 pts)
   - Location desirability: 8/10 pts
   - Rental demand: 7/10 pts
   - Price vs market: 3/5 pts

3. Property Condition (20 pts)
   - Age & maintenance: 8/10 pts
   - Required repairs: 4/5 pts
   - Long-term viability: 4/5 pts

4. Risk Factors (15 pts)
   - Market stability: 3/5 pts
   - Vacancy risk: 4/5 pts
   - Management complexity: 3/5 pts

CRITICAL DATA HANDLING:
- If Zestimate or Rent Zestimate is NULL/0/undefined, you MUST:
  1. Research typical home values for similar properties in that city/area
  2. Research typical rental rates for similar properties (bed/bath/sqft) in that market
  3. Use comparable market data to estimate realistic values
  4. Clearly state: "No Zestimate available. Estimated market value based on comparable properties: $XXX,XXX"
  5. DO NOT score low on "Price vs Zestimate" - instead score based on your research
  
- For market research, consider:
  1. City average prices per sqft for similar homes
  2. Rental rates per bedroom in that zip code
  3. Market trends in the area (Arizona real estate, suburb trends)
  4. Recent comparable sales within 5-10 miles

Format each scoring section EXACTLY like the example above with:
- Category name
- Subscore: X/Y pts - Brief explanation

Provide:
- Overall score (0-100) - Sum of all subscores
- Recommendation: PROCEED (80+), CAUTION (60-79), REJECT (<60)
- Detailed summary (200-300 words)
- 5-7 key findings (include market research estimates if Zestimate unavailable)
- 3-5 risk factors
- 3-5 opportunities
- Financial metrics with your estimated values when actual data missing

IMPORTANT: Never penalize a property for missing Zestimate data. Always research and estimate market-appropriate values.`;
    } else {
      return `${basePrompt}

PRIMARY RESIDENCE SCORING (100 points total):

1. Lifestyle Fit (35 pts)
   - Location convenience: 12/15 pts - Great suburban location with easy access
   - Neighborhood quality: 8/10 pts - Established neighborhood in Surprise, AZ
   - Commute & schools: 7/10 pts - Typical suburban commute times

2. Property Value (30 pts)
   - Price vs market: 12/15 pts
   - Appreciation potential: 8/10 pts
   - Value for features: 4/5 pts

3. Living Experience (20 pts)
   - Space & layout: 8/10 pts
   - Condition & amenities: 4/5 pts
   - Outdoor space: 4/5 pts

4. Long-term Considerations (15 pts)
   - Resale potential: 6/8 pts
   - Maintenance costs: 3/4 pts
   - Future needs: 2/3 pts

CRITICAL DATA HANDLING:
- If Zestimate is NULL/0/undefined, you MUST:
  1. Research typical home values in that city/area (Phoenix metro, Surprise AZ, etc.)
  2. Use price per sqft for similar homes in the market
  3. Clearly state: "No Zestimate available. Estimated market value based on comparable properties: $XXX,XXX"
  4. DO NOT penalize "Price vs market" scoring - use your research
  
- For market research, consider:
  1. City average prices per sqft
  2. Recent sales in the zip code
  3. Market trends and appreciation rates
  4. Comparable homes with similar features

Format each scoring section EXACTLY like the example above with:
- Category name
- Subscore: X/Y pts - Brief explanation

Provide:
- Overall score (0-100) - Sum of all subscores
- Recommendation: PROCEED (80+), CAUTION (60-79), REJECT (<60)
- Detailed summary (200-300 words)
- 5-7 key findings (include market research if Zestimate unavailable)
- 3-5 risk factors
- 3-5 opportunities

IMPORTANT: Never penalize a property for missing Zestimate data. Always research and provide market-based estimates.`;
    }
  }

  /**
   * Format property data for AI consumption
   */
  private formatPropertyData(property: PropertyData): string {
    const missingZestimate = !property.zestimate || property.zestimate === 0;
    const missingRentZestimate = !property.rentZestimate || property.rentZestimate === 0;
    
    let dataNote = '';
    if (missingZestimate || missingRentZestimate) {
      dataNote = '\n\n⚠️ MISSING DATA ALERT:';
      if (missingZestimate) dataNote += '\n- Zillow Zestimate: NOT AVAILABLE';
      if (missingRentZestimate) dataNote += '\n- Rent Zestimate: NOT AVAILABLE';
      dataNote += '\n\nYou MUST research comparable market data for similar properties in this area to estimate reasonable values. Do NOT penalize this property for missing Zestimate data.';
    }
    
    return `
ADDRESS: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
PRICE: $${property.price.toLocaleString()}
BEDROOMS: ${property.bedrooms}
BATHROOMS: ${property.bathrooms}
LIVING AREA: ${property.livingArea.toLocaleString()} sqft
${property.lotAreaValue ? `LOT SIZE: ${property.lotAreaValue.toLocaleString()} ${property.lotAreaUnit}` : ''}
${property.yearBuilt ? `YEAR BUILT: ${property.yearBuilt}` : ''}
${property.propertyType ? `PROPERTY TYPE: ${property.propertyType}` : ''}
${property.daysOnMarket ? `DAYS ON MARKET: ${property.daysOnMarket} days${property.daysOnMarket > 60 ? ' (ABOVE AVERAGE - Seller may be motivated)' : ''}` : ''}
${property.priceReduction ? `RECENT PRICE CUT: -$${property.priceReduction.toLocaleString()} (Indicates seller motivation)` : ''}
${property.zestimate ? `ZESTIMATE: $${property.zestimate.toLocaleString()}` : 'ZESTIMATE: Not available'}
${property.rentZestimate ? `RENT ZESTIMATE: $${property.rentZestimate.toLocaleString()}/month` : 'RENT ZESTIMATE: Not available'}${dataNote}

${property.description ? `DESCRIPTION:\n${property.description}` : ''}

${property.features && property.features.length > 0 ? `FEATURES: ${property.features.join(', ')}` : ''}
`.trim();
  }

  /**
   * Parse Claude's response into structured DomainAnalysisResult
   */
  private parseClaudeResponse(
    response: string,
    propertyData: PropertyData,
    propertyType: 'primary' | 'rental'
  ): DomainAnalysisResult {
    // Extract score (look for patterns like "Score: 85" or "85/100")
    const scoreMatch = response.match(/(?:Score|Overall|Rating):\s*(\d+)(?:\/100)?/i) || 
                      response.match(/\b(\d{2})\s*(?:\/\s*100|points?)\b/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;

    // Extract recommendation
    let recommendation: 'PROCEED' | 'CAUTION' | 'REJECT' = 'CAUTION';
    if (score >= 80) recommendation = 'PROCEED';
    else if (score < 60) recommendation = 'REJECT';

    // Extract key findings (look for bullet points or numbered lists)
    const findingsMatches = response.match(/(?:Key Findings?|Highlights?)[\s\S]*?(?=\n\n|\n#|$)/i);
    const findingsText = findingsMatches ? findingsMatches[0] : '';
    const keyFindings = this.extractBulletPoints(findingsText).slice(0, 7);

    // Extract risk factors
    const risksMatches = response.match(/(?:Risk Factors?|Concerns?|Challenges?)[\s\S]*?(?=\n\n|\n#|$)/i);
    const risksText = risksMatches ? risksMatches[0] : '';
    const riskFactors = this.extractBulletPoints(risksText).slice(0, 5);

    // Extract opportunities
    const oppsMatches = response.match(/(?:Opportunities|Positives?|Strengths?)[\s\S]*?(?=\n\n|\n#|$)/i);
    const oppsText = oppsMatches ? oppsMatches[0] : '';
    const opportunities = this.extractBulletPoints(oppsText).slice(0, 5);

    // Extract summary (first substantial paragraph)
    const summaryMatch = response.match(/(?:Summary|Overview|Analysis)[\s:]*\n\n?([\s\S]{100,500}?)(?=\n\n|$)/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : response.substring(0, 300);

    // Calculate confidence based on completeness
    const confidence = Math.min(
      100,
      Math.round(
        (keyFindings.length / 5) * 30 +
        (riskFactors.length / 3) * 20 +
        (opportunities.length / 3) * 20 +
        (summary.length / 200) * 30
      )
    );

    return {
      id: `analysis-${Date.now()}`,
      domainType: 'real-estate',
      qualityScore: score,
      recommendation,
      analysis: {
        summary,
        keyFindings: keyFindings.length > 0 ? keyFindings : ['Analysis in progress'],
        riskFactors: riskFactors.length > 0 ? riskFactors : ['To be determined'],
        opportunities: opportunities.length > 0 ? opportunities : ['To be determined'],
        financialMetrics: this.extractFinancialMetrics(response),
      },
      confidence,
      generatedAt: new Date(),
    };
  }

  /**
   * Extract bullet points from text
   */
  private extractBulletPoints(text: string): string[] {
    const bullets: string[] = [];
    
    // Match various bullet point formats
    const patterns = [
      /^[\s]*[-*•]\s*(.+)$/gm,  // - or * or • bullets
      /^[\s]*\d+\.\s*(.+)$/gm,   // Numbered lists
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const bullet = match[1].trim();
        if (bullet.length > 10 && bullet.length < 200) {
          bullets.push(bullet);
        }
      }
    }

    return bullets;
  }

  /**
   * Extract financial metrics from response
   */
  private extractFinancialMetrics(response: string): Record<string, number> {
    const metrics: Record<string, number> = {};

    // Cap rate
    const capRateMatch = response.match(/(?:cap\s*rate|capitalization\s*rate)[\s:]*(\d+(?:\.\d+)?)\s*%/i);
    if (capRateMatch) metrics.capRate = parseFloat(capRateMatch[1]);

    // ROI
    const roiMatch = response.match(/(?:ROI|return\s*on\s*investment)[\s:]*(\d+(?:\.\d+)?)\s*%/i);
    if (roiMatch) metrics.roi = parseFloat(roiMatch[1]);

    // Cash flow
    const cashFlowMatch = response.match(/(?:cash\s*flow)[\s:]*\$?([\d,]+)/i);
    if (cashFlowMatch) metrics.cashFlow = parseInt(cashFlowMatch[1].replace(/,/g, ''));

    return metrics;
  }
}
