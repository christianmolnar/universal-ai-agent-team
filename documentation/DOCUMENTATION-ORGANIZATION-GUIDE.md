# Documentation Organization Guide

## **PURPOSE**
This guide defines where to place documentation files to maintain clean organization and prevent scattered files across the repository.

---

## **FOLDER STRUCTURE & PLACEMENT RULES**

### **📁 `/documentation/architecture/`**
**What Goes Here:**
- System design documents
- Component architecture specifications
- Integration patterns
- Technical blueprints
- Interface definitions

**File Naming Pattern:**
- `SYSTEM-COMPONENT-ARCHITECTURE.md`
- `INTEGRATION-PATTERN.md`
- `INTERFACE-SPECIFICATION.md`

---

### **📁 `/documentation/examples/`**
**What Goes Here:**
- **FILLED EXAMPLES ONLY** - Real analysis results that demonstrate proven methodology
- Successful deliverables from actual use cases
- Reference implementations showing quality standards
- "Gold standard" outputs that new work should match

**File Naming Pattern:**
- `[DOMAIN]-[USE-CASE]-EXAMPLE.md`
- `PROVEN-[ANALYSIS-TYPE].md`
- `SUCCESSFUL-[DELIVERABLE-TYPE].md`

**DO NOT PUT HERE:**
- Blank templates (those go in `/templates/`)
- Work-in-progress examples
- Failed or low-quality examples

---

### **📁 `/documentation/implementation/`**
**What Goes Here:**
- Step-by-step implementation guides
- Setup and installation instructions
- Configuration procedures
- Deployment documentation
- Environment setup guides

**File Naming Pattern:**
- `SETUP-[COMPONENT].md`
- `DEPLOYMENT-GUIDE.md`
- `CONFIGURATION-[FEATURE].md`

---

### **📁 `/documentation/methodologies/`**
**What Goes Here:**
- **PROCESS DEFINITIONS** - How to do analysis, scoring, validation
- Systematic approaches and frameworks
- Quality validation procedures
- Scoring systems and criteria
- Research and analysis methodologies

**File Naming Pattern:**
- `[DOMAIN]-ANALYSIS-METHODOLOGY.md`
- `[PROCESS-NAME]-METHODOLOGY.md`
- `SCORING-SYSTEM.md`

**Examples:**
- Real estate analysis processes
- Investment evaluation frameworks
- Quality validation procedures
- Link generation strategies

---

### **📁 `/documentation/planning/`**
**What Goes Here:**
- Project roadmaps and timelines
- Feature planning documents
- Requirements gathering
- Strategic planning documents
- Implementation phases

**File Naming Pattern:**
- `PROJECT-ROADMAP.md`
- `FEATURE-REQUIREMENTS.md`
- `IMPLEMENTATION-PHASES.md`

---

### **📁 `/documentation/strategy/`**
**What Goes Here:**
- High-level strategic decisions
- Architectural philosophies
- Development approaches
- Business strategy documents
- Long-term vision documents

**File Naming Pattern:**
- `[STRATEGY-NAME]-STRATEGY.md`
- `DEVELOPMENT-APPROACH.md`
- `BUSINESS-STRATEGY.md`

**Examples:**
- Test-first development strategy
- Quality-first culture strategy
- Clean state management approach

---

### **📁 `/documentation/templates/`**
**What Goes Here:**
- **BLANK TEMPLATES** - Empty templates for creating new analyses
- Reusable document structures
- Financial models (blank)
- Format specifications
- Style guides and standards

**File Naming Pattern:**
- `[ANALYSIS-TYPE]-TEMPLATE.md`
- `[DOCUMENT-TYPE]-FORMAT.md`
- `BLANK-[USE-CASE].md`

**DO NOT PUT HERE:**
- Filled examples (those go in `/examples/`)
- Completed analyses
- Real data or results

---

### **📁 `/documentation/user-guides/`**
**What Goes Here:**
- End-user documentation
- API documentation
- How-to guides for users
- Feature explanations
- Troubleshooting guides

**File Naming Pattern:**
- `GETTING-STARTED.md`
- `API-REFERENCE.md`
- `USER-GUIDE-[FEATURE].md`
- `TROUBLESHOOTING.md`

---

## **PLACEMENT DECISION TREE**

### **❓ "Where does my document go?"**

1. **Is it a filled example showing proven results?**
   - ✅ YES → `/examples/`
   - ❌ NO → Continue to #2

2. **Is it a blank template for creating new work?**
   - ✅ YES → `/templates/`
   - ❌ NO → Continue to #3

3. **Is it defining a process or methodology?**
   - ✅ YES → `/methodologies/`
   - ❌ NO → Continue to #4

4. **Is it about system architecture or design?**
   - ✅ YES → `/architecture/`
   - ❌ NO → Continue to #5

5. **Is it about high-level strategy or approach?**
   - ✅ YES → `/strategy/`
   - ❌ NO → Continue to #6

6. **Is it about implementation steps or setup?**
   - ✅ YES → `/implementation/`
   - ❌ NO → Continue to #7

7. **Is it about project planning or roadmaps?**
   - ✅ YES → `/planning/`
   - ❌ NO → Continue to #8

8. **Is it user-facing documentation?**
   - ✅ YES → `/user-guides/`
   - ❌ NO → **Create new folder or ask for guidance**

---

## **QUALITY STANDARDS FOR DOCUMENTATION**

### **Every Document Must Have:**
```markdown
# Document Title
*Brief description of purpose*

## Purpose/Overview
[What this document accomplishes]

## [Main Sections]
[Organized content]

---
*Last Updated: [Date] | Status: [Draft/Complete/Archived]*
```

### **File Naming Rules:**
- Use UPPERCASE for major words
- Use hyphens (-) to separate words
- Use descriptive names that indicate content
- Avoid abbreviations unless universally understood
- Include document type when helpful

### **Update Requirements:**
- Update "Last Updated" when making changes
- Mark status as Draft/Complete/Archived
- Remove or archive obsolete documents
- Keep naming consistent with folder guidelines

---

## **COMMON MISTAKES TO AVOID**

### **❌ DON'T:**
- Put documents in the root directory
- Mix examples and templates in the same folder
- Create new folders without updating this guide
- Use ambiguous file names
- Leave outdated documents without marking them

### **✅ DO:**
- Follow the decision tree for placement
- Use descriptive file names
- Update this guide when adding new document types
- Keep related documents together
- Mark document status clearly

---

## **WHEN TO CREATE NEW FOLDERS**

**Create a new folder when:**
- You have 5+ documents that don't fit existing categories
- A new domain/feature needs its own documentation space
- The content is fundamentally different from existing folders

**When creating new folders:**
1. Add the new folder to this guide
2. Define what goes in the folder
3. Establish naming patterns
4. Update the decision tree
5. Document the purpose clearly

---

*This guide should be updated whenever new documentation patterns emerge or folder structures change.*
