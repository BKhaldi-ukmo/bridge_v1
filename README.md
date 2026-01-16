# Bridge - Language Training Platform for Children

An educational application designed to teach Arabic vocabulary to children through progressive, interactive learning activities with performance tracking.

---

## Training Activities Overview

### Complete 6-Activity Training System

| Activity | Type | Rounds | Progress Range | Description |
|----------|------|--------|-----------------|-------------|
| **Activity 1** | Listening Phase | 5* | 5% → 35% | Audio repetition with image association (auto-completes) |
| **Activity 2** | Visual Recognition L1 | 3 | 35% → 42% | Target image larger (280px), 2 smaller distractors |
| **Activity 3** | Visual Recognition L2 | 3 | 42% → 49% | All equal size (140px), target shifted down (+70px) |
| **Activity 4** | Color-based Matching | 3 | 49% → 56% | Target in one color, both distractors in different matching color |
| **Activity 5** | Wheel Game | 6 | 56% → 76% | Find 1 target among 6 shuffled images (5 different subcategories) |
| **Activity 6** | Speech Recognition | 5 | 76% → 95% | Record audio, compare with reference .m4a file (≥70% confidence required) |
| | **Total Rounds** | **25** | **5% → 95%** | Progressive difficulty with performance tracking |

*Activity 1 auto-completes automatically without manual rounds

---

## Application Schema & User Flow

### User Roles

**Parent** (Primary User)
- Creates account and logs in
- Manages child profiles
- Accesses child performance dashboard
- Initiates training sessions for children
- Views detailed performance reports

**Child** (Secondary User)
- Performs training activities
- Does not have separate login
- Identified through parent selection
- Progress tracked automatically

**Expert/Teacher** (Future Role)
- Can view performance analytics
- May provide feedback or recommendations
- Currently not implemented

---

## Complete User Journey

### 1. Home Page → Authentication

**Flow**: Landing Page → Login/Signup Decision

**Home Page**
- Entry point for all users
- Displays "Login" for returning parents
- Displays "Sign Up" for new parents
- Gradient purple background with centered hero section

**Decision Point**
- If parent has account → Login page
- If new parent → Signup page

---

### 2. Parent Authentication

#### Login Flow (Returning Parent)
1. Parent enters email and password
2. System validates credentials
3. On success → Dashboard
4. On failure → Error message, retry

#### Signup Flow (New Parent)
1. Parent enters email, password, full name (Section 1)
2. Parent enters child name, child age (Section 2)
3. System creates parent account and child profile simultaneously
4. Auto-login after signup
5. Redirects to Dashboard

---

### 3. Parent Dashboard

**Purpose**: Central hub for parent to manage children and training

**Components**
- **Header**: Logo, parent name, logout button (mint-green bar)
- **Child Cards Grid**: Shows all children associated with parent account
- **Action Buttons**: "Start Training", "View Performance" for each child
- **Recent Sessions**: List of recent training sessions

**Interactions**
- Click child card → Select that child for training
- "Start Training" → Choose vocabulary word → Begin Activity 1
- "View Performance" → Analytics dashboard with session history

---

### 4. Word Selection

**Purpose**: Parent selects vocabulary word for training session

**Options**
- Dropdown or card grid of available vocabulary words
- Example: "شورت" (shorts)
- Parent selects word
- System initializes performance tracker for new session

---

### 5. Training Session Begins - Activity 1

**Listening Phase**
- Child sees selected word on screen (e.g., "شورت")
- Hears word audio played 6 times (listening only)
- Then word audio plays 8 more times while image displays (association)
- Auto-completes → Auto-advances to Activity 2

---

### 6. Activity 2 - Visual Recognition (Level 1)

**3 Rounds Loop**
- Round 1-3: Show 3 images with target image larger (280px) and centered, 2 smaller distractors (140px)
- Child clicks target image
- If correct → Show success feedback → Next round
- If incorrect → Show error feedback → Retry same round
- After 3 successful rounds → Auto-advances to Activity 3
- Progress: 35% → 42%

