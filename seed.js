require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');


const uri = 'mongodb+srv://admin:mirror90@cluster0.fgr94w8.mongodb.net/productivityhub?retryWrites=true&w=majority';
const dbName = 'productivityhub';

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Clear old data
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  // Generate real hash for "password123"
 const hash = '$2a$10$H7C6Ynjv1fJOm0I0FJphve.skrJM5McMvyGBoPi6KPoYEQb4WLKeG';

  // Insert users
  const usersResult = await db.collection('users').insertMany([
    {
      name: 'Alice Khan',
      email: 'alice@example.com',
      passwordHash: hash,
      createdAt: new Date()
    },
    {
      name: 'Bob Shah',
      email: 'bob@example.com',
      passwordHash: hash,
      createdAt: new Date()
    }
  ]);

  const aliceId = usersResult.insertedIds[0];
  const bobId   = usersResult.insertedIds[1];

  // Insert projects
  const projectsResult = await db.collection('projects').insertMany([
    { ownerId: aliceId, name: 'Website Redesign', description: 'Redesign the company website', archived: false, color: '#4f46e5', createdAt: new Date() },
    { ownerId: aliceId, name: 'Mobile App',        description: 'Build iOS app',               archived: false, color: '#0891b2', createdAt: new Date() },
    { ownerId: aliceId, name: 'Old Campaign',       description: 'Last year marketing campaign', archived: true,  createdAt: new Date() },
    { ownerId: bobId,   name: 'Data Pipeline',      description: 'ETL pipeline setup',           archived: false, color: '#059669', createdAt: new Date() }
  ]);

  const p1 = projectsResult.insertedIds[0];
  const p2 = projectsResult.insertedIds[1];
  const p4 = projectsResult.insertedIds[3];

  // Insert tasks
  await db.collection('tasks').insertMany([
    {
      projectId: p1, ownerId: aliceId,
      title: 'Design homepage mockup', status: 'done', priority: 1,
      tags: ['design', 'ui'], dueDate: new Date('2025-05-01'),
      subtasks: [{ title: 'Sketch wireframe', done: true }, { title: 'Get approval', done: true }],
      createdAt: new Date()
    },
    {
      projectId: p1, ownerId: aliceId,
      title: 'Implement navbar', status: 'in-progress', priority: 2,
      tags: ['frontend'],
      subtasks: [{ title: 'Write HTML', done: true }, { title: 'Add CSS', done: false }],
      createdAt: new Date()
    },
    {
      projectId: p1, ownerId: aliceId,
      title: 'SEO audit', status: 'todo', priority: 3,
      tags: ['seo'],
      subtasks: [],
      createdAt: new Date()
    },
    {
      projectId: p2, ownerId: aliceId,
      title: 'Setup React Native', status: 'done', priority: 1,
      tags: ['setup'],
      subtasks: [{ title: 'Install dependencies', done: true }],
      createdAt: new Date()
    },
    {
      projectId: p2, ownerId: aliceId,
      title: 'Build login screen', status: 'todo', priority: 2,
      tags: ['ui', 'auth'],
      subtasks: [{ title: 'Design form', done: false }, { title: 'Hook up API', done: false }],
      createdAt: new Date()
    },
    {
      projectId: p4, ownerId: bobId,
      title: 'Setup Kafka', status: 'in-progress', priority: 1,
      tags: ['backend'],
      subtasks: [{ title: 'Install Kafka', done: true }, { title: 'Write producer', done: false }],
      createdAt: new Date()
    }
  ]);

  // Insert notes
  await db.collection('notes').insertMany([
    { ownerId: aliceId, projectId: p1, title: 'Design Notes',    content: 'Use blue palette',             tags: ['design', 'ui'], createdAt: new Date() },
    { ownerId: aliceId, projectId: p1, title: 'Client Feedback',  content: 'Client wants bigger fonts',   tags: ['feedback'],     createdAt: new Date() },
    { ownerId: aliceId, projectId: null, title: 'General Ideas',  content: 'Ideas for future projects',   tags: ['ideas'],        createdAt: new Date() },
    { ownerId: aliceId, projectId: p2, title: 'App Architecture', content: 'Use Redux for state',         tags: ['architecture'], createdAt: new Date() },
    { ownerId: bobId,   projectId: p4, title: 'Pipeline Docs',    content: 'Document the ETL steps',      tags: ['docs'],         createdAt: new Date() },
    { ownerId: bobId,   projectId: null, title: 'Meeting Notes',  content: 'Q2 planning meeting summary', tags: ['meetings'],     createdAt: new Date() }
  ]);

  console.log('✅ Seeding complete!');
  await client.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
