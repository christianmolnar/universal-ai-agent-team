<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Universal AI Agent Team Platform - Copilot Instructions

## Project Context
This is a Universal AI Agent Team Platform designed to create modular, domain-specific AI agent teams for professional analysis across any field (real estate, business, research, etc.).

## Code Standards
- Use TypeScript for all implementations
- Follow modular architecture with clear domain separation
- Implement comprehensive error handling and validation
- Include detailed JSDoc comments for all public methods
- Maintain 85/100+ quality threshold for all outputs

## Architecture Patterns
- Universal Methodology Engine as the core orchestrator
- Domain modules implement standard DomainModule interface
- User feedback integration at every stage of analysis
- Dual-model quality verification for all outputs
- Professional document generation with multiple formats

## Key Components
- Universal Methodology Engine (universal-methodology-engine.ts)
- Domain Module Interface (domain-module.interface.ts)
- User Feedback Integrator (user-feedback-integrator.ts)
- Quality Validation Engine (quality-validation-engine.ts)
- Document Generation Engine (document-generator.ts)

## Domain Module Development
When creating new domain modules:
- Extend BaseDomainModule abstract class
- Implement all required interface methods
- Include user feedback loops in analysis steps
- Provide comprehensive quality validation
- Generate professional documentation outputs

## Quality Standards
- All code must include comprehensive unit tests
- Documentation must be complete and up-to-date
- User interfaces must include feedback and refinement options
- Analysis results must meet 85/100+ quality threshold
- Error handling must be robust and user-friendly

## User Feedback Integration
- Present all intermediate results for user review
- Provide multiple refinement options at each stage
- Allow iterative improvement until user satisfaction
- Maintain history of user feedback for learning
- Enable quick approval for experienced users

## Documentation Requirements
- All public methods require JSDoc documentation
- Include usage examples for complex components
- Maintain up-to-date README files for all modules
- Provide clear setup and installation instructions
- Document all configuration options and parameters