**Metrics Tracked**
- Target image filename
- Success/failure for each round
- Attempt count per round

---

### 7. Activity 3 - Visual Recognition (Level 2)

**3 Rounds Loop**
- Round 1-3: Show 3 equal-sized images (140px), target shifted down (+70px transform)
- All 3 images same size, different items from distractors
- Child clicks target image
- If correct → Show success feedback → Next round
- If incorrect → Show error feedback → Retry same round
- After 3 successful rounds → Auto-advances to Activity 4
- Progress: 42% → 49%

**Metrics Tracked**
- Target image filename
- Success/failure for each round
- Attempt count per round

---

### 8. Activity 4 - Color-based Matching

**3 Rounds Loop**
- Round 1-3: Show 3 equal-sized images (140px), all same size
- Target image: Random color (blue, black, red, green, yellow)
- 2 Distractors: Same color as each other (different from target color)
- Distractors from other subcategories (ensuring color differentiation)
- Child clicks target image (matching by color)
- If correct → Show success feedback → Next round
- If incorrect → Show error feedback → Retry same round
- After 3 successful rounds → Auto-advances to Activity 5
- Progress: 49% → 56%

**Metrics Tracked**
- Target image with color
- Distractor images with color
- Success/failure for each round
- Attempt count per round

---

### 9. Activity 5 - Wheel Game

**6 Rounds Loop**
- Round 1-6: Show 6 randomly shuffled images with 1 target among them
- Target: 1 image from selected category (e.g., 1 dress among other items)
- Distractors: 5 images from different subcategories
- Each round shows different random target
- Target position changes each round (never same position twice)
- Child clicks target image
- If incorrect → Images reshuffle, same target shown again
- If correct → Success feedback, move to next target
- Continue for 6 different target images
- After 6 successful rounds → Auto-advances to Activity 6
- Progress: 56% → 76%

**Metrics Tracked**
- Target image per round
- Success/failure
- Attempts (wrong clicks before correct)
- Reshuffles needed

---

### 10. Activity 6 - Speech Recognition

**5 Rounds Loop**
- Round 1-5: Show target image (e.g., dress)
- System plays "ما هاذا" (What is this?) audio question from common question file
- After audio finishes → Automatic 2-second voice recording starts
- System captures child's audio and compares duration with reference .m4a file
- Confidence score calculated based on audio duration similarity:
  - Within 0.5 sec: 90% confidence
  - Within 1 sec: 80% confidence
  - Within 1.5 sec: 70% confidence
  - Beyond 1.5 sec: 50% confidence
  - Less than 0.5 sec (silence): 30% confidence
- Threshold: ≥70% confidence = correct
- If correct → Show success feedback + confidence % → Next round
- If below threshold → Show error feedback + confidence % → Retry same round
- After 5 successful rounds → Training session complete
- Progress: 76% → 95%

**Metrics Tracked**
- Target image
- Reference audio duration
- Recorded audio duration
- Confidence percentage
- Success/failure
- Attempts per round

---

### 11. Post-Training Report Interface

**After Activity 6 Completion**

**Purpose**: Trainer/Expert fills out formal assessment report

**Form Structure**
- Pure white background, minimalist design
- Header with title "متابعة التدريب على المهارة" (Skill Training Follow-up)
- Three meta fields: Skill name, Session number, Date

**Assessment Grid**
- Hierarchical rows representing training stages
- 5 color-coded buttons per row (First time → Fifth time)
- Categories:
  1. Discrimination & Generalization Stage
     - By Size
     - By Shape
     - By Color
     - Matching
  2. Selection & Accuracy
  3. Pronunciation

**Interaction**
- Click color button to record assessment level
- One selection per row (radio button behavior)
- Save button at bottom ("حفظ التقرير")

**Data Saved**
- Report stored in database
- Linked to parent and child
- Linked to training session

