/**
 * AI Model Service
 * Integrates Cl      const message = await this.anthropic.messages.create({
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
      });pic) and GPT-4 (OpenAI) for property analysis
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
        model: 'gpt-4o',
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

RENTAL PROPERTY SCORING (100 points):
1. Financial Performance (40 pts)
   - Cash flow potential (15 pts)
   - ROI projections (10 pts)
   - Cap rate (10 pts)
   - Debt coverage ratio (5 pts)

2. Market Position (25 pts)
   - Location desirability (10 pts)
   - Rental demand (10 pts)
   - Price vs market (5 pts)

3. Property Condition (20 pts)
   - Age & maintenance (10 pts)
   - Required repairs (5 pts)
   - Long-term viability (5 pts)

4. Risk Factors (15 pts)
   - Market stability (5 pts)
   - Vacancy risk (5 pts)
   - Management complexity (5 pts)

Provide:
- Overall score (0-100)
- Recommendation: PROCEED (80+), CAUTION (60-79), REJECT (<60)
- Detailed summary (200-300 words)
- 5-7 key findings
- 3-5 risk factors
- 3-5 opportunities
- Financial metrics (if calculable)

Format your response with clear sections and bullet points.`;
    } else {
      return `${basePrompt}

PRIMARY RESIDENCE SCORING (100 points):
1. Lifestyle Fit (35 pts)
   - Location convenience (15 pts)
   - Neighborhood quality (10 pts)
   - Commute & schools (10 pts)

2. Property Value (30 pts)
   - Price vs market (15 pts)
   - Appreciation potential (10 pts)
   - Value for features (5 pts)

3. Living Experience (20 pts)
   - Space & layout (10 pts)
   - Condition & amenities (5 pts)
   - Outdoor space (5 pts)

4. Long-term Considerations (15 pts)
   - Resale potential (8 pts)
   - Maintenance costs (4 pts)
   - Future needs (3 pts)

Provide:
- Overall score (0-100)
- Recommendation: PROCEED (80+), CAUTION (60-79), REJECT (<60)
- Detailed summary (200-300 words)
- 5-7 key findings
- 3-5 risk factors
- 3-5 opportunities

Format your response with clear sections and bullet points.`;
    }
  }

  /**
   * Format property data for AI consumption
   */
  private formatPropertyData(property: PropertyData): string {
    return `
ADDRESS: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
PRICE: $${property.price.toLocaleString()}
BEDROOMS: ${property.bedrooms}
BATHROOMS: ${property.bathrooms}
LIVING AREA: ${property.livingArea.toLocaleString()} sqft
${property.lotAreaValue ? `LOT SIZE: ${property.lotAreaValue.toLocaleString()} ${property.lotAreaUnit}` : ''}
${property.yearBuilt ? `YEAR BUILT: ${property.yearBuilt}` : ''}
${property.propertyType ? `PROPERTY TYPE: ${property.propertyType}` : ''}
${property.zestimate ? `ZESTIMATE: $${property.zestimate.toLocaleString()}` : ''}
${property.rentZestimate ? `RENT ZESTIMATE: $${property.rentZestimate.toLocaleString()}/month` : ''}

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
