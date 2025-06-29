---
sidebar_position: 15
---

# Application Forms

## Overview

Forms act as a template for applications, containing sections and questions. Forms, sections, and questions each have `Draft` and `Published` versions. Draft versions are editable by the admin and, once published, are copied into an immutable published version that application responses reference. Published questions are called a `Version`, as they _can_ be edited, but each edit creates an immutable version.

### Form Drafts

- **QuestionDraft** - Editable question for draft forms; copied to QuestionVersion when published.
  - **QuestionOptionDraft** - Editable options for draft forms.

- **ApplicationFormDraft** - Represents a draft of a form, containing its metadata and sections.
  - **FormSectionDraft** - Represents a draft of each form section, containing questions
    - **QuestionLinkDraft** - order & reference to a QuestionDraft or Version

### Published Forms

- **ApplicationFormPublished** - Immutable copy of a published draft that can be filled out by users.
  - **FormSectionPublished** - Immutable copy of a form section
    - **PublishedQuestionLink** - order & reference to QuestionVersion

- **QuestionTemplate** - Permanent identifier for questions, used to link together versions.
  - **QuestionVersion** - An immutable version of a question; a new one is created each time the question is edited.
    - **QuestionOptionVersion** - Immutable question options (for multiple choice, dropdown, etc.).

### Application Response

- **ApplicationResponse** - Points to the User and **ApplicationFormPublished**, contains metadata about response.
  - **ResponseAnswer** - Points to PublishedQuestionLink, contains response to question
    - **AnswerOptionSelection** - References a QuestionOption selected by user
    - **FileUpload** - Contains file metadata and location for file upload questions.