---

### 12. Performance Dashboard (Parent View)

**Purpose**: Parent reviews child's overall progress

**Components**

**Stats Summary**
- Total training sessions completed
- Total correct answers across all activities
- Total attempts across all rounds
- Overall success rate percentage
- Per-activity success rates

**Session History**
- List of all completed training sessions
- Each session shows:
  - Date and time
  - Vocabulary word trained
  - Duration
  - Overall success percentage
  - Expandable details for each activity
  
**Detailed Session View**
- Activity-by-activity breakdown
- Round-by-round results with success/fail badges
- Attempt counts per round
- Green badge = Success
- Red badge = Failed attempts before success

**Navigation**
- Child selector dropdown (if parent has multiple children)
- Back to dashboard button
- Logout button

---

## Data Flow Summary

```
Home Page
    ↓
Parent Login/Signup
    ↓
Parent Dashboard (Select Child)
    ↓
Select Vocabulary Word
    ↓
Activity 1 (Listening) - Auto-complete
    ↓
Activity 2 (Visual Recognition L1) - 5 rounds
    ↓
Activity 3 (Visual Recognition L2) - 5 rounds
    ↓
Activity 4 (Wheel Game) - 5 rounds
    ↓
Activity 5 (Speech Recognition) - 5 rounds
    ↓
Post-Training Report Form
    ↓
Save Session Data + Report to Database
    ↓
Redirect to Performance Dashboard
    ↓
Parent Views Child's Updated Performance
```

---

## Database Schema (Users & Sessions)

### Parent Model
- Email (unique, login credential)
- Password (hashed)
- Full Name
- Created date

### Child Model
- Child Name
- Age
- Parent ID (foreign key)
- Created date

### TrainingSession Model
- Parent ID (foreign key)
- Child Name
- Selected Word (vocabulary)
- Total Duration (seconds)
- Performance Data (JSON with round-by-round metrics)
- Report Data (JSON with assessment responses)
- Created date/timestamp

### Assessment Report Model
- Skill Name
- Session ID (foreign key)
- Date
- Assessment Responses (discrimination_size, discrimination_shape, discrimination_color, discrimination_matching, selection_accuracy, pronunciation)
- Response Level (0-4: First to Fifth time)
- Created date

---

## Current Implementation Status

✓ **Implemented**
- Parent login/signup system
- Child profile management
- All 5 training activities
- Performance data collection
- Performance dashboard
- Post-training report interface (design)
- Session persistence in database

🔲 **Not Yet Implemented**
- Expert/Teacher role login
- Expert performance analytics view
- Automated recommendations based on performance
- Parent notification system
- Multi-language support
- Mobile app (web-only currently)

## Core Concept

Bridge uses a **5-stage learning progression** where children practice vocabulary through:
1. **Listening & Association** - Auditory input with visual reinforcement
2. **Visual Recognition** (Easy) - Identifying target images among distractors
3. **Visual Recognition** (Advanced) - Complex selection with color-based matching
4. **Game-Based Learning** - Interactive wheel game for engagement
5. **Speech Practice** - Pronunciation and recognition validation

## User Flow Diagram

```
START
  ↓
SELECT WORD → LISTENING PHASE (Activity 1)
  ↓
VISUAL EXERCISE LEVEL 1 (Activity 2) - 5 rounds
  ↓
VISUAL EXERCISE LEVEL 2 (Activity 3) - 5 rounds
  ↓
WHEEL GAME (Activity 4) - 5 rounds
  ↓
SPEECH RECOGNITION (Activity 5) - 5 rounds
  ↓
VIEW RESULTS & SAVE PERFORMANCE DATA
  ↓
END
```

## Activity Progression

### Activity 1: Listening Phase
- **Goal**: Build auditory recognition
- **Method**: Play word 6 times, then 8 more times while showing image
- **Duration**: ~40 seconds
- **Success Condition**: Auto-complete after playback

