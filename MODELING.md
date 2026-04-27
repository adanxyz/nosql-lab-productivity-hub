# Schema Design — Personal Productivity Hub

---

## 1. Collections Overview

- **users** — Stores account credentials and names. Every other collection references users by their _id.
- **projects** — Stores projects owned by a user. Each project belongs to exactly one user via userId.
- **tasks** — Stores tasks that belong to a project. Contains embedded subtasks and tags arrays.
- **notes** — Stores notes that optionally belong to a project. Can also be standalone (no project).

---

## 2. Document Shapes

### users

{
  _id: ObjectId,
  email: string (required, unique),
  passwordHash: string (required),
  name: string (required),
  createdAt: Date (required)
}

### projects

{
  _id: ObjectId,
  userId: ObjectId (required, references users),
  name: string (required),
  description: string (optional),
  archived: boolean (required, default false),
  color: string (optional),
  createdAt: Date (required)
}

### tasks

{
  _id: ObjectId,
  projectId: ObjectId (required, references projects),
  userId: ObjectId (required, references users),
  title: string (required),
  status: string (required, one of: todo / in-progress / done),
  priority: number (required),
  tags: [string] (required, default empty array),
  subtasks: [{ title: string, done: boolean }] (required, default empty array),
  dueDate: Date (optional),
  createdAt: Date (required)
}

### notes

{
  _id: ObjectId,
  userId: ObjectId (required, references users),
  projectId: ObjectId (optional, references projects, null if standalone),
  title: string (required),
  content: string (required),
  tags: [string] (required, default empty array),
  createdAt: Date (required)
}

---

## 3. Embed vs Reference — Decisions

| Relationship                  | Embed or Reference? | Why? |
|-------------------------------|---------------------|------|
| Subtasks inside a task        | Embed               | Subtasks are owned by the task, always read together, and never queried independently. |
| Tags on a task                | Embed               | Tags are simple strings, small in size, and always needed when the task is loaded. |
| Project -> Task ownership     | Reference           | Tasks store a projectId pointer. Projects are large and queried independently from tasks. |
| Note -> optional Project link | Reference           | A note stores an optional projectId. Notes can exist without any project (null link). |

---

## 4. Schema Flexibility Example

The dueDate field exists on some task documents but not all. In SQL this would require every row to have the column (or store NULL everywhere). In MongoDB, tasks without a due date simply omit the field entirely — no wasted space, no NULL columns. This is useful because not every task has a deadline, and forcing the field would be meaningless for tasks that are open-ended.