### Activity 2: Visual Recognition (Level 1)
- **Goal**: Identify target among distractors
- **Method**: Show 3 images (target larger, centered)
- **Rounds**: 5 different targets
- **Success Condition**: Click correct image
- **Feedback**: Move to next round or retry

### Activity 3: Visual Recognition (Level 2)
- **Goal**: Advanced matching with color logic
- **Method**: Show 3 equal-sized images with color-name matching
- **Logic**: Target ≠ distractor1 color, but target = distractor2 color
- **Rounds**: 5 different targets
- **Success Condition**: Click correct image
- **Feedback**: Score display and progression

### Activity 4: Wheel Game
- **Goal**: Engagement through interactive gameplay
- **Method**: 6 shuffled images, 1 target at random position
- **Rounds**: 5 different targets
- **On Wrong Click**: Images reshuffle
- **On Correct Click**: Target replaced with new image
- **Success Condition**: Complete all 5 rounds

### Activity 5: Speech Recognition
- **Goal**: Validate pronunciation
- **Method**: Show image → Play "What is this?" → Record speech (2 sec)
- **Rounds**: 5 different words
- **Success Condition**: Recognized word matches target
- **Feedback**: Correct/incorrect with visual indicator

## Post-Training Report Interface

After completing Activity 5, a minimalist mobile reporting interface appears for session documentation.

### Design Specification

**Overall Design**
- Pure white background
- Minimalist, clean aesthetic
- Mobile-first responsive layout
- Mint-green accent color for interactive elements

### Header Section

**Title**
```
متابعة التدريب على المهارة
(Skill Training Follow-up)
```
- Bold Arabic text
- Left-aligned (RTL layout)
- Dark gray color

**Meta Input Fields**
Three horizontal input fields arranged horizontally:
1. المهارة (Skill) - Vocabulary word trained
2. الجلسة (Session) - Session number/ID
3. التاريخ (Date) - Training date

- Thin mint-green borders
- Light background
- Arabic right-to-left text direction
- Required fields validation

### Data Entry Grid

**Structure**: Hierarchical table with color-coded response buttons

**Response Rating Buttons** (5 options per row):
- أول مرة (First time) - Dark Green (#27ae60)
- ثاني مرة (Second time) - Light Green (#2ecc71)
- ثالث مرة (Third time) - Yellow (#f39c12)
- رابع مرة (Fourth time) - Orange (#e67e22)
- خامس مرة (Fifth time) - Red (#e74c3c)

**Row Categories** (Hierarchical structure):

```
1. مرحلة التمييز والتعميم (Discrimination & Generalization)
   └─ بالحجم (By Size)
   └─ بالشكل (By Shape)
   └─ باللون (By Color)
   └─ التطابق (Matching)

2. الانتقاء والدقة (Selection & Accuracy)

3. النطق (Pronunciation)
```

**Interaction Model**
- Click color-coded button to select response
- One selection per row (radio button behavior)
- Visual feedback on selection (button highlight/active state)
- Selected button remains highlighted with darker shade

### Footer

**Save Button**
- Large rectangular button
- Mint-green background (#2ecc71)
- White text: "حفظ التقرير" (Save Report)
- Bottom of screen, full-width with padding
- On click: Validate all fields → Save to database → Show confirmation

### Layout Structure

```
┌─────────────────────────────────────┐
│                                     │
│  متابعة التدريب على المهارة        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ التاريخ │ الجلسة │ المهارة      ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ مرحلة التمييز والتعميم           ││
│  │ بالحجم      [●] [●] [●] [●] [●]││
│  │ بالشكل      [●] [●] [●] [●] [●]││
│  │ باللون      [●] [●] [●] [●] [●]││
│  │ التطابق     [●] [●] [●] [●] [●]││
│  │                                  ││
│  │ الانتقاء والدقة [●] [●] [●] [●] [●]││
│  │                                  ││
│  │ النطق         [●] [●] [●] [●] [●]││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │    حفظ التقرير                   ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Data Storage

Report data saved to database with structure:
```json
{
  "skillName": "شورت",
  "sessionId": "session_123",
  "date": "2026-01-14",
  "responses": {
    "discrimination_size": 2,        // index 0-4 (First to Fifth time)
    "discrimination_shape": 1,
    "discrimination_color": 3,
    "discrimination_matching": 2,
    "selection_accuracy": 0,
    "pronunciation": 1
  },
  "savedAt": "2026-01-14T15:30:00Z"
}
```

### Responsive Behavior

- On small screens: Stack button options vertically with touch-friendly spacing
- On tablets: Display side-by-side button layout
- Input fields: Full-width responsive
- Font sizing: Dynamic scaling with clamp()
- Touch targets: Min 44px height for accessibility

## Design Philosophy

**Style**: Minimalist, clean, modern, and calming
**Primary Colors**: Pure white background with soft mint-green accents
**Logo**: Circular mint-green badge containing white line-art suspension bridge with rising sun
**Typography**: Bold Arabic text in mint-green
**Overall Aesthetic**: Simple, uncluttered, child-friendly

---

## Splash/Welcome Screen

Pure white background centered content:
- Soft mint-green circular logo with white bridge and sun illustration
- Bold Arabic title "جسر اللغة لأطفال طيف التوحد" (Bridge: Language for Autism Spectrum Children) in mint-green
- Clean, modern, calming presence
- Auto-transitions to home page after 2-3 seconds or on tap

---

## Home Page

**Design**: Minimalist landing page following splash screen aesthetic

- Pure white background
- Centered layout with logo at top
- Single bold headline in dark gray/black
- Brief, simple description
- Two action buttons: "Login" and "Sign Up"
- Buttons in mint-green with white text
- Clean spacing, no clutter
- Mobile-optimized full-height view

---

## Login Page

**Design**: Simple, minimal form experience

- Pure white background
- Mint-green logo at top (smaller than splash)
- Clean white form card with subtle mint-green border
- Two input fields: Email, Password
- Minimal labels in dark gray
- Simple "Login" button in mint-green
- "Forgot password?" and signup link below (light text)
- Responsive to mobile screens
- Touch-friendly input sizing

---

## Signup Page

**Design**: Clean, progressive form with minimal visual elements

- Pure white background
- Mint-green logo at top
- Form divided into two simple sections:
  - **Parent Info**: Email, Password, Name (minimalist inputs)
  - **Child Info**: Child Name, Age (simple dropdowns/inputs)
- Section dividers (thin mint-green line)
- Password strength indicator (simple bar, no text clutter)
- Input fields with subtle gray borders turning mint-green on focus
- Simple "Create Account" button in mint-green
- Minimal helper text and validation messages
- Clean, breathing space between elements

---

## Parent Dashboard

**Design**: Uncluttered overview of children and training

- Pure white background
- Mint-green header bar (minimal, clean)
- Logo and parent name/logout button
- Simple child cards layout:
  - Each card white with soft mint-green border
  - Child name and age displayed simply
  - Two action buttons: "Train" and "Performance"
  - Cards stack vertically on mobile
- Recent sessions section (simple list, not cluttered)
- Responsive grid that adapts to screen size

---

## Training Activities (1-5)

**Design**: Clean, focused experience with minimal distractions

- Pure white background
- Mint-green header bar with activity number
- Centered content area
- Activity 1: Large word display, centered image (clean presentation)
- Activities 2-5: Images/content centered and focused
- Simple status text below content
- Progress indicator (light, non-intrusive)
- No unnecessary visual clutter
- Responsive scaling for all screen sizes

---

## Post-Training Report Interface

**Design**: Minimalist assessment form

- Pure white background
- Mint-green title "متابعة التدريب على المهارة" (simple, centered)
- Three minimal input fields with mint-green borders:
  - Skill, Session, Date (clean layout)
- Assessment grid with subtle rows (light gray separators)
- Row categories in dark text, minimalist
- Five color-coded buttons per row (first through fifth attempt)
  - Dark Green → Light Green → Yellow → Orange → Red
  - Simple circular buttons, clean design
  - One selection per row
- Large mint-green "Save Report" button at bottom
- No extra decoration or complexity

---

## Performance Dashboard

**Design**: Clean analytics presentation

- Pure white background
- Mint-green header with logo
- Simple stats cards (white cards with mint-green accents):
  - Total Sessions
  - Correct Answers
  - Total Attempts
  - Success Rate
- Session list (simple white cards, minimal information)
- Activity breakdown (clean table or list format)
- Success/fail badges (simple green/red indicators)
- Child selector dropdown (minimalist)
- Responsive card layout for mobile

---

## Design Principles Applied Across All Pages

1. **White Space**: Generous margins, breathing room between elements
2. **Color Palette**: Pure white background, mint-green accents only
3. **Typography**: Bold Arabic text, clear hierarchy, minimal font weights
4. **Components**: Simple buttons, input fields, cards (no shadows or complexity)
5. **Interactions**: Smooth transitions, mint-green focus states
6. **Responsiveness**: Mobile-first approach, adapts seamlessly to all screens
7. **Accessibility**: Large touch targets, high contrast, RTL text direction
8. **Focus**: Child-centric, calming, distraction-free experience

---

## Splash/Welcome Screen

## Data Collection Scheme

### Per-Round Metrics
```
{
  round: 1-5,
  targetImage: "filename.png",
  successful: true/false,
  attempts: number,
  trialsBeforeSuccess: number,
  fails: number
}
```

### Per-Activity Summary
```
{
  activityNumber: 1-5,
  activityName: "Activity Name",
  rounds: [round data...],
  totalAttempts: number,
  successCount: number,
  successRate: percentage
}
```

### Session Data
```
{
  word: "شورت",
  childName: "Ahmed",
  startTime: timestamp,
  totalDuration: seconds,
  activities: [activity summaries...],
  overallSuccessRate: percentage
}
```

## Dashboard Analytics

### Child Performance View
- **Total Sessions**: Count of completed trainings
- **Correct Answers**: Total successful selections
- **Total Attempts**: All tries across all rounds
- **Success Rate**: Overall percentage
- **Activity Breakdown**: Per-activity statistics

### Session Details
- Session timestamp
- Word trained
- Activity-by-activity results
- Success/fail badges for each round
- Attempt counts

## Core Architecture Ideas

### State Management
- **Per-Activity State**: Track progress within each activity
- **Session State**: Store child info, word, start time
- **Performance State**: Accumulate metrics as user progresses

### Activity Control Flow
```
Load Activity → Display UI → Capture Interaction → Validate Answer → 
  Update Metrics → Check Round Complete → Check Activity Complete → 
  Next Activity or Results
```

### Image Organization
```
/items/
  ├── [word1]/
  │   └── [word1]_[color]_[variant].png
  ├── [word2]/
  │   └── [word2]_[color]_[variant].png
```

### Audio Assets
- **Word Audio**: Individual word pronunciation (شورت.m4a)
- **Question Audio**: Generic prompt (ما هاذا .m4a)
- **Feedback Audio**: Success sound (correct-6033.mp3)

## Feature Ideas

### Current Implementation
✓ Multi-stage progressive learning
✓ Visual image recognition with difficulty scaling
✓ Audio playback and speech recognition
✓ Round-by-round performance tracking
✓ Session-based metrics collection
✓ Admin dashboard for progress viewing
✓ Responsive mobile design

### Potential Expansions
- User authentication & profiles
- Multiple vocabulary sets
- Leaderboard / gamification
- Parent notifications
- Achievement badges
- Difficulty adjustments based on performance
- Multi-language support
- Teacher admin panel
- Export & print reports
